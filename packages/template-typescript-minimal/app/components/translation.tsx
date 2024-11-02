import React from 'react'
import {FormattedMessage} from 'react-intl'
import {useLocale} from './_app-config/locale-context'
import type {Locale} from './_app-config/locale-context'

const LanguageSwitcher = ({id}: {id: Locale}) => {
    const {locale, setLocale} = useLocale();

    return (
        <button 
            onClick={() => setLocale(id)}
            style={{
                padding: '12px 24px',
                margin: '12px 24px',
                fontSize: '16px',
                cursor: 'pointer'
            }}
        >
            Switch to {id} Language
        </button>
    );
};

const Translation = () => {
    return (
        <>
            <h1><FormattedMessage id="title" defaultMessage="Hello World!" /></h1>
            <h3><FormattedMessage id="description" defaultMessage="This is a description" /></h3>
            <LanguageSwitcher id="fr" />
            <LanguageSwitcher id="en" />
        </>
    )
}

export default Translation
