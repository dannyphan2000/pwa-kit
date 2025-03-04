/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {RouteProps} from 'react-router-dom'
import {Request} from 'express'

// Platform Imports
import {
    ApplicationExtension,
    SliceInitializer,
    withApplicationExtensionStore
} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'
import {transformUrlMappingToRoute} from '@salesforce/pwa-kit-react-sdk/utils/routes'

// Local Imports
import {Config} from './types'
import {SerializedRoute} from './types/routes'
import {getUrlMapping} from './utils/routes'

// Others
import extensionMeta from '../extension-meta.json'

interface StoreSlice {
    count: number
    increment: () => void
    decrement: () => void
}

// This is safe to delete if your extension does not use state. If you aren't using this, ensure you remove the
// `withApplicationExtensionStore` usage below as well.
const sliceInitializer: SliceInitializer<StoreSlice> = (set) => ({
    count: 0,
    increment: () => set((state) => ({count: state.count + 1})),
    decrement: () => set((state) => ({count: state.count - 1}))
})

// TODO: change name of extension
class SeoUrlMappingExtension extends ApplicationExtension<Config> {
    static readonly id = extensionMeta.id

    /**
     * Use this method to wrap or enhance your PWA-Kit application using [React higher-order components](https://legacy.reactjs.org/docs/higher-order-components.html).
     * You can use this to add visual treatments to your application, change the props that are supplied to the application component
     * or add things like providers and contexts to be used throughout your app.
     */
    extendApp<T extends React.ComponentType<T>>(
        App: React.ComponentType<T>
    ): React.ComponentType<T> {
        const HOCs = [
            // Optionally include state for this extension using `withApplicationExtensionStore`
            (component: React.ComponentType<any>) =>
                withApplicationExtensionStore(component, {
                    id: extensionMeta.id,
                    initializer: sliceInitializer
                })
        ]

        return applyHOCs(App, HOCs)
    }

    /**
     * This method is used to make changes to the PWA-Kit application routes. If your extension adds a new page to the application
     * then you can add it to the router here. The routes passed to this method is an accrued list of routes that have been added
     * from extensions applied before it. It is called during the `getRoutes` phase on both the server and the client.
     *
     * NOTE: If you instead want to modify a list of all the routes, refer to the `beforeRouteMatch` below.
     */
    async extendRoutes(routes: RouteProps[], req?: Request): Promise<RouteProps[]> {
        // TODO: Get map from config ----
        const {resourceTypeToComponentMap, commerceApi} = this.getConfig()
        const path = req?.path
        if (!path) {
            // Client
            const _routes = window.__CONFIG__.app.routes
            let configuredRoutes = _routes.map(
                ({path, componentName, componentProps}: SerializedRoute) => {
                    // DEVELOPER NOTE: We previously tried to dynamically load the component using the path to map to the
                    // filename and use import, but I couldn't get that to work. So here we are using the original routes
                    // array to find the component for a given path from the serialized route config. It doesn't completely
                    // work as it will remove the configured routes as they don't match the path. This should be done in
                    // another way.
                    let component = routes.find((route) =>
                        route.component?.displayName?.includes(componentName)
                    )?.component
                    if (!component) {
                        // TODO: Error handling if given component couldn't be found
                        return
                    }

                    if (componentProps) {
                        const Component = component
                        component = () => <Component {...componentProps} />
                    }
                    return {
                        path,
                        exact: true,
                        component
                    }
                }
            )
            configuredRoutes = configuredRoutes.filter((route) => !!route)
            // TODO: do I need to run configureRoutes here for locals? My guess is no because chakra-storerfront does it beforehand
            return configuredRoutes
        }
        const mapping = await getUrlMapping(path, commerceApi)
        if (!mapping) {
            return routes
        }

        // Find the component
        const componentDisplayName =
            resourceTypeToComponentMap[
                mapping.resourceType as keyof typeof resourceTypeToComponentMap
            ]
        // TODO error handling if component not found
        const component = routes.find((route) =>
            route.component?.displayName?.includes(componentDisplayName)
        )?.component

        const route = transformUrlMappingToRoute(path, mapping, component)
        return [route, ...routes]
    }

    /**
     * This method is used on the server during the rendering pipeline. It's provided a list of all the routes that your application
     * is configured with, including those defined in the base application and those added by all the extensions. You can use this
     * method to modify these routes in any way you want, but you must return an array of routes as a result.
     */
    beforeRouteMatch(allRoutes: RouteProps[]): RouteProps[] {
        return allRoutes
    }
}

export default SeoUrlMappingExtension
