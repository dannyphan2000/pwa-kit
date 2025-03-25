import React from 'react'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {
    useApplicationExtension,
    useApplicationExtensionsStore,
} from '@salesforce/pwa-kit-extension-sdk/react'
type SeoHOCProps = React.ComponentPropsWithoutRef<any>

const seoHOC = <P extends object>(WrappedComponent: React.ComponentType<P>) => {

    const SeoHOC: React.FC<P> = (props: SeoHOCProps) => {

        const isBlocked = useBlockNavigation(async (_, __, signal) => {
            // In W-17530042, getUrlMapping will be used here and return false after API call completion
            // A manual delay is added for now just to see the skeleton that would show while the API call is made
            await new Promise((resolve, reject) => {
                const timeout = setTimeout(() => {
                    if (signal.aborted) {
                        reject(new Error("useBlockNavigation callback aborted"))
                    } else {
                        resolve(false)
                    }
                }, 10000)
        
                signal.addEventListener("abort", () => {
                    clearTimeout(timeout)
                    reject(new Error("useBlockNavigation callback aborted"))
                });
            });
        
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
    
    return SeoHOC    
}

export default seoHOC