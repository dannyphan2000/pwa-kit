/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {withLegacyGetProps} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props'
import {withReactQuery} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'
import {I18nProvider} from '@salesforce/pwa-kit-react-sdk/i18n'
import {IntlProvider, IntlConfig, FormattedMessage} from 'react-intl'

import en from '../../../i18n/core/en.json';
import fr from '../../../i18n/core/fr.json';

const TRANSLATIONS = {
    en,
    fr
}

const isServerSide = typeof window === 'undefined'

interface AppConfigProps {
    children: React.ReactNode
    locals: Record<string, unknown>
}

const reactIntlAdaptor = {
    t: (id: string, defaultMessage?: string, options?: Record<string, unknown>) => {
        const props = {id, defaultMessage}
        console.log('t is overriden')
        return <FormattedMessage {...props} />
    },
    Provider: ({children, ...props}: {children: React.ReactNode} & IntlConfig) => {
        return <IntlProvider {...props}>{children}</IntlProvider>
    }
}

const AppConfig = ({children}: AppConfigProps) => {
    return <I18nProvider adaptor={reactIntlAdaptor} locale="fr" messages={TRANSLATIONS['fr']}>{children}</I18nProvider>
}

AppConfig.restore = () => {}
AppConfig.extraGetPropsArgs = () => {}
AppConfig.freeze = () => {}

// Recommended settings for PWA-Kit usages.
// NOTE: they will be applied on both server and client side.
const options = {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                retry: false,
                staleTime: 2 * 1000,
                ...(isServerSide ? {retryOnMount: false} : {})
            },
            mutations: {
                retry: false
            }
        }
    }
}

// @ts-expect-error TODO: fix
export default withReactQuery(withLegacyGetProps(AppConfig), options)
