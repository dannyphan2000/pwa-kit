/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, ReactNode, useContext} from 'react'
import PropTypes from 'prop-types'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'
import {sliceInitializer} from '../types'

/**
 * This is the global state for currency, we use this throughout the site. For example, on
 * the product-list, product-detail and cart and basket pages..
 *
 * To use these context's simply import them into the component requiring context
 * like the below example:
 *
 * import React, {useContext} from 'react'
 * import {CurrencyContext} from './contexts'
 *
 * export const RootCurrencyLabel = () => {
 *    const {currency} = useContext(CurrencyContext)
 *    return <div>{currency}</div>
 * }
 *
 * Alternatively you can use the hook provided by us:
 *
 * import {useCurrency} from './hooks'
 *
 * const {currency, setCurrency} = useCurrency()
 *
 */
interface NavigationGuardContextType {
    isBlocked: boolean;
    yo: string;
}
interface NavigationGuardProviderProps {
    callback: () => any,
    children: ReactNode
}
export const NavigationGuardContext = React.createContext<NavigationGuardContextType> ({isBlocked: true, yo: "heyo"})
export const NavigationGuardProvider: React.FC<NavigationGuardProviderProps> = ({callback, children}) => {
    const isBlocked = useBlockNavigation(async () => {
        if (callback !== undefined) await callback()
        return false
    })
    const [isBlockedState, setIsBlockedState] = useState(isBlocked)
    console.log("(JEREMY) NavigationGuardProvider in extension-seo isBlocked: ", isBlocked)

    return (
        <NavigationGuardContext.Provider value={{isBlocked: isBlockedState, yo: "hey"}}>
            <div>
                isBlocked: {isBlocked.toString()}
            </div>
            {children}
        </NavigationGuardContext.Provider>
    )
}

// Define a type for the HOC props
type SampleHOCProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
export const withNavigationGuardContext = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    // console.log("(JEREMY) hey")
    const navigationGuardCallback = async () => {
        // In W-17530042, updateRoutes will be used here and return false after API call completion
        // A manual delay is added for now just to see the skeleton that would show while the API call is made
        // console.log("(JEREMY) about to run delay!")
        const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))
        await delay(10000)
        // console.log("(JEREMY) delay finished!")
    
        return false
    }

    const SampleHOC: React.FC<P> = (props: SampleHOCProps) => {
        return (
            <NavigationGuardProvider callback={navigationGuardCallback}>
                <WrappedComponent {...(props as P)}/>
            </NavigationGuardProvider>
        )
    }
    
    return SampleHOC    
}
