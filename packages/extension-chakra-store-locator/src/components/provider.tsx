/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect, useState, createContext, ReactNode} from 'react'
import {Config as StoreLocatorConfig} from '../types/config'
import {Store} from '../types/store'

type Mode = 'device' | 'input'
interface FormValues {
    countryCode: string
    postalCode: string
}

interface DeviceCoordinates {
    latitude: number | null
    longitude: number | null
}

interface StoreLocatorState {
    mode: Mode
    formValues: FormValues
    deviceCoordinates: DeviceCoordinates
    config: StoreLocatorConfig
}

interface StoreLocatorContextValue {
    state: StoreLocatorState
    setState: React.Dispatch<React.SetStateAction<StoreLocatorState>>
}

interface StoreLocatorProviderProps {
    config: StoreLocatorConfig
    children: ReactNode
}

export const StoreLocatorContext = createContext<StoreLocatorContextValue | null>(null)

export const StoreLocatorProvider: React.FC<StoreLocatorProviderProps> = ({config, children}) => {
    const [state, setState] = useState<StoreLocatorState>({
        mode: 'input',
        formValues: {
            countryCode: config.defaultCountryCode,
            postalCode: config.defaultPostalCode
        },
        deviceCoordinates: {
            latitude: null,
            longitude: null
        },
        config
    })

    const value: StoreLocatorContextValue = {
        state,
        setState
    }

    return <StoreLocatorContext.Provider value={value}>{children}</StoreLocatorContext.Provider>
}

interface StoreSelectionState {
    id: Store['id']
    name?: Store['name']
    inventoryId?: Store['inventoryId']
}

interface StoreSelectionContextValue {
    selectedStore: StoreSelectionState | null
    updateSelectedStore: (store: Store) => void
}

interface StoreSelectionProviderProps {
    config: StoreLocatorConfig
    children: ReactNode
}

export const StoreSelectionContext = createContext<StoreSelectionContextValue | null>(null)

export const StoreSelectionProvider: React.FC<StoreSelectionProviderProps> = ({
    config,
    children
}) => {
    const {siteId} = config.commerceApi?.parameters || {}
    const storedStoreKey = `store_${siteId}`
    const [selectedStore, setSelectedStore] = useState<StoreSelectionState|null>(null)


    useEffect(() => {
        const storedStore = localStorage.getItem(storedStoreKey)
        if (storedStore) {
            setSelectedStore(JSON.parse(storedStore))
        }
    }, [])

    const updateSelectedStore = (newStore: Store) => {
        const store = {
            id: newStore.id,
            name: newStore.name,
            inventoryId: newStore.inventoryId
        }
        setSelectedStore(store)
        localStorage.setItem(storedStoreKey, JSON.stringify(store))
    }

    const value: StoreSelectionContextValue = {
        selectedStore,
        updateSelectedStore
    }

    console.log('JINSU StoreSelectionProvider', selectedStore)

    return <StoreSelectionContext.Provider value={value}>{children}</StoreSelectionContext.Provider>
}

export type {
    StoreLocatorContextValue,
    StoreLocatorState,
    Mode,
    FormValues,
    DeviceCoordinates,
    StoreSelectionContextValue,
    StoreSelectionState
}
