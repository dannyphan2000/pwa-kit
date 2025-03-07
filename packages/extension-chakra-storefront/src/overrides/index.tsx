/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, ReactNode, useContext} from 'react'
import PropTypes from 'prop-types'
import {useBlockNavigation} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'

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
    message: string;
}
interface NavigationGuardProviderProps {
    callback: () => any,
    children: ReactNode
}
export const NavigationGuardContext = React.createContext<NavigationGuardContextType> ({isBlocked: false, message: "this context is from extension-chakra-storefront"})

// Define a type for the HOC props
type SampleHOCProps = React.ComponentPropsWithoutRef<any>