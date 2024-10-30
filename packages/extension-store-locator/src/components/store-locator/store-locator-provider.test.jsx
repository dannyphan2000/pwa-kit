/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {renderHook, act} from '@testing-library/react'
import {StoreLocatorProvider} from './store-locator-provider'
import {useStoreLocator} from './use-store-locator'

const mockConfig = {
  defaultCountryCode: "US",
  defaultPostalCode: "94105",
  defaultPageSize: 10,
  defaultDistance: 100,
  defaultDistanceUnit: "mi",
  supportedCountries: [],
};

describe("StoreLocatorProvider", () => {
  const wrapper = ({ children }) => (
    <StoreLocatorProvider config={mockConfig}>{children}</StoreLocatorProvider>
  );

  it("provides initial context values", () => {
    const { result } = renderHook(() => useStoreLocator(), { wrapper });

    expect(result.current.searchStoresParams).toEqual({
      countryCode: "US",
      postalCode: "94105",
      limit: 10,
    });
    expect(result.current.userHasSetManualGeolocation).toBe(false);
    expect(result.current.config).toEqual(mockConfig);
  });

  it("updates search parameters", () => {
    const { result } = renderHook(() => useStoreLocator(), { wrapper });

    act(() => {
      result.current.setSearchStoresParams({
        countryCode: "DE",
        postalCode: "10178",
        limit: 20,
      });
    });

    expect(result.current.searchStoresParams).toEqual({
      countryCode: "DE",
      postalCode: "10178",
      limit: 20,
    });
  });

  it("updates geolocation states", () => {
    const { result } = renderHook(() => useStoreLocator(), { wrapper });

    act(() => {
      result.current.setUserHasSetManualGeolocation(true);
      result.current.setAutomaticGeolocationHasFailed(true);
      result.current.setUserWantsToShareLocation(true);
    });

    expect(result.current.userHasSetManualGeolocation).toBe(true);
    expect(result.current.automaticGeolocationHasFailed).toBe(true);
    expect(result.current.userWantsToShareLocation).toBe(true);
  });
});
