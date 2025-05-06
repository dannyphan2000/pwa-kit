/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {render, screen} from '@testing-library/react'
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
jest.mock('@salesforce/pwa-kit-extension-sdk/react', () => ({
    useApplicationExtensionsStore: jest.fn().mockImplementation((selector) => {
        const state = {
            state: {
                '@salesforce/extension-commerce-bm-seo': {
                    setIsNavigationBlocked: jest.fn(),
                    siteLocale: 'en-US'
                }
            }
        }
        return selector(state)
    })
}))

// Mock the useUrlMapping hook
jest.mock('@salesforce/commerce-sdk-react', () => ({
    useUrlMapping: jest.fn()
}))

// Mock useRoutes and useBlockNavigation
jest.mock('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks', () => {
    const originalModule = jest.requireActual('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks')
    return {
        ...originalModule,
        useRoutes: jest.fn(),
        useBlockNavigation: jest.fn().mockReturnValue({
            isBlocked: false,
            blockNavigation: jest.fn(),
            unblockNavigation: jest.fn()
        })
    }
})

describe('SeoHOC', () => {
    const MockComponent = () => <div>Test Component</div>
    const WrappedComponent = SeoHOC(MockComponent)

    beforeEach(() => {
        // Reset all mocks before each test
        jest.clearAllMocks()
        // Default mock for useLocation
        ;(useLocation as jest.Mock).mockReturnValue({
            pathname: '/products/123'
        })
    })

    describe('router_first strategy', () => {
        it('should skip URL mapping when route is defined and strategy is router_first', () => {
            // Mock useExtensionConfig to return router_first strategy
            ;(useExtensionConfig as jest.Mock).mockReturnValue({
                routingMode: 'router_first',
                resourceTypeToComponentMap: {}
            })

            // Mock useRoutes to return predefined routes
            const mockRoutes = [
                {path: '/products/:id', component: MockComponent},
                {path: '/category/:id', component: MockComponent},
                {path: '*', component: MockComponent} // Catch-all route
            ]

            ;(
                jest.requireMock('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks')
                    .useRoutes as jest.Mock
            ).mockReturnValue({
                routes: mockRoutes,
                setRoutes: jest.fn()
            })

            // Mock useUrlMapping to ensure it's not called
            const mockRefetch = jest.fn()
            ;(
                jest.requireMock('@salesforce/commerce-sdk-react').useUrlMapping as jest.Mock
            ).mockReturnValue({
                refetch: mockRefetch
            })

            render(
                <BrowserRouter>
                    <WrappedComponent />
                </BrowserRouter>
            )

            // Verify that the component renders without calling URL mapping
            expect(screen.getByText('Test Component')).toBeInTheDocument()
            expect(mockRefetch).not.toHaveBeenCalled()
        })

        it('should proceed with URL mapping when route is not defined and strategy is router_first', () => {
            // Mock useExtensionConfig to return router_first strategy
            ;(useExtensionConfig as jest.Mock).mockReturnValue({
                routingMode: 'router_first',
                resourceTypeToComponentMap: {}
            })

            // Mock useRoutes to return only catch-all route
            const mockRoutes = [{path: '*', component: MockComponent}]
            ;(
                jest.requireMock('@salesforce/pwa-kit-react-sdk/ssr/universal/hooks')
                    .useRoutes as jest.Mock
            ).mockReturnValue({
                routes: mockRoutes,
                setRoutes: jest.fn()
            })

            // Mock useUrlMapping to ensure it's called
            const mockRefetch = jest.fn()
            ;(
                jest.requireMock('@salesforce/commerce-sdk-react').useUrlMapping as jest.Mock
            ).mockReturnValue({
                refetch: mockRefetch
            })

            render(
                <BrowserRouter>
                    <WrappedComponent />
                </BrowserRouter>
            )

            // Verify that URL mapping is called when route is not defined
            expect(mockRefetch).toHaveBeenCalled()
        })
    })
})
