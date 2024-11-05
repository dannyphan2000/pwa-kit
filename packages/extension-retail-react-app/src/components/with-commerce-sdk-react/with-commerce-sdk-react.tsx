/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {ReactQueryDevtools} from '@tanstack/react-query-devtools'

// Platform Imports
import {CommerceApiProvider} from '@salesforce/commerce-sdk-react'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {proxyBasePath} from '@salesforce/pwa-kit-runtime/utils/ssr-namespace-paths'
import {useCorrelationId} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {useServerContext} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import createLogger from '@salesforce/pwa-kit-runtime/utils/logger-factory'


// Define a type for the HOC props
type WithCommerceSDKReactProps = {
    shortCode: string,
    clientId: string,
    organizationId: string,
    siteId: string,
    locale: string,
    currency: string,
    redirectURI: string,
    proxy: string,
    headers: Record<string, string>,
    OCAPISessionsURL: string,
    logger: any
}

// Define the HOC function
const withCommerceSDKReact = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithCommerceSDKReact: React.FC<P> = (props: WithCommerceSDKReactProps) => {
        
        const {req} = useServerContext()
        if (req) {
            // console.log('request: ', req)
        }

        const config = {
            proxyPath: "/mobify/proxy/api",
            parameters: {
                clientId: "c9c45bfd-0ed3-4aa2-9971-40f88962b836",
                organizationId: "f_ecom_zzrf_001",
                shortCode: "8o7m175y",
                siteId: "RefArch"
            }
          }

        const appOrigin = getAppOrigin()
        const siteId = config?.parameters?.siteId || 'RefArch'
        const localeId = 'en-US'
        const preferredCurrency = 'USD'
        // @ts-ignore
        const {correlationId} = useCorrelationId()
        const headers = {
            'correlation-id': correlationId
        }
        
        return (
            <CommerceApiProvider
                shortCode={config.parameters.shortCode}
                clientId={config.parameters.clientId}
                organizationId={config.parameters.organizationId}
                siteId={siteId}
                locale={localeId}
                currency={preferredCurrency}
                redirectURI={`${appOrigin}/callback`}
                proxy={`${appOrigin}${config.proxyPath}`}
                headers={headers}
                // Uncomment 'enablePWAKitPrivateClient' to use SLAS private client login flows.
                // Make sure to also enable useSLASPrivateClient in ssr.js when enabling this setting.
                // enablePWAKitPrivateClient={true}
                OCAPISessionsURL={`${appOrigin}${proxyBasePath}/ocapi/s/${siteId}/dw/shop/v22_8/sessions`}
                logger={createLogger({packageName: 'commerce-sdk-react'})}
            >
                <WrappedComponent {...(props as P)} />
                <ReactQueryDevtools />
            </CommerceApiProvider>
        )
    }

    return WithCommerceSDKReact
}

export default withCommerceSDKReact
