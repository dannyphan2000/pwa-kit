import React from 'react'
import { StoreLocatorConfig } from '../../types/config'
import { StoreLocatorConfigProvider } from '../store-locator-provider'

/**
 * Higher-order component that wraps a component with the StoreLocatorConfigProvider
 * @param config Store locator configuration
 * @returns A function that takes a component and returns a wrapped component with access to the store locator config
 */
export const withStoreLocatorConfig = (config: StoreLocatorConfig) => {
    return function WithStoreLocatorConfig<P extends object>(
        WrappedComponent: React.ComponentType<P>
    ): React.ComponentType<P> {
        const WithConfig = (props: P) => {
            return (
                <StoreLocatorConfigProvider config={config}>
                    <WrappedComponent {...props} />
                </StoreLocatorConfigProvider>
            )
        }
        
        // Preserve the display name for debugging
        WithConfig.displayName = `WithStoreLocatorConfig(${
            WrappedComponent.displayName || WrappedComponent.name || 'Component'
        })`
        
        return WithConfig
    }
}
