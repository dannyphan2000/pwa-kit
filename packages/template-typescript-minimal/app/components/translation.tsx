import React from 'react'
import {t} from '@salesforce/pwa-kit-react-sdk/i18n'

const Translation = () => {
    return <><h1>{t('title', 'Hello World!')}</h1><p>{t('description', 'This is a description')}</p></>
}

export default Translation
