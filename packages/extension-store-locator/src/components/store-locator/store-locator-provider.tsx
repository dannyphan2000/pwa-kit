/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, createContext, ReactNode} from 'react'
import {Config as StoreLocatorConfig} from '../../types/config'

interface SearchStoresParams {
    countryCode: string
    postalCode: string
    limit: number
    latitude?: number
    longitude?: number
}

interface StoreLocatorContextValue {
    userHasSetManualGeolocation: boolean
    setUserHasSetManualGeolocation: (value: boolean) => void
    automaticGeolocationHasFailed: boolean
    setAutomaticGeolocationHasFailed: (value: boolean) => void
    userWantsToShareLocation: boolean
    setUserWantsToShareLocation: (value: boolean) => void
    searchStoresParams: SearchStoresParams
    setSearchStoresParams: React.Dispatch<React.SetStateAction<SearchStoresParams>>
    config: StoreLocatorConfig
}

interface StoreLocatorProviderProps {
    config: StoreLocatorConfig
    children: ReactNode
}

export const StoreLocatorContext = createContext<StoreLocatorContextValue | null>(null)

export const StoreLocatorProvider: React.FC<StoreLocatorProviderProps> = ({config, children}) => {
    const [userHasSetManualGeolocation, setUserHasSetManualGeolocation] = useState(false)
    const [automaticGeolocationHasFailed, setAutomaticGeolocationHasFailed] = useState(false)
    const [userWantsToShareLocation, setUserWantsToShareLocation] = useState(false)

    const [searchStoresParams, setSearchStoresParams] = useState<SearchStoresParams>({
        countryCode: config.defaultCountryCode,
        postalCode: config.defaultPostalCode,
        limit: config.defaultPageSize
    })

    const value: StoreLocatorContextValue = {
        userHasSetManualGeolocation,
        setUserHasSetManualGeolocation,
        automaticGeolocationHasFailed,
        setAutomaticGeolocationHasFailed,
        userWantsToShareLocation,
        setUserWantsToShareLocation,
        searchStoresParams,
        setSearchStoresParams,
        config
    }

    return <StoreLocatorContext.Provider value={value}>{children}</StoreLocatorContext.Provider>
}

export type {StoreLocatorContextValue}
