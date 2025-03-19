import React from 'react'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {
    useApplicationExtension,
    useApplicationExtensionsStore,
} from '@salesforce/pwa-kit-extension-sdk/react'
// Define a type for the HOC props
type SampleHOCProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const sampleHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const config = getConfig()

    const navigationGuardCallback = async () => {
        // In W-17530042, updateRoutes will be used here and return false after API call completion
        // A manual delay is added for now just to see the skeleton that would show while the API call is made
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        await delay(10000)
    
        return false
    }

    const SampleHOC: React.FC<P> = (props: SampleHOCProps) => {

        const isBlocked = useBlockNavigation(async () => {
            if (navigationGuardCallback !== undefined) await navigationGuardCallback()
            return false
        })
        useApplicationExtension(
            '@salesforce/extension-seo-url-mapping'
        )
        const setIsBlocked = useApplicationExtensionsStore((state) => {
            return state.state['@salesforce/extension-seo-url-mapping']?.setIsBlocked
        })
        setIsBlocked(isBlocked)
        
        return (
                <WrappedComponent {...(props as P)}/>
        )
    }
    
    return SampleHOC    
}

export default sampleHOC