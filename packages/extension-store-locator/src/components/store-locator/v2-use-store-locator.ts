/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {useContext} from 'react'
import {useSearchStores} from '@salesforce/commerce-sdk-react'
import {StoreLocatorContext} from './v2-store-locator-provider'
import type {StoreLocatorState, Mode, FormValues} from './v2-store-locator-provider'

interface DeviceCoordinates {
    latitude: number | null
    longitude: number | null
}

interface StoreLocatorActions {
    // setMode: (mode: Mode) => void
    setFormValues: (formValues: FormValues) => void
    setDeviceCoordinates: (coordinates: DeviceCoordinates) => void
}

type UseStoreLocatorReturn = StoreLocatorState & StoreLocatorActions & {
    data: NonNullable<ReturnType<typeof useSearchStores>['data']> | undefined
    isLoading: boolean
}

const useStores = (state: StoreLocatorState) => {
    //This is an API limit and is therefore not configurable
    const NUM_STORES_PER_REQUEST_API_MAX = 200
    const apiParameters =
        state.mode === 'input'
            ? {
                  countryCode: state.formValues.countryCode,
                  postalCode: state.formValues.postalCode,
                  locale: 'en-GB',
                  maxDistance: state.config.defaultDistance,
                  limit: NUM_STORES_PER_REQUEST_API_MAX,
                  distanceUnit: state.config.defaultDistanceUnit
              }
            : {
                  latitude: state.deviceCoordinates.latitude,
                  longitude: state.deviceCoordinates.longitude,
                  locale: 'en-GB',
                  maxDistance: state.config.defaultDistance,
                  limit: NUM_STORES_PER_REQUEST_API_MAX,
                  distanceUnit: state.config.defaultDistanceUnit
              }
    const shouldFetchStores =
        Boolean(
            state.mode === 'input' && state.formValues.countryCode && state.formValues.postalCode
        ) ||
        Boolean(
            state.mode === 'device' &&
                state.deviceCoordinates.latitude &&
                state.deviceCoordinates.longitude
        )
    return useSearchStores(
        {
            parameters: apiParameters
        },
        {
            enabled: shouldFetchStores
        }
    )
}

export const useStoreLocator = (): UseStoreLocatorReturn => {
    const context = useContext(StoreLocatorContext)
    if (!context) {
        throw new Error('useStoreLocator must be used within a StoreLocatorProvider')
    }

    const {state, setState} = context
    const {data, isLoading} = useStores(state)
    console.log('data', data)
    // There are two modes, input and device. 
    // The input mode is when the user is searching for a store
    // by entering a postal code and country code.
    // The device mode is when the user is searching for a store by sharing their location.
    // The mode is implicitly set by user's action.
    const setFormValues = (formValues: FormValues) => {
        console.log('setFormValues', formValues)
        setState((prev) => ({...prev, formValues, mode: 'input'}))
    }

    const setDeviceCoordinates = (coordinates: DeviceCoordinates) => {
        console.log('setDeviceCoordinates', coordinates)
        setState((prev) => ({
            ...prev,
            deviceCoordinates: coordinates,
            mode: 'device',
            formValues: {countryCode: '', postalCode: ''}
        }))
    }

    return {
        ...state,
        // Actions
        // setMode,
        setFormValues,
        setDeviceCoordinates,
        data,
        isLoading
    }
}
