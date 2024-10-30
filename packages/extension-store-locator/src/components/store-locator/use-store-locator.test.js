/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {renderHook} from '@testing-library/react'
import {useStoreLocator} from './use-store-locator'
import {StoreLocatorProvider} from './store-locator-provider'
import React from 'react'

const mockConfig = {
  defaultCountryCode: "US",
  defaultPostalCode: "94105",
  defaultPageSize: 10,
};

describe("useStoreLocator", () => {
  it("throws error when used outside provider", () => {
    expect(() => {
      renderHook(() => useStoreLocator());
    }).toThrow("useStoreLocator must be used within a StoreLocatorProvider");
  });

  it("returns context when used within provider", () => {
    const wrapper = ({ children }) => (
      <StoreLocatorProvider config={mockConfig}>
        {children}
      </StoreLocatorProvider>
    );

    const { result } = renderHook(() => useStoreLocator(), { wrapper });

    expect(result.current).toEqual(
      expect.objectContaining({
        searchStoresParams: expect.any(Object),
        setSearchStoresParams: expect.any(Function),
        userHasSetManualGeolocation: expect.any(Boolean),
        setUserHasSetManualGeolocation: expect.any(Function),
        config: mockConfig,
      })
    );
  });
});
