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

const mockStoresInfo = [
    {
        name: 'Test Store 1',
        address1: '123 Test St',
        city: 'San Francisco',
        stateCode: 'CA',
        postalCode: '94105',
        phone: '555-1234',
        distance: 0.5,
        distanceUnit: 'mi',
        storeHours: '<p>Mon-Fri: 9AM-9PM</p>'
    },
    {
        name: 'Test Store 2',
        address1: '456 Example Ave',
        city: 'Oakland',
        stateCode: 'CA',
        postalCode: '94612',
        distance: 2.5,
        distanceUnit: 'mi'
    }
]

describe('StoreLocatorList', () => {
    it('renders store information correctly', () => {
        renderWithProviders(<StoreLocatorList storesInfo={mockStoresInfo} />)

        // Check first store details
        expect(screen.getByText('Test Store 1')).toBeTruthy()
        expect(screen.getByText('123 Test St')).toBeTruthy()
        expect(screen.getByText(/San Francisco, CA 94105/)).toBeTruthy()
        expect(screen.getByText('0.5 mi away')).toBeTruthy()
        expect(screen.getByText('Phone: 555-1234')).toBeTruthy()

        // Check second store details
        expect(screen.getByText('Test Store 2')).toBeTruthy()
        expect(screen.getByText('456 Example Ave')).toBeTruthy()
        expect(screen.getByText(/Oakland, CA 94612/)).toBeTruthy()
        expect(screen.getByText('2.5 mi away')).toBeTruthy()
    })

    it('renders store hours when available', () => {
        renderWithProviders(<StoreLocatorList storesInfo={mockStoresInfo} />)
        expect(screen.getByText('View More')).toBeTruthy()
    })

    it('handles stores without optional fields', () => {
        const storesWithMissingFields = [
            {
                name: 'Basic Store',
                address1: '789 Basic St',
                city: 'Simple City',
                postalCode: '12345'
            }
        ]

        renderWithProviders(<StoreLocatorList storesInfo={storesWithMissingFields} />)
        expect(screen.getByText('Basic Store')).toBeTruthy()
        expect(screen.queryByText('Phone:')).toBeNull()
        expect(screen.queryByText('View More')).toBeNull()
    })
})
