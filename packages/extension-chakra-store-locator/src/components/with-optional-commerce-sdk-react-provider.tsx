/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {CommerceApiProvider} from '@salesforce/commerce-sdk-react'
import {UserConfig} from '../types/config'

type WithOptionalCommerceSdkReactProvider = React.ComponentPropsWithoutRef<any>

/**
 * Higher-order component that conditionally installs the CommerceApiProvider if the config is provided.
 *
 * @param WrappedComponent - The component to be optionally wrapped with CommerceApiProvider.
 * @param config - The configuration object for the CommerceApiProvider.
 * @returns A component that wraps the given component with CommerceApiProvider if it is not already present in the component tree.
 */
export const withOptionalCommerceSdkReactProvider = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    config: UserConfig
) => {
    const HOC: React.FC<P> = (props: WithOptionalCommerceSdkReactProvider) => {
        if (!config.commerceApi || !config.commerceApi?.parameters) {
            return <WrappedComponent {...(props as P)} />
        }
        const appOrigin = getAppOrigin()
        return (
            <CommerceApiProvider
                shortCode={config.commerceApi.parameters.shortCode}
                clientId={config.commerceApi.parameters.clientId}
                organizationId={config.commerceApi.parameters.organizationId}
                siteId={config.commerceApi.parameters.siteId}
                locale={config.commerceApi.parameters.locale}
                currency={config.commerceApi.parameters.currency}
                redirectURI={`${appOrigin}/callback`}
                proxy={`${appOrigin}${config.commerceApi.proxyPath}`}
            >
                <WrappedComponent {...(props as P)} />
            </CommerceApiProvider>
        )
    }

    return HOC
}
