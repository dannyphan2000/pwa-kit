/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'

// Platform Imports
import {
    ApplicationExtension,
    SliceInitializer,
    withApplicationExtensionStore
} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs, isServerSide} from '@salesforce/pwa-kit-extension-sdk/react/utils'
import {
    GetRoutesParams,
    BeforeRouteMatchParams,
    RouteProps,
    ComponentMap,
    MyRouteProps
} from '@salesforce/pwa-kit-extension-sdk/types'
import {routeComponent} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/route-component'

// Local Imports
import {Config} from './types'
import {getAppOrigin, getShopperSeoClient} from './utils/utils'

// Overridable Imports
// Using the `overridable` loader means that you are opting in to the override module resolution flow. As a result this module
// will be resolved by first looking in the base projects `overrides` folder then the overrides folders of any extensions configured
// after this one. Only if no module is found will the referenced module in this project be used.
import sampleHOC from 'overridable!./components/sample-hoc'

// Others
import extensionMeta from '../extension-meta.json'
import Sample from './pages/sample'

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
            // Example higher-order component, this can be safely removed.
            sampleHOC,
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
     * TODO: update this comment
     * This method is used to make changes to the PWA-Kit application routes. If your extension adds a new page to the application
     * then you can add it to the router here. The routes passed to this method is an accrued list of routes that have been added
     * from extensions applied before it. It is called during the `getRoutes` phase on both the server and the client.
     *
     * NOTE: If you instead want to modify a list of all the routes, refer to the `beforeRouteMatch` below.
     */
    async getRoutesAsync({locals}: GetRoutesParams): Promise<RouteProps[]> {
        // TODO: do we need this?
        if (!locals.originalUrl) {
            return Promise.resolve([])
        }

        // Make SEO GET Url Mapping API call
        const config = this.getConfig()
        const shopperSeo = await getShopperSeoClient(locals, config)
        let urlMapping = await shopperSeo.getUrlMapping({
            parameters: {urlSegment: locals.originalUrl}
        })
        console.log('--- url mapping', urlMapping)

        // DEBUG
        urlMapping = {resourceType: 'category'}

        if (!urlMapping.resourceType) {
            return Promise.resolve([])
        }

        // Transform URL mapping to serialized route
        const requestURL = new URL(locals.originalUrl, getAppOrigin(locals))
        const componentName =
            config.resourceTypeToComponentMap[
                urlMapping.resourceType as keyof typeof config.resourceTypeToComponentMap
            ]
        const component = createPlaceholderPage(componentName)

        // @ts-ignore
        return Promise.resolve([
            {
                path: requestURL.pathname,
                component,
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
    beforeRouteMatch({allRoutes, locals}: BeforeRouteMatchParams): RouteProps[] {
        const {resourceTypeToComponentMap} = this.getConfig()
        const getComponentName = (route: MyRouteProps) => {
            return route.component?.displayName || route.componentName || ''
        }

        const index = allRoutes.findIndex((route) => {
            const componentName = getComponentName(route)
            return Object.values(resourceTypeToComponentMap).includes(componentName)
        })
        if (index === -1) {
            return allRoutes
        }

        const routes = allRoutes.slice()
        const [asyncRoute] = routes.splice(index, 1)
        const componentName = getComponentName(asyncRoute)

        const component = routes.find((_route) =>
            getComponentName(_route).includes(componentName)
        )?.component

        if (!component) {
            // TODO: fix error message
            throw Error(`Could not find component with displayName "${componentName}"`)
        }

        asyncRoute.component = component

        const result = [asyncRoute, ...routes]
        console.log('--- beforeRouteMatch: resulting routes', result)
        return result
    }

    // getComponentMap(): ComponentMap {
    //     return {}
    // }
}

export default CommerceBmSeo

const createPlaceholderPage = (componentName: string) => {
    // @ts-ignore
    Sample.displayName = componentName
    return Sample

    // TODO: wrap this component with loadable
    // const PlaceholderPage = () => {
    //     return
    // }
    // PlaceholderPage.displayName = componentName

    // return PlaceholderPage
}
