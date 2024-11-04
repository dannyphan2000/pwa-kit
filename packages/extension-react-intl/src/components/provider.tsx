import React from 'react'
import {I18nProvider} from '@salesforce/pwa-kit-react-sdk/i18n'
import {IntlProvider, IntlConfig, FormattedMessage} from 'react-intl'
import {useLocale, LocaleProvider} from '$/components/locale-context'

import translations from '../translations'

const reactIntlAdaptor = {
    t: (id: string, defaultMessage?: string, options?: Record<string, unknown>) => {
        console.log('t is implemented in extension-react-intl')
        const props = {id, defaultMessage}
        // you must use {...props} instead of <FormattedMessage id={id} defaultMessage={defaultMessage} />
        // because the react-intl library and its babel plugin will attempt to do static analysis on the code
        // during build time, and build will fail if react-intl thinks that you should use string literals.
        // But we know what we are doing, we intentionally want to skip the static analysis,
        // so we use {...props} to bypass the issue.
        return <FormattedMessage {...props} />
    },
    Provider: ({children, ...props}: {children: React.ReactNode} & IntlConfig) => {
        return <IntlProvider {...props}>{children}</IntlProvider>
    }
}

const Provider = ({children}: {children: React.ReactNode}) => {
    console.log('Provider is implemented in extension-react-intl')
    return (
        <LocaleProvider>
            <ProviderContent>{children}</ProviderContent>
        </LocaleProvider>
    )
}

// Create a new component to use the context after LocaleProvider is mounted
const ProviderContent = ({children}: {children: React.ReactNode}) => {
    const {locale} = useLocale()
    return (
        <I18nProvider adaptor={reactIntlAdaptor} locale={locale} messages={translations[locale]}>
            {children}
        </I18nProvider>
    )
}

export default Provider
