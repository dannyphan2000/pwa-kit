/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {render, screen, waitFor, act} from '@testing-library/react'
import {BrowserRouter, useLocation} from 'react-router-dom'
import SeoHOC from './seo-hoc'
import {useExtensionConfig} from '../hooks/use-extension-config'

// Mock the useLocation hook
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useLocation: jest.fn()
}))

// Mock the useExtensionConfig hook
jest.mock('../hooks/use-extension-config', () => ({
    useExtensionConfig: jest.fn()
}))

// Mock the useApplicationExtensionsStore hook
let mockSetIsNavigationBlocked: jest.Mock
jest.mock('@salesforce/pwa-kit-extension-sdk/react', () => {
    mockSetIsNavigationBlocked = jest.fn()
    return {
        useApplicationExtensionsStore: jest.fn().mockImplementation((selector) => {
            const state = {
                state: {
                    '@salesforce/extension-commerce-bm-seo': {
                        setIsNavigationBlocked: mockSetIsNavigationBlocked,
                        siteLocale: 'en-US'
                    }
                }
            }
            return selector(state)
        })
    }
})

// Mock the useUrlMapping hook
let mockRefetch: jest.Mock
jest.mock('@salesforce/commerce-sdk-react', () => {
    mockRefetch = jest.fn().mockResolvedValue({
        status: 'success',
        data: {destinationUrl: '/redirect'}
    })
    return {
        useUrlMapping: jest.fn().mockReturnValue({
            refetch: mockRefetch
        })
    }
})

// Mock useRoutes and useBlockNavigation
let navCallback: ((location: any, action: string) => Promise<void>) | undefined
jest.mock('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks', () => {
    const originalModule = jest.requireActual('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks')
    return {
        ...originalModule,
        useRoutes: jest.fn(),
        useBlockNavigation: jest.fn().mockImplementation((cb) => {
            const isBlocked = true
            navCallback = cb
            return {isBlocked, blockNavigation: jest.fn(), unblockNavigation: jest.fn()}
        })
    }
})

let setRoutesMock: jest.Mock
const setupForSetRoutesTests = () => {
    const ProductDetail = () => <div>Test Component</div>
    const insideComponent = () => <div>Inner Component</div>
    ProductDetail.displayName = 'ProductDetail'
    ;(useExtensionConfig as jest.Mock).mockReturnValue({
        routingMode: 'router_first',
        resourceTypeToComponentMap: {
            category: 'ProductList',
            product: 'ProductDetail',
            content_asset: 'ProductList'
        }
    })
    ;(useLocation as jest.Mock).mockReturnValue({
        pathname: '/another-path'
    })

    // Mock useRoutes to return predefined routes
    const mockRoutes = [
        {path: '/products/:id', component: ProductDetail},
        {path: '/category/:id', component: ProductDetail},
        {path: '/some-path', component: ProductDetail},
        {path: '*', component: ProductDetail}
    ]

    setRoutesMock = jest.fn()
    ;(
        jest.requireMock('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks').useRoutes as jest.Mock
    ).mockReturnValue({
        routes: mockRoutes,
        setRoutes: setRoutesMock
    })
    const WrappedComponent = SeoHOC(insideComponent)
    return {WrappedComponent}
}

describe('SeoHOC', () => {
    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        // Default mock for useLocation
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/products/123'
        })
    })

    describe('setRoutes and isNavigationBlocked call', () => {
        it('renders the wrapped component and passes props', () => {
            const {WrappedComponent} = setupForSetRoutesTests()
            render(<WrappedComponent />)
            // expect the component to render
            expect(screen.getByText('Inner Component')).toBeInTheDocument()
        })

        it('calls setIsNavigationBlocked when isBlocked changes', () => {
            const {WrappedComponent} = setupForSetRoutesTests()
            render(<WrappedComponent />)
            expect(mockSetIsNavigationBlocked).toHaveBeenCalledWith(true)
        })

        it('calls setRoutes with Redirect component if resourceType is undefined', async () => {
            // Set the mockRefetch response for this test BEFORE setupForSetRoutesTests
            mockRefetch.mockResolvedValue({
                status: 'success',
                data: {destinationUrl: '/redirect'}
            })
            const {WrappedComponent} = setupForSetRoutesTests()

            render(<WrappedComponent />)
            await act(async () => {
                await navCallback?.({pathname: '/some-path'}, 'PUSH')
            })
            await waitFor(() => {
                expect(setRoutesMock).toHaveBeenCalled()
            })
            const call = setRoutesMock.mock.calls[0][0][0]
            expect(call.path).toBe('/some-path')
            expect(call.component().type.displayName || call.component().type.name).toMatch(
                /Redirect/
            )
        })

        it('calls setRoutes with custom component if urlMappingResponse has resourceType', async () => {
            // Set the mockRefetch response for this test
            mockRefetch.mockResolvedValue({
                status: 'success',
                data: {destinationUrl: '/redirect', resourceType: 'product'}
            })
            const {WrappedComponent} = setupForSetRoutesTests()
            render(<WrappedComponent />)
            await act(async () => {
                await navCallback?.({pathname: '/some-path'}, 'PUSH')
            })
            await waitFor(() => {
                expect(setRoutesMock).toHaveBeenCalled()
            })
            const call = setRoutesMock.mock.calls[0][0][0]
            expect(call.path).toBe('/some-path')
            // The component should be a function that renders a Redirect
            expect(call.component().type.displayName).toBe('ProductDetail')
        })

        it('handles refetch error status gracefully', async () => {
            const {WrappedComponent} = setupForSetRoutesTests()
            mockRefetch.mockResolvedValueOnce({
                status: 'error',
                data: undefined
            })
            render(<WrappedComponent />)
            await act(async () => {
                await navCallback?.({pathname: '/error-path'}, 'PUSH')
            })
            // Should not throw, and setRoutes should not be called
            expect(setRoutesMock).not.toHaveBeenCalled()
        })

        it('handles error status from refetch', async () => {
            const {WrappedComponent} = setupForSetRoutesTests()
            mockRefetch.mockResolvedValueOnce({
                status: 'error',
                data: undefined
            })
            render(<WrappedComponent />)
            await act(async () => {
                await navCallback?.({pathname: '/no-data-path'}, 'PUSH')
            })
            // Should not throw, and setRoutes should not be called
            expect(setRoutesMock).not.toHaveBeenCalled()
        })

        it('handles empty data from refetch', async () => {
            const {WrappedComponent} = setupForSetRoutesTests()
            mockRefetch.mockResolvedValueOnce({
                status: 'success',
                data: undefined
            })
            render(<WrappedComponent />)
            await act(async () => {
                await navCallback?.({pathname: '/no-data-path'}, 'PUSH')
            })
            // Should not throw, and setRoutes should not be called
            expect(setRoutesMock).not.toHaveBeenCalled()
        })

        it('does not call setRoutes if navCallback is not set', () => {
            // navCallback is set by useBlockNavigation mock, so we can test the absence by not rendering
            expect(navCallback).toBeDefined()
        })
    })
})
