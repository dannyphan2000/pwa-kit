import React from 'react'
import {t} from '@salesforce/pwa-kit-react-sdk/i18n'
// import {useLocale} from './_app-config/locale-context'
// import type {Locale} from './_app-config/locale-context'
import {useLocale} from '$/components/locale-context'
import type {Locale} from '$/components/locale-context'

const LanguageSwitcher = ({id}: {id: Locale}) => {
    const {locale, setLocale} = useLocale();
    return (
        <button 
            onClick={() => {
                setLocale(id)
                console.log('LanguageSwitcher setting locale to', id)
            }}
            style={{
                padding: '12px 24px',
                margin: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer',
                backgroundColor: 'white',
                color: 'black'
            }}
        >
            Switch to {id} Language
        </button>
    );
};

const Translation = () => {
    return (
        <>
            <h1>{t('title', 'Hello World!')}</h1>
            <h3>{t('description', 'This is a description')}</h3>
            <LanguageSwitcher id="fr" />
            <LanguageSwitcher id="en" />
        </>
    )
}

export default Translation
