/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen, fireEvent} from '@testing-library/react'
import {renderWithProviders} from '../../test-utils'
import {StoreLocatorForm} from './store-locator-form'
import {useStoreLocator} from './use-store-locator'

jest.mock('./use-store-locator', () => ({
    useStoreLocator: jest.fn()
}))

const mockStoreLocatorContext = {
    searchStoresParams: {
        countryCode: 'US',
        postalCode: '94105'
    },
    userHasSetManualGeolocation: false,
    automaticGeolocationHasFailed: false,
    setUserWantsToShareLocation: jest.fn(),
    userWantsToShareLocation: false,
    config: {
        supportedCountries: [
            {countryCode: 'US', countryName: 'United States'},
            {countryCode: 'CA', countryName: 'Canada'}
        ]
    }
}

describe('StoreLocatorForm', () => {
    beforeEach(() => {
        useStoreLocator.mockImplementation(() => mockStoreLocatorContext)
    })

    it('renders the component with all inputs', () => {
        renderWithProviders(<StoreLocatorForm refetch={jest.fn()} />)

        expect(screen.getByText('Select a country')).toBeTruthy()
        expect(screen.getByPlaceholderText('Enter postal code')).toBeTruthy()
        expect(screen.getByText('Find')).toBeTruthy()
        expect(screen.getByText('Use My Location')).toBeTruthy()
    })

    it('shows geolocation error when automatic geolocation fails', () => {
        useStoreLocator.mockImplementation(() => ({
            ...mockStoreLocatorContext,
            automaticGeolocationHasFailed: true,
            userWantsToShareLocation: true
        }))

        renderWithProviders(<StoreLocatorForm refetch={jest.fn()} />)
        expect(screen.getByText('Please agree to share your location')).toBeTruthy()
    })

    it('handles Use My Location button click', () => {
        const setUserWantsToShareLocation = jest.fn()
        useStoreLocator.mockImplementation(() => ({
            ...mockStoreLocatorContext,
            setUserWantsToShareLocation
        }))

        renderWithProviders(<StoreLocatorForm refetch={jest.fn()} />)

        fireEvent.click(screen.getByText('Use My Location'))
        expect(setUserWantsToShareLocation).toHaveBeenCalledWith(true)
    })
})
