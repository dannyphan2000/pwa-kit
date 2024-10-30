/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen, fireEvent} from '@testing-library/react'
import {renderWithProviders} from '../../test-utils'
import {StoreLocatorContent} from './store-locator-content'
import {useSearchStores} from '@salesforce/commerce-sdk-react'
import {useStoreLocator} from './use-store-locator'

jest.mock("@salesforce/commerce-sdk-react", () => ({
  useSearchStores: jest.fn(),
}));

jest.mock("./use-store-locator", () => ({
  useStoreLocator: jest.fn(),
}));

const mockStoreLocatorContext = {
  searchStoresParams: {
    countryCode: "US",
    postalCode: "94105",
    limit: 10,
  },
  setSearchStoresParams: jest.fn(),
  userHasSetManualGeolocation: false,
  setUserHasSetManualGeolocation: jest.fn(),
  config: {
    defaultDistance: 100,
    defaultDistanceUnit: "mi",
    defaultPageSize: 10,
    supportedCountries: [],
  },
};

const mockSearchStoresData = {
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
    },
  ],
  total: 1,
};

describe("StoreLocatorContent", () => {
  beforeEach(() => {
    useStoreLocator.mockImplementation(() => mockStoreLocatorContext);
    useSearchStores.mockImplementation(() => ({
      data: mockSearchStoresData,
      isLoading: false,
      isFetching: false,
      refetch: jest.fn(),
    }));
  });

    it('renders the component with store results', () => {
        renderWithProviders(<StoreLocatorContent />)

        // Check for main heading
        expect(screen.getByText('Find a Store')).toBeTruthy()

        // Check for store information
        expect(screen.getByText('Test Store 1')).toBeTruthy()
        expect(screen.getByText('123 Test St')).toBeTruthy()
        expect(screen.getByText(/San Francisco, CA 94105/)).toBeTruthy()
    })

    // Check for main heading
    expect(screen.getByText("Find a Store")).toBeTruthy();

    // Check for store information
    expect(screen.getByText("Test Store 1")).toBeTruthy();
    expect(screen.getByText("123 Test St")).toBeTruthy();
    expect(screen.getByText(/San Francisco, CA 94105/)).toBeTruthy();
  });

  it("displays loading state", () => {
    useSearchStores.mockImplementation(() => ({
      isLoading: true,
      isFetching: false,
    }));

    renderWithProviders(<StoreLocatorContent />);
    expect(screen.getByText("Loading locations...")).toBeTruthy();
  });

  it("displays no results message when no stores found", () => {
    useSearchStores.mockImplementation(() => ({
      data: { data: [], total: 0 },
      isLoading: false,
      isFetching: false,
    }));

    renderWithProviders(<StoreLocatorContent />);
    expect(
      screen.getByText("Sorry, there are no locations in this area")
    ).toBeTruthy();
  });
});
