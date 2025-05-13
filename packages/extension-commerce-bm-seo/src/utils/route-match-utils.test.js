/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {matchPath} from './route-match-utils'

describe('matchPath', () => {
    const NullComponent = () => null
    const routes = [
        {path: '/', component: NullComponent},
        {path: '/about', component: NullComponent},
        {path: '/contact', component: NullComponent},
        {path: '/products/*', component: NullComponent},
        {path: '/products/:id', component: NullComponent},
        {path: '*', component: NullComponent}
    ]
    const routesWithUndefined = [
        {path: '/', component: NullComponent},
        {path: undefined, component: NullComponent},
        {path: '/about', component: NullComponent}
    ]

    it('should return the matching route', () => {
        const result = matchPath('/about', routes)
        expect(result).toEqual({path: '/about', component: NullComponent})
    })

    it('should return the matching route with wildcard if filterWildcardRoutes is false', () => {
        const result = matchPath('/products/123', routes)
        expect(result).toEqual({path: '/products/*', component: NullComponent})
    })

    it('should return the matching route without wildcard if filterWildcardRoutes is true', () => {
        const result = matchPath('/products/123', routes, {filterWildcardRoutes: true})
        expect(result).toEqual({path: '/products/:id', component: NullComponent})
    })

    it('should return undefined if no match is found and filterWildcardRoutes is true', () => {
        const result = matchPath('/none', routes, {filterWildcardRoutes: true})
        expect(result).toBeUndefined()
    })

    it('should return undefined for an undefined path', () => {
        const result = matchPath(undefined, routes)
        expect(result).toBeUndefined()
    })

    it('should ignore undefined paths in the routes array', () => {
        const result = matchPath('/about', routesWithUndefined, {filterWildcardRoutes: true})
        expect(result).toEqual({path: '/about', component: NullComponent})
    })

    it('should log a warning for undefined paths in the routes array', () => {
        const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
        matchPath('/about', routesWithUndefined, {filterWildcardRoutes: true})
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            expect.stringContaining('Undefined paths detected'),
            expect.arrayContaining([expect.objectContaining({path: undefined})])
        )
        consoleWarnSpy.mockRestore()
    })
})
