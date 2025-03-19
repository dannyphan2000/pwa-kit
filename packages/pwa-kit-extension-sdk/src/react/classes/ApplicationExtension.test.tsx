/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {RouteProps} from 'react-router-dom'
import {ApplicationExtension} from './ApplicationExtension'
import {ApplicationExtensionConfig} from '../../types'
import React from 'react'

class TestConfig implements ApplicationExtensionConfig {
    [key: string]: any
    enabled = true
}

class TestExtension extends ApplicationExtension<TestConfig> {
    static readonly id = 'test-extension'
    public getRoutes(): RouteProps[] {
        return [
            {
                path: '/test',
                component: {displayName: 'TestComponent'} as any
            }
        ]
    }
}

class TestExtensionAsyncRoutes extends ApplicationExtension<TestConfig> {
    static readonly id = 'test-extension'
    public async getRoutes(): Promise<RouteProps[]> {
        return Promise.resolve([
            {
                path: '/test',
                component: {displayName: 'TestComponent'} as any
            }
        ])
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

    describe('isRoutesAsync', () => {
        it('should return false if getRoutes() is not async', () => {
            expect(extension.isRoutesAsync).toBe(false)
        })

        it('should return true if getRoutes() is async', () => {
            expect(extensionAsyncRoutes.isRoutesAsync).toBe(true)
        })
    })

    describe('extendApp', () => {
        test('should return the provided component without modification', () => {
            const result = extension.extendApp(mockComponent)
            expect(result).toBe(mockComponent)
        })
    })

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

    describe('serialize', () => {
        it('should serialize routes correctly', async () => {
            await extensionAsyncRoutes.getRoutes()
            const serialized = extensionAsyncRoutes.serialize()
            expect(serialized).toEqual({
                routes: [
                    {
                        path: '/test',
                        componentName: 'TestComponent'
                    }
                ]
            })
        })

        it('should throw an error if getRoutes() is not called before serializing', () => {
            expect(() => extensionAsyncRoutes.serialize()).toThrow(
                'Routes have not been loaded. Call getRoutes() before serializing'
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
                'Component for route with path "/test-route" is missing a displayName in TestExtensionAsyncRoutes extension'
            )
        })
    })

    describe('handle async routes', () => {
        it('should not cache getRoutes result when it is sync', async () => {
            const routes = extension.getRoutes()
            expect(routes).toEqual([
                {
                    path: '/test',
                    component: {displayName: 'TestComponent'}
                }
            ])
            expect(extensionAsyncRoutes['_cachedRoutes']).toBeNull()
        })

        it('should cache getRoutes result when it is async', async () => {
            const routes = await extensionAsyncRoutes.getRoutes()
            expect(routes).toEqual([
                {
                    path: '/test',
                    component: {displayName: 'TestComponent'}
                }
            ])
            expect(extensionAsyncRoutes['_cachedRoutes']).toEqual(routes)
        })

        it('should return the cached result on subsequent calls', async () => {
            const cachedRoutes = [
                {
                    path: '/cached-route',
                    component: {displayName: 'CachedComponent'} as any
                }
            ]
            extensionAsyncRoutes['_cachedRoutes'] = cachedRoutes
            const routes = await extensionAsyncRoutes.getRoutes()
            expect(routes).toEqual(cachedRoutes)
        })
    })
})
