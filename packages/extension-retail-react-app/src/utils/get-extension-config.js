import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'

export const getExtensionConfig = () => {
    const extensions = getConfig()?.app?.extensions
    console.log('getExtensionConfig: ', extensions[0][1])
    return extensions[0][1]
}