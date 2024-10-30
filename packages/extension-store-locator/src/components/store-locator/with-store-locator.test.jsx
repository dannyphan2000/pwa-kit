/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {render, screen} from '@testing-library/react'
import {withStoreLocator} from './with-store-locator'
import {useStoreLocator} from './use-store-locator'
import PropTypes from 'prop-types'

// Mock the hook
jest.mock("./use-store-locator", () => ({
  useStoreLocator: jest.fn(),
}));

describe("withStoreLocator", () => {
  const mockConfig = {
    defaultCountryCode: "US",
    defaultPostalCode: "94105",
    defaultPageSize: 10,
    defaultDistance: 100,
    defaultDistanceUnit: "mi",
    supportedCountries: [],
  };

  beforeEach(() => {
    useStoreLocator.mockReturnValue({
      searchStoresParams: {},
      setSearchStoresParams: jest.fn(),
      config: mockConfig,
    });
  });

<<<<<<< HEAD
  it("wraps component with StoreLocatorProvider", () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withStoreLocator(mockConfig)(TestComponent);

    render(<WrappedComponent />);
    expect(screen.getByText("Test Component")).toBeTruthy();
  });

  it("passes props to wrapped component", () => {
    const TestComponentWithProps = ({ testProp }) => <div>{testProp}</div>;
    TestComponentWithProps.propTypes = {
      testProp: PropTypes.string,
    };

    const WrappedComponent = withStoreLocator(mockConfig)(
      TestComponentWithProps
    );
    render(<WrappedComponent testProp="test value" />);

    expect(screen.getByText("test value")).toBeTruthy();
  });

  it("preserves component display name", () => {
    const TestComponent = () => <div>Test Component</div>;
    TestComponent.displayName = "CustomTestComponent";

    const WrappedComponent = withStoreLocator(mockConfig)(TestComponent);
    expect(WrappedComponent.displayName).toBe(
      "WithStoreLocator(CustomTestComponent)"
    );
  });

  it("handles components without display name", () => {
    const TestComponent = () => <div>Test Component</div>;
    const WrappedComponent = withStoreLocator(mockConfig)(TestComponent);

    expect(WrappedComponent.displayName).toBe(
      "WithStoreLocator(TestComponent)"
    );
  });
});
=======
    it('wraps component with StoreLocatorProvider', () => {
        const TestComponent = () => <div>Test Component</div>
        const WrappedComponent = withStoreLocator(mockConfig)(TestComponent)

        render(<WrappedComponent />)
        expect(screen.getByText('Test Component')).toBeTruthy()
    })

    it('passes props to wrapped component', () => {
        const TestComponentWithProps = ({testProp}) => <div>{testProp}</div>
        TestComponentWithProps.propTypes = {
            testProp: PropTypes.string
        }

        const WrappedComponent = withStoreLocator(mockConfig)(TestComponentWithProps)
        render(<WrappedComponent testProp="test value" />)

        expect(screen.getByText('test value')).toBeTruthy()
    })

    it('preserves component display name', () => {
        const TestComponent = () => <div>Test Component</div>
        TestComponent.displayName = 'CustomTestComponent'

        const WrappedComponent = withStoreLocator(mockConfig)(TestComponent)
        expect(WrappedComponent.displayName).toBe('WithStoreLocator(CustomTestComponent)')
    })

    it('handles components without display name', () => {
        const TestComponent = () => <div>Test Component</div>
        const WrappedComponent = withStoreLocator(mockConfig)(TestComponent)

        expect(WrappedComponent.displayName).toBe('WithStoreLocator(TestComponent)')
    })
})
>>>>>>> cecc47bbcfeb8f9b274a7dc3cf24d715e6ba5efe
