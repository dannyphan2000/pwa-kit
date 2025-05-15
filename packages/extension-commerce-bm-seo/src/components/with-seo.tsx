/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useRef} from 'react'
import {useBlockNavigation, useRoutes} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useUrlMapping, useConfig} from '@salesforce/commerce-sdk-react'
import {useLocation, Redirect} from 'react-router-dom'
import {useApplicationExtensionsStore} from '@salesforce/pwa-kit-extension-sdk/react'
import {useExtensionConfig} from '../hooks/use-extension-config'
import {getComponentForResourceType} from '../utils/routes-utils'
import {UrlMappingResponse} from '../types'
import {matchPath} from '../utils/route-match-utils'
import {ROUTING_MODE} from '../constants'
import type {Config} from '../types/config'

type WithSeoProps = React.ComponentPropsWithoutRef<any>

const withSeo = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithSeo: React.FC<P> = (props: WithSeoProps) => {
        const location = useLocation()
        const {routes, setRoutes} = useRoutes()
        const {resourceTypeToComponentMap, routingMode} = useExtensionConfig() as Config
        const siteConfig = useConfig()
        const [urlSegment, setUrlSegment] = useState(location.pathname)
        const {setIsNavigationBlocked} = useApplicationExtensionsStore((state) => {
            return state.state['@salesforce/extension-commerce-bm-seo']
        })
        const resolveRef = useRef<(result?: object) => void>()

        // If routingMode is "router_first" and a predefined route matches, skip the getUrlMapping API call.
        const skipMappingCall = Boolean(
            routingMode === ROUTING_MODE.ROUTER_FIRST &&
                matchPath(location.pathname, routes, {filterWildcardRoutes: true})
        )

        // Disabling the hook on render so it's only called when refetch is called
        const {refetch} = useUrlMapping(
            {
                parameters: {
                    urlSegment: urlSegment,
                    locale: siteConfig.locale
                }
            },
            {
                enabled: false
            }
        )

        useEffect(() => {
            const fetchData = async () => {
                if (!urlSegment) {
                    return
                }
                if (skipMappingCall) {
                    return
                }
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
        }, [urlSegment, skipMappingCall])

        // Helper to set the route for a given urlMappingResponse
        const addComponentToRoutes = (location: Location, urlMappingResponse: any) => {
            let Component: React.ComponentType<any> | undefined
            let componentProps: Record<string, any> = {}
            // If the Redirect type is URL do a Redirect, else load matching component
            if (!urlMappingResponse.resourceType) {
                Component = Redirect
                componentProps = {
                    to: urlMappingResponse.destinationUrl
                }
            } else {
                Component = getComponentForResourceType(
                    routes,
                    resourceTypeToComponentMap,
                    urlMappingResponse.resourceType
                )
                componentProps = {
                    [`${String(urlMappingResponse.resourceType)}Id`]: urlMappingResponse.resourceId
                }
            }
            setRoutes([
                {
                    path: location.pathname,
                    component: () => (Component ? <Component {...componentProps} /> : null)
                },
                ...routes
            ])
        }

        // Call the Url Mapping API and add the mapped component to the routes
        const handleNavigationBlock = async (location: Location) => {
            // Early exit if configured to check the Router Context first and found a matching route
            if (skipMappingCall) {
                return
            }
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
            addComponentToRoutes(location, urlMappingResponse)
        }

        const {isBlocked: isNavigationBlocked} = useBlockNavigation(
            async (location: Location, _: string) => handleNavigationBlock(location)
        )

        // Inform other areas of the app (e.g. other extensions) when navigation is being blocked by SEO logic
        useEffect(() => {
            setIsNavigationBlocked(isNavigationBlocked)
        }, [isNavigationBlocked])

        return <WrappedComponent {...(props as P)} />
    }

    return WithSeo
}

export default withSeo
