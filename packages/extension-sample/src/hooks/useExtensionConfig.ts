import {useApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'
import Extension from '../setup-app'

export const useExtensionConfig = () => {
    const extension = useApplicationExtension(Extension.id)
    return extension?.getConfig()
}
