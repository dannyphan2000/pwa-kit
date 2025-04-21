/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useRef} from 'react'
import {useBlockNavigation, useRoutes} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useUrlMapping} from '@salesforce/commerce-sdk-react'
import { useLocation,  Redirect } from 'react-router-dom'
import {
    useApplicationExtensionsStore
} from '@salesforce/pwa-kit-extension-sdk/react'
type SeoHOCProps = React.ComponentPropsWithoutRef<any>

// (JEREMY) temporary solution for turning something like /global/en-GB/category/womens-jewelry-necklaces to /category/womens-jewelry-necklaces
const removeLocalePrefix = (url: string): string => {
    return url.replace(/^\/global\/[a-z]{2}-[A-Z]{2}/, '')
}

const seoHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {

    const SeoHOC: React.FC<P> = (props: SeoHOCProps) => {
        const location = useLocation()
        const {routes, setRoutes} = useRoutes()
        const [urlSegment, setUrlSegment] = useState(removeLocalePrefix(location.pathname))
        const resolveRef = useRef<(result?: object) => void>()

        const {refetch} = useUrlMapping(
            {
                parameters: {
                    urlSegment: urlSegment,
                    siteId: 'RefArch',
                    locale: 'en-US'
                }
            },
            {
                cacheTime: 0,
                staleTime: 0,
                enabled: false
            }
        )

        useEffect(() => {
            const fetchData = async () => {
                if (urlSegment) {
                    const result = await refetch()
                    if (resolveRef.current) {
                        if (result.status === 'error') {
                            resolveRef.current(undefined)
                        } else {
                            if (result.data?.destinationUrl) {
                                // TODO: don't hardcode /global/en-GB
                                resolveRef.current({
                                    destinationPath: "/global/en-GB" + result.data.destinationUrl,
                                    destinationUrl: result.data.destinationUrl,
                                    resourceType: result.data.resourceType
                                })
                            } else {
                                resolveRef.current(undefined)
                            }
                        }
                    }

                }
            }
            fetchData()
        }, [urlSegment])

        const {isBlocked: isNavigationBlocked} = useBlockNavigation(async (location, action) => {
            const urlMappingResponse = await new Promise<object | undefined>((resolve, reject) => {
                const nextSegment = removeLocalePrefix(location.pathname)
                // So that this promise can be resolved and navigation is unblocked outside this function
                resolveRef.current = resolve
                setUrlSegment(nextSegment)
            })
            console.log("(JEREMY) urlMappingResponse: ", urlMappingResponse)
            // If no redirect rule exists, go to original url
            if (urlMappingResponse === undefined) {
                return location
            }
            let Component
            let props
            // If the Redirect type is URL do a Redirect, else load matching component
            if (!urlMappingResponse.resourceType) {
                Component = Redirect
                console.log("(JEREMY) AAA Redirecting to ", urlMappingResponse.destinationUrl)
                props = {
                    to: urlMappingResponse.destinationUrl
                }

            } else {
                console.log("(JEREMY) over here")
                // const resourceableComponents = {
                //     category: ProductList,
                //     product: ProductDetail
                // }
                // // See how to get ProductList, ProductDetail. 
                // Component = resourceableComponents[urlMappingResponse.resourceType]
                // props = {
                //     [`${urlMappingResponse.resourceType}Id`]: urlMappingResponse.resourceId
                // }
            }
            console.log("(JERMEY) location.pathname: ", location.pathname)
            setRoutes([
                {
                    path: location.pathname,
                    component: () => <Component {...props} onRedirect={() => {
                        console.log("(JEREMY) Redirecting......")
                    }}/>
                },
                ...routes
            ])
            // console.log("(JEREMY) redirectObject: ", redirectObject)
            return location.pathname
        })

        const setIsNavigationBlocked = useApplicationExtensionsStore((state) => {
            return state.state['@salesforce/extension-commerce-bm-seo']?.setIsNavigationBlocked
        })
        console.log("(JEREMY) isNavigationBlocked in seo HOC: ", isNavigationBlocked)
        setIsNavigationBlocked(isNavigationBlocked)

        return <WrappedComponent {...(props as P)} />
    }

    return SeoHOC
}

export default seoHOC
