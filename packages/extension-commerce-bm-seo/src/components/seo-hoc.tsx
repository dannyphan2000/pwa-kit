/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useRef} from 'react'
import {useBlockNavigation, useRoutes} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useUrlMapping} from '@salesforce/commerce-sdk-react'
import {useLocation, Redirect} from 'react-router-dom'
import {useApplicationExtensionsStore} from '@salesforce/pwa-kit-extension-sdk/react'
import {useExtensionConfig} from '../hooks/use-extension-config'
type SeoHOCProps = React.ComponentPropsWithoutRef<any>

interface UrlMappingResponse {
    resourceType?: string
    resourceId?: string
    destinationUrl?: string
}

const getComponent = (
    routes: Array<{component: React.ComponentType<any> | undefined; path: string}>,
    resourceTypeToComponentMap: {[key: string]: string},
    resourceType: string
) => {
    const ComponentClass = routes.find((_route) =>
        _route.component?.displayName?.includes(resourceTypeToComponentMap[resourceType])
    )?.component
    return ComponentClass
}

const seoHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const SeoHOC: React.FC<P> = (props: SeoHOCProps) => {
        const location = useLocation()
        const {routes, setRoutes} = useRoutes()
        const {resourceTypeToComponentMap} = useExtensionConfig()
        const [urlSegment, setUrlSegment] = useState(location.pathname)
        const {setIsNavigationBlocked, siteLocale} = useApplicationExtensionsStore((state) => {
            return state.state['@salesforce/extension-commerce-bm-seo']
        })

        const resolveRef = useRef<(result?: object) => void>()
        // Disabling the hook on render so it's only called when refetch is called
        const {refetch} = useUrlMapping(
            {
                parameters: {
                    urlSegment: urlSegment,
                    locale: siteLocale
                }
            },
            {
                enabled: false
            }
        )

        useEffect(() => {
            const fetchData = async () => {
                if (!urlSegment) return
                const result = await refetch()
                if (!resolveRef.current) return
                if (!result || result.status === 'error') {
                    resolveRef.current(undefined)
                    return
                }
                if (result.data?.destinationUrl) {
                    resolveRef.current(result.data)
                } else {
                    resolveRef.current(undefined)
                }
            }
            void fetchData().catch(console.error)
        }, [urlSegment])

        const {isBlocked: isNavigationBlocked} = useBlockNavigation(
            async (location: Location, _: string) => {
                const urlMappingResponse = await new Promise<UrlMappingResponse | undefined>(
                    (resolve, __) => {
                        const nextSegment = location.pathname
                        // So that this promise can be resolved and navigation is unblocked outside this function
                        resolveRef.current = resolve
                        setUrlSegment(nextSegment)
                    }
                )
                // If no redirect rule exists, go to original url
                if (urlMappingResponse === undefined) {
                    return
                }
                let Component
                let props
                // If the Redirect type is URL do a Redirect, else load matching component
                if (!urlMappingResponse.resourceType) {
                    Component = Redirect
                    props = {
                        to: urlMappingResponse.destinationUrl
                    }
                } else {
                    Component = getComponent(
                        routes,
                        resourceTypeToComponentMap,
                        urlMappingResponse.resourceType
                    )
                    props = {
                        [`${urlMappingResponse.resourceType}Id`]: urlMappingResponse.resourceId
                    }
                }
                setRoutes([
                    {
                        path: location.pathname,
                        component: () => <Component {...props} />
                    },
                    ...routes
                ])
            }
        )

        // Inform other areas of the app (e.g. other extensions) when navigation is being blocked by SEO logic
        useEffect(() => {
            setIsNavigationBlocked(isNavigationBlocked)
        }, [isNavigationBlocked])

        return <WrappedComponent {...(props as P)} />
    }

    return SeoHOC
}

export default seoHOC
