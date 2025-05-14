/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// This function is used to get the component for a given resource type from the routes array
export const getComponentForResourceType = (
    routes: Array<{component: React.ComponentType<any> | undefined; path: string}>,
    resourceTypeToComponentMap: {[key: string]: string},
    resourceType: string
) : React.ComponentType<any> | undefined => {
    const ComponentClass = routes.find((_route) =>
        _route.component?.displayName?.includes(resourceTypeToComponentMap[resourceType])
    )
    return ComponentClass?.component
}
