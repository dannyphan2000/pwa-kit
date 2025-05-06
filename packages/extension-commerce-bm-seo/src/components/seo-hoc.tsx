/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useRef} from 'react'
import {useBlockNavigation, useRoutes} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useUrlMapping} from '@salesforce/commerce-sdk-react'
import {useLocation, Redirect, matchPath} from 'react-router-dom'
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

/**
 * Checks whether the given URL path matches a predefined route defined in the application's routes config, excluding the catch-all route (e.g., path='*')
 */
const isRouteDefined = (routeToMatch: string, routes: Array<{path: string}>): boolean => {
    // Check for multiple wildcard routes
    const wildcardRoutes = routes.filter((route) => route.path.endsWith('*'))
    if (wildcardRoutes.length > 1) {
        console.warn(
            `Multiple wildcard routes detected (${wildcardRoutes.length}). This may cause unexpected routing behavior. Wildcard routes:`,
            wildcardRoutes.map((route) => route.path)
        )
    }

    // Exclude any catch-all (404) routes and paths ending with wildcards
    const validRoutes = routes.filter((route) => !route.path.endsWith('*'))

    const matchingRoute = validRoutes.find(({path}) =>
        matchPath(routeToMatch, {
            path,
            exact: true
        })
    )
    return matchingRoute !== undefined
}

enum RoutingMode {
    ROUTER_FIRST = 'router_first',
    API_FIRST = 'api_first'
}

const seoHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const SeoHOC: React.FC<P> = (props: SeoHOCProps) => {
        const location = useLocation()
        const {routes, setRoutes} = useRoutes()
        const {resourceTypeToComponentMap, routingMode} = useExtensionConfig()
        const [urlSegment, setUrlSegment] = useState(location.pathname)
        const {setIsNavigationBlocked, siteLocale} = useApplicationExtensionsStore((state) => {
            return state.state['@salesforce/extension-commerce-bm-seo']
        })
        const resolveRef = useRef<(result?: object) => void>()

        // The `routingMode` configuration determines whether we check the ROUTER (AKA the predefined route config) first or the `getUrlMapping` API
        // RoutingMode.ROUTER_FIRST: if `location.pathname` matches a predefined route, skip the `getUrlMapping` API call
        // RoutingMode.API_FIRST: always call `getUrlMapping`
        const skipMappingCall =
            routingMode === RoutingMode.ROUTER_FIRST && isRouteDefined(location.pathname, routes)
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
                if (!urlSegment) {
                    return
                }
                if (skipMappingCall) {
                    return
                }
                const result = await refetch()
                if (resolveRef.current) {
                    if (result.status === 'error') {
                        resolveRef.current(undefined)
                    } else {
                        if (result.data?.destinationUrl) {
                            resolveRef.current(result.data)
                        } else {
                            resolveRef.current(undefined)
                        }
                    }
                }
            }
            void fetchData().catch(console.error)
        }, [urlSegment, skipMappingCall])

        const {isBlocked: isNavigationBlocked} = useBlockNavigation(
            async (location: Location, _: string) => {
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

        useEffect(() => {
            setIsNavigationBlocked(isNavigationBlocked)
        }, [isNavigationBlocked])

        return <WrappedComponent {...(props as P)} />
    }

    return SeoHOC
}

export default seoHOC
