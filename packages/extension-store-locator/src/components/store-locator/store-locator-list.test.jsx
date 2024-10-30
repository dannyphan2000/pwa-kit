/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithProviders} from '../../test-utils'
import {StoreLocatorList} from './store-locator-list'
import {useStoreLocator} from './use-store-locator'

jest.mock('./use-store-locator', () => ({
    useStoreLocator: jest.fn()
}))

const mockStoresInfo = [
    {
        name: 'Test Store 1',
        address1: '123 Test St',
        city: 'San Francisco',
        stateCode: 'CA',
        postalCode: '94105'
    },
    {
        name: 'Test Store 2',
        address1: '456 Example Ave',
        city: 'Oakland',
        stateCode: 'CA',
        postalCode: '94612'
    }
]

describe('StoreLocatorList', () => {
    beforeEach(() => {
        useStoreLocator.mockImplementation(() => ({
            searchStoresParams: {},
            config: {
                defaultDistance: 100,
                defaultDistanceUnit: 'mi',
                defaultCountry: 'United States',
                supportedCountries: []
            }
        }))
    })

    it('displays loading message when storesInfo is undefined', () => {
        renderWithProviders(<StoreLocatorList storesInfo={undefined} />)
        expect(screen.getByText('Loading locations...')).toBeTruthy()
    })

    it('displays no locations message when storesInfo is empty', () => {
        renderWithProviders(<StoreLocatorList storesInfo={[]} />)
        expect(screen.getByText('Sorry, there are no locations in this area')).toBeTruthy()
    })

    it('displays stores near location message when no postal code', () => {
        renderWithProviders(<StoreLocatorList storesInfo={mockStoresInfo} />)
        expect(screen.getByText('Viewing stores near your location')).toBeTruthy()
    })

    it('renders multiple store items', () => {
        renderWithProviders(<StoreLocatorList storesInfo={mockStoresInfo} />)
        expect(screen.getByText('Test Store 1')).toBeTruthy()
        expect(screen.getByText('Test Store 2')).toBeTruthy()
    })
})
