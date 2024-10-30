/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithProviders} from '../../test-utils'
import {StoreLocatorModal} from './store-locator-modal'

// Mock specific Chakra UI components and hooks
const mockUseBreakpointValue = jest.fn()
jest.mock('@chakra-ui/react', () => {
    const originalModule = jest.requireActual('@chakra-ui/react')
    return {
        ...originalModule,
        useBreakpointValue: (...args) => mockUseBreakpointValue
    }
})

jest.mock("@salesforce/commerce-sdk-react", () => ({
  useSearchStores: jest.fn(() => ({
    data: {
      data: [
        {
          name: "Test Store 1",
          address1: "123 Test St",
          city: "San Francisco",
          stateCode: "CA",
          postalCode: "94105",
          phone: "555-1234",
          distance: 0.5,
          distanceUnit: "mi",
          storeHours: "<p>Mon-Fri: 9AM-9PM</p>",
        },
      ],
      total: 1,
      limit: 10,
      offset: 0,
    },
    isLoading: false,
    isFetching: false,
    refetch: jest.fn(),
  })),
}));

describe("StoreLocatorModal", () => {
  const mockProps = {
    isOpen: true,
    onClose: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseBreakpointValue.mockReturnValue(true); // Default to desktop view
  });

    it('renders desktop view correctly', () => {
        mockUseBreakpointValue.mockReturnValue(true) // Desktop view
        renderWithProviders(<StoreLocatorModal {...mockProps} />)

        expect(screen.getByText('Find a Store')).toBeTruthy()
    })

    it('renders mobile view correctly', () => {
        mockUseBreakpointValue.mockReturnValue(false) // Mobile view
        renderWithProviders(<StoreLocatorModal {...mockProps} />)

        expect(screen.getByText('Find a Store')).toBeTruthy()
    })

    it('does not render when closed', () => {
        renderWithProviders(<StoreLocatorModal isOpen={false} onClose={jest.fn()} />)

        expect(screen.queryByText('Find a Store')).toBeNull()
    })

    it('calls onClose when close button is clicked', () => {
        const onClose = jest.fn()
        renderWithProviders(<StoreLocatorModal isOpen={true} onClose={onClose} />)

        const closeButton = screen.getByLabelText('Close')
        closeButton.click()
        expect(onClose).toHaveBeenCalled()
    })
})
