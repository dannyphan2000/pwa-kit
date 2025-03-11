/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {withLegacyGetProps} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props'
import {withReactQuery} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'
import AppConfig from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/_app-config'

const isServerSide = typeof window === 'undefined'

// Recommended settings for PWA-Kit usages.
// NOTE: they will be applied on both server and client side.
const options = {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                refetchOnWindowFocus: false,
                staleTime: 2 * 1000,
            }
        }
    },
    beforeHydrate: (data) => {
        const now = Date.now()

        // Helper to reset the data timestamp to time of app load.
        const updateQueryTimeStamp = ({state}) => {
            state.dataUpdatedAt = now
        }

        // Update serialized mutations and queries to ensure that the cached data is
        // considered fresh on first load.
        data?.mutations?.forEach(updateQueryTimeStamp)
        data?.queries?.forEach(updateQueryTimeStamp)

        return data
    }
}

export default withReactQuery(withLegacyGetProps(AppConfig), options)
