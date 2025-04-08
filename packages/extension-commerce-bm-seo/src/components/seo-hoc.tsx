/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useRef} from 'react'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useUrlMapping} from '@salesforce/commerce-sdk-react'
import { useLocation, useHistory } from 'react-router-dom'
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
        // whenever theres a link change this initial state seems to get set again
        const [urlSegment, setUrlSegment] = useState(removeLocalePrefix(location.pathname))
        const resolveRef = useRef<(result?: string) => void>()
        console.log("(JEREMY) urlSegment state: ", urlSegment)

        const {data: urlMappingResult, isLoading, refetch, isFetching, status, isSuccess} = useUrlMapping(
            {
                parameters: {
                    urlSegment: urlSegment,
                    siteId: 'RefArch',
                    locale: 'en-US'
                }
            },
            {
                cacheTime: 0,  // Prevents caching (removes from cache immediately)
                staleTime: 0,  // Forces refetch every time
                enabled: false
            }
        )

        useEffect(() => {
            const fetchData = async () => {
                if (urlSegment) {
                    const result = await refetch()
                    if (resolveRef.current) {
                        if (result.data?.destinationUrl) {
                            resolveRef.current("/global/en-GB" + result.data.destinationUrl)
                        } else {
                            resolveRef.current(undefined)
                        }
                        resolveRef.current = undefined
                    }
                }
            }
            fetchData()
        }, [urlSegment])

        const {isBlocked: isNavigationBlocked} = useBlockNavigation((location, action, signal) => {
            return new Promise<string | undefined>((resolve, reject) => {
                const nextSegment = removeLocalePrefix(location.pathname)
                // So that this promise can be resolved and navigation is unblocked outside this function
                resolveRef.current = resolve
                setUrlSegment(nextSegment)
            })
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
