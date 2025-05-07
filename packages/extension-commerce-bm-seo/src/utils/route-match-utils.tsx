/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {matchPath as matchPathReactRouter} from 'react-router-dom'
import {RouteProps} from '@salesforce/pwa-kit-extension-sdk/types'

/**
 * Checks whether the given URL path matches a predefined route defined in the application's routes config.
 * Optionally filters out wildcard routes and warns if multiple wildcard routes are detected.
 * @param pathname - The URL path to check
 * @param routes - Array of route configurations to check against
 * @param options - Optional configuration for filtering wildcard routes
 * @returns The matching route object or undefined if no match is found
 */
export const matchPath = (
    pathname: string,
    routes: RouteProps[],
    options?: {filterWildcardRoutes: boolean}
): {path: string} | undefined => {
    let validRoutes = routes
    // Filter out routes ending with a wildcard if the option is set
    if (options?.filterWildcardRoutes) {
        const wildcardRoutes = routes.filter((route) => route.path.endsWith('*'))
        if (wildcardRoutes.length > 1) {
            console.warn(
                `Multiple wildcard routes detected (${wildcardRoutes.length}). This may cause unexpected routing behavior. Wildcard routes:`,
                wildcardRoutes.map((route) => route.path)
            )
        }
        validRoutes = routes.filter((route) => !route.path.endsWith('*'))
    }

    const routeMatch = validRoutes.find(({path}) =>
        matchPathReactRouter(pathname, {
            path,
            exact: true
        })
    )
    return routeMatch
}
