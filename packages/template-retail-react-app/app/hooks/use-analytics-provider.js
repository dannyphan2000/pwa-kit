/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useEffect, useCallback} from 'react'

// Providers
import useEinstein from '@salesforce/retail-react-app/app/hooks/use-einstein'
import useDataCloud from '@salesforce/retail-react-app/app/hooks/use-datacloud'
import useActiveData from '@salesforce/retail-react-app/app/hooks/use-active-data'

/**
 * Custom hook for sending analytics events to multiple providers
 */
const useAnalyticsProvider = () => {
    const einstein = useEinstein()
    const dataCloud = useDataCloud()
    const activeData = useActiveData()

    const analyticsProviders = [einstein, dataCloud, activeData]

    const sendEvent = useCallback((eventName, metadata = {}) => {
        analyticsProviders.forEach(provider => {
            if (provider?.eventName) {
                provider.eventName(metadata)
            }
        })
    })

    return {
        // Datacloud
        sendViewPage: (metadata) => sendEvent('sendViewPage', metadata),
        sendViewProduct: (metadata) => sendEvent('sendViewProduct', metadata),
        sendViewCategory: (metadata) => sendEvent('sendViewCategory', metadata),
        sendViewSearch: (metadata) => sendEvent('sendViewSearch', metadata),
        sendViewRecommendations: (metadata) => sendEvent('sendViewRecommendations', metadata),
        // Einstein
        sendClickSearch: (metadata) => sendEvent('sendClickSearch', metadata),
        sendClickCategory: (metadata) => sendEvent('sendClickCategory', metadata),
        sendBeginCheckout: (metadata) => sendEvent('sendBeginCheckout', metadata),
        sendCheckoutStep: (metadata) => sendEvent('sendCheckoutStep', metadata),
        sendClickRecommendations: (metadata) => sendEvent('sendClickRecommendations', metadata),
        sendAddToCart: (metadata) => sendEvent('sendAddToCart', metadata),
        // Active Data
        trackPage: (metadata) => sendEvent('trackPage', metadata)
    }
}

export default useAnalyticsProvider
