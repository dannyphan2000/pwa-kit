import React from 'react'
import {I18nProvider} from '@salesforce/pwa-kit-react-sdk/i18n'
import {IntlProvider, IntlConfig, FormattedMessage} from 'react-intl'
import {useLocale, LocaleProvider} from '$/components/locale-context'

// TODO: how to pass these translations JSON files from the project to this extension?
// Loadable?
import en from '../../../template-typescript-minimal/i18n/core/en.json'
import fr from '../../../template-typescript-minimal/i18n/core/fr.json'
import storeLocatorEn from '../../../template-typescript-minimal/i18n/store-locator/en.json'
import storeLocatorFr from '../../../template-typescript-minimal/i18n/store-locator/fr.json'

const TRANSLATIONS = {
    en: {
        ...en,
        ...storeLocatorEn
    },
    fr: {
        ...fr,
        ...storeLocatorFr
    }
}

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
        <I18nProvider adaptor={reactIntlAdaptor} locale={locale} messages={TRANSLATIONS[locale]}>
            {children}
        </I18nProvider>
    )
}

export default Provider
