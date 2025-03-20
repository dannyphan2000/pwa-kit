/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {ApplicationExtension} from './ApplicationExtension'
import {ApplicationExtensionConfig, RouteProps} from '../../types'
import React from 'react'

const mockRoutes : RouteProps[] = [{
        path: '/test',
        component: {displayName: 'TestComponent'} as any
    },
    {
        path: '/test-route-with-exact',
        component: {displayName: 'TestComponent'} as any,
        exact: true
    }
]

class TestConfig implements ApplicationExtensionConfig {
    [key: string]: any
    enabled = true
}

class TestExtension extends ApplicationExtension<TestConfig> {
    static readonly id = 'test-extension'
    public getRoutes(): RouteProps[] {
        return mockRoutes
    }
}

class TestExtensionAsyncRoutes extends ApplicationExtension<TestConfig> {
    static readonly id = 'test-extension'
    public async getRoutesAsync(params: any): Promise<RouteProps[]> {
        return Promise.resolve(mockRoutes)
    }
}


describe('ApplicationExtension', () => {
    let extension: ApplicationExtension<TestConfig>
    let extensionAsyncRoutes: ApplicationExtension<TestConfig>
    let mockComponent: React.ComponentType<any>

    beforeEach(() => {
        const config = new TestConfig()
        extension = new TestExtension(config)
        extensionAsyncRoutes = new TestExtensionAsyncRoutes(config)
        mockComponent = jest.fn(() => <div>Test Component</div>)
    })

    describe('extendApp', () => {
        test('should return the provided component without modification', () => {
            const result = extension.extendApp(mockComponent)
            expect(result).toBe(mockComponent)
        })
    })

    /*
    describe('extendRoutes', () => {
        test('should return the routes array without modification', () => {
            const routes: RouteProps[] = [
                {path: '/home', component: mockComponent},
                {path: '/about', component: mockComponent}
            ]

            const result = extension.extendRoutes(routes)
            expect(result).toEqual(routes)
        })

        test('should allow for modification of routes', () => {
            const routes: RouteProps[] = [{path: '/home', component: mockComponent}]
            const additionalRoute: RouteProps = {path: '/new', component: mockComponent}

            const extendRoutesSpy = jest
                .spyOn(extension, 'extendRoutes')
                .mockImplementation((baseRoutes) => {
                    return Promise.resolve([...baseRoutes, additionalRoute])
                })

            const modifiedRoutes = extension.extendRoutes(routes)
            expect(modifiedRoutes).toContainEqual(additionalRoute)
            expect(modifiedRoutes).toHaveLength(routes.length + 1)

            extendRoutesSpy.mockRestore()
        })
    })
    */

    describe('serialize', () => {
        it('should serialize routes correctly', async () => {
            if (extensionAsyncRoutes.getRoutesAsync) {
                await extensionAsyncRoutes.getRoutesAsync({locals: {}})
            }
            const serialized = extensionAsyncRoutes.serialize()
            expect(serialized).toEqual({
                routes: [
                    {
                        path: '/test',
                        componentName: 'TestComponent'
                    },
                    {
                        path: "/test-route-with-exact",
                        componentName: 'TestComponent',
                        exact: true,
                    },
                ]
            })
        })

        it('should throw an error if getRoutesAsync() is not called before serializing', () => {
            expect(() => extensionAsyncRoutes.serialize()).toThrow(
                'Routes have not been loaded. Call getRoutesAsync() before serializing'
            )
        })

        it('should throw an error if a route component is missing displayName', () => {
            // Mock `_cachedRoutes` to contain a route with a component missing `displayName`
            extensionAsyncRoutes['_cachedRoutes'] = [
                {
                    path: '/test-route',
                    component: {} as any // Missing displayName
                }
            ]
    
            expect(() => extensionAsyncRoutes.serialize()).toThrow(
                'Component for route with path "/test-route" is missing a displayName in the TestExtensionAsyncRoutes extension'
            )
        })
    })

    describe('handle async routes', () => {
        it('should cache getRoutesAsync result', async () => {
            let routes
            if (extensionAsyncRoutes.getRoutesAsync) {
                routes = await extensionAsyncRoutes.getRoutesAsync({locals: {}})
            }
            expect(routes).toEqual(mockRoutes)
            expect(extensionAsyncRoutes['_cachedRoutes']).toEqual(routes)
        })

        it('should return the cached result on subsequent getRoutesAsync calls', async () => {
            const cachedRoutes = [
                {
                    path: '/cached-route',
                    component: {displayName: 'CachedComponent'} as any
                }
            ]
            extensionAsyncRoutes['_cachedRoutes'] = cachedRoutes

            let routes
            if (extensionAsyncRoutes.getRoutesAsync) {
                routes = await extensionAsyncRoutes.getRoutesAsync({locals: {}})
            }

            expect(routes).toEqual(cachedRoutes)
        })
    })
})
