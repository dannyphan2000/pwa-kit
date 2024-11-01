import React from 'react'
import {t} from '@salesforce/pwa-kit-react-sdk/i18n'

const Translation = () => {
    const test = '123'
    return <h1>{t('welcome-title-2', 'Hello!')} {t('welcome-title-3', test)}</h1>
}

export default Translation
