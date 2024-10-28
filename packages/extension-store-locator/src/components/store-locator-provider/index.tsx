import React, { createContext, useContext } from 'react'
import { StoreLocatorConfig } from '../../types/config'

const StoreLocatorConfigContext = createContext<StoreLocatorConfig | undefined>(undefined)

export const useStoreLocatorConfig = () => {
    const context = useContext(StoreLocatorConfigContext)
    if (!context) {
        throw new Error('useStoreLocatorConfig must be used within a StoreLocatorConfigProvider')
    }
    return context
}

interface StoreLocatorConfigProviderProps {
    config: StoreLocatorConfig
    children: React.ReactNode
}

export const StoreLocatorConfigProvider: React.FC<StoreLocatorConfigProviderProps> = ({ 
    config, 
    children 
}) => {
    return (
        <StoreLocatorConfigContext.Provider value={config}>
            {children}
        </StoreLocatorConfigContext.Provider>
    )
}
