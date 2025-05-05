/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {RouteProps} from 'react-router-dom'

// Platform Imports
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {
    ApplicationExtension,
    SliceInitializer,
    withApplicationExtensionStore
} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'
import {
    AsyncRouteProps,
    ComponentMap,
    GetRoutesParams,
    BeforeRouteMatchParams
} from '@salesforce/pwa-kit-extension-sdk/types'

// Local Imports
import {Config} from './types'
import {
    createPlaceholderComponent,
    getComponentForUrlMapping,
    withPropsWrapper
} from './utils/component-utils'
import {getShopperSeoClient} from './utils/shopper-seo-utils'

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

class CommerceBmSeo extends ApplicationExtension<Config> {
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
    async getRoutesAsync({locals}: GetRoutesParams): Promise<AsyncRouteProps[]> {
        let urlMapping
        const appOrigin = getAppOrigin()

        // TODO: do we need this check?
        if (!locals.originalUrl) {
            return Promise.resolve([])
        }

        // Make SEO GET Url Mapping API call
        const urlSegment: string = locals.originalUrl.split('?')[0]
        const config = this.getConfig()
        const shopperSeo = await getShopperSeoClient(locals, config)
        try {
            urlMapping = await shopperSeo.getUrlMapping({
                parameters: {urlSegment}
            })
        } catch (e) {
            console.error(`Couldn't find mapping for given segement: ${urlSegment}`)
        }

        if (!urlMapping) {
            return Promise.resolve([])
        }

        const {component, props} = getComponentForUrlMapping(
            urlMapping,
            config.resourceTypeToComponentMap
        )
        const requestURL = new URL(urlSegment, appOrigin)
        return Promise.resolve([
            {
                path: requestURL.pathname,
                component,
                componentProps: props,
                exact: true
            }
        ])
    }

    /**
     * TODO: update comment to make it clearer that beforeRouteMatch is also called on the client side
     * This method is used on the server during the rendering pipeline. It's provided a list of all the routes that your application
     * is configured with, including those defined in the base application and those added by all the extensions. You can use this
     * method to modify these routes in any way you want, but you must return an array of routes as a result.
     */
    beforeRouteMatch({allRoutes}: BeforeRouteMatchParams): RouteProps[] {
        const updatedRoutes = [...allRoutes]
        const filteredRoutes = updatedRoutes.filter((route) => !route.component?.isPlaceholder)

        for (let i = 0; i < updatedRoutes.length; i++) {
            const route = updatedRoutes[i]
            if (!route.component.isPlaceholder) continue

            const componentName: string = route.component.displayName
            const actualComponent = filteredRoutes.find((r) =>
                r.component?.displayName?.includes(componentName)
            )?.component

            if (!actualComponent) {
                throw new Error(`Could not find component with displayName "${componentName}"`)
            }

            const componentProps = route.componentProps || {}

            // We need to wrap the component using withPropsWrapper to ensure that the non-react
            // specific statics are copied over such as getComponent().
            route.component = withPropsWrapper(actualComponent, componentProps)
        }

        return updatedRoutes
    }

    getComponentMap(): ComponentMap {
        // This extension handles deserialization of routes in beforeRouteMatch instead
        // of using the component map. This is because this extension relies on components
        // defined in other extensions which can only be resolved in beforeRouteMatch
        // where all routes are available.
        const {resourceTypeToComponentMap} = this.getConfig()

        // Generate a map where each unique component name is associated with a placeholder component
        return Array.from(new Set(Object.values(resourceTypeToComponentMap))).reduce(
            (acc: ComponentMap, name) => {
                acc[name] = createPlaceholderComponent()
                return acc
            },
            {} as ComponentMap
        )
    }
}

export default CommerceBmSeo
