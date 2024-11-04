/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
// for the CommerceApiProvider
import {CommerceApiProvider} from '@salesforce/commerce-sdk-react'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'

import {withLegacyGetProps} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props'
import {withReactQuery} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'
// import {IntlProvider, IntlConfig, FormattedMessage} from 'react-intl'
// import {I18nProvider} from '@salesforce/pwa-kit-react-sdk/i18n'
// import {LocaleProvider, useLocale} from './locale-context'

// import en from '../../../i18n/core/en.json'
// import fr from '../../../i18n/core/fr.json'
// import storeLocatorEn from '../../../i18n/store-locator/en.json'
// import storeLocatorFr from '../../../i18n/store-locator/fr.json'

// const TRANSLATIONS = {
//     en: {
//         ...en,
//         ...storeLocatorEn
//     },
//     fr: {
//         ...fr,
//         ...storeLocatorFr
//     }
// }

// console.log('TRANSLATIONS', TRANSLATIONS)

const isServerSide = typeof window === 'undefined'

interface AppConfigProps {
    children: React.ReactNode
    locals: Record<string, unknown>
}

// const reactIntlAdaptor = {
//     t: (id: string, defaultMessage?: string, options?: Record<string, unknown>) => {
//         const props = {id, defaultMessage}
//         // you must use {...props} instead of <FormattedMessage id={id} defaultMessage={defaultMessage} />
//         // because the react-intl library and its babel plugin will attempt to do static analysis on the code
//         // during build time, and build will fail if react-intl thinks that you should use string literals.
//         // But we know what we are doing, we intentionally want to skip the static analysis,
//         // so we use {...props} to bypass the issue.
//         return <FormattedMessage {...props} />
//     },
//     Provider: ({children, ...props}: {children: React.ReactNode} & IntlConfig) => {
//         return <IntlProvider {...props}>{children}</IntlProvider>
//     }
// }

const CommerceApiProvderWrapper = ({children}: {children: React.ReactNode}) => {
    const appOrigin = getAppOrigin()
    const commerceApiConfig = {
        parameters: {
            shortCode: '8o7m175y',
            clientId: 'c9c45bfd-0ed3-4aa2-9971-40f88962b836',
            organizationId: 'f_ecom_zzrf_001',
            siteId: 'RefArchGlobal',
            locale: 'en-GB',
            currency: 'USD'
        }
    }
    return (
        <CommerceApiProvider
            shortCode={commerceApiConfig.parameters.shortCode}
            clientId={commerceApiConfig.parameters.clientId}
            organizationId={commerceApiConfig.parameters.organizationId}
            siteId={commerceApiConfig.parameters.siteId}
            locale={commerceApiConfig.parameters.locale}
            currency={commerceApiConfig.parameters.currency}
            redirectURI={`${appOrigin}/callback`}
            proxy={`${appOrigin}/mobify/proxy/api`}
            // Uncomment 'enablePWAKitPrivateClient' to use SLAS private client login flows.
            // Make sure to also enable useSLASPrivateClient in ssr.js when enabling this setting.
            // enablePWAKitPrivateClient={true}
            OCAPISessionsURL={`${appOrigin}/mobify/proxy/ocapi/s/${commerceApiConfig.parameters.siteId}/dw/shop/v22_8/sessions`}
        >
            {children}
        </CommerceApiProvider>
    )
}

const AppConfig = ({children}: AppConfigProps) => {
    return (
        <CommerceApiProvderWrapper>
            {/* <LocaleProvider> */}
                {/* <AppConfigContent>{children}</AppConfigContent> */}
            {/* </LocaleProvider> */}
            {children}
        </CommerceApiProvderWrapper>
    )
}

// // Create a new component to use the locale context
// const AppConfigContent = ({children}: {children: React.ReactNode}) => {
//     const {locale} = useLocale()
//     console.log('locale', locale)
//     return (
//         <I18nProvider adaptor={reactIntlAdaptor} locale={locale} messages={TRANSLATIONS[locale]}>
//             {children}
//         </I18nProvider>
//     )
// }

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
