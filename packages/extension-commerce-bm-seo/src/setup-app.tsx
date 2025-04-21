/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {Redirect, RouteProps} from 'react-router-dom'

// Platform Imports
import {
    ApplicationExtension,
    SliceInitializer,
    withApplicationExtensionStore
} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'
import {
    ComponentMap,
    GetRoutesParams,
    BeforeRouteMatchParams
} from '@salesforce/pwa-kit-extension-sdk/types'
import {routeComponent} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/route-component'
import hoistNonReactStatics from 'hoist-non-react-statics'

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
        let urlMapping, component

        // TODO: do we need this?
        if (!locals.originalUrl) {
            return Promise.resolve([])
        }

        // Make SEO GET Url Mapping API call
        const config = this.getConfig()
        const shopperSeo = await getShopperSeoClient(locals, config)
        try {
            urlMapping = await shopperSeo.getUrlMapping({
                parameters: {urlSegment: locals.originalUrl}
            })
        } catch (e) {
            console.error(`Couldn't find mapping for given segement: ${locals.originalUrl}`)
        }

        const requestURL = new URL(locals.originalUrl, getAppOrigin(locals))

        if (!urlMapping) {
            return Promise.resolve([])
        }

        const isRedirect = !urlMapping.resourceType
        if (isRedirect) {
            const props = {to: urlMapping.destinationUrl}
            console.log('getRoutesAsync urlMapping', urlMapping, 'props', props)
            component = () => <Redirect {...props} />
            // Needs a display name for serialization
            component.displayName = 'Redirect'
        } else {
            const componentName =
                config.resourceTypeToComponentMap[
                    urlMapping.resourceType as keyof typeof config.resourceTypeToComponentMap
                ]

            // Create a placeholder component since the component is defined in another extension.
            // Deserialization will be handled in beforeRouteMatch, where all routes from other extensions are accessible.
            component = Object.assign(() => null, {
                displayName: `${this.getName()}.${componentName}`,
                props: {
                    [`${urlMapping.resourceType}Id`]: urlMapping.resourceId
                }
            })
        }

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
        const routes = [...allRoutes]
        const index = routes.findIndex((route) =>
            route.component?.displayName?.includes(this.getName())
        )

        if (index === -1) return routes

        // Extract and remove the matched route
        const [route] = routes.splice(index, 1)
        const componentName = route.component?.displayName?.split('.').pop()

        if (!componentName) return routes

        const ComponentClass = routes.find((_route) =>
            _route.component?.displayName?.includes(componentName)
        )?.component

        console.log(ComponentClass)

        if (!ComponentClass) {
            throw new Error(`Could not find component with displayName "${componentName}"`)
        }
        if (route.component?.props) {
            console.log('route.component.props', route.component.props)
            route.component = withPropsWrapper(ComponentClass, route.component.props)
        }
        return [route, ...routes]
    }

    getComponentMap(): ComponentMap {
        // During deserialization, each serialized route in this extension MUST return a component.
        // This implementation returns an object where the keys are component names in resourceTypeToComponentMap
        // and the values are placeholder components with the displayName.
        const {resourceTypeToComponentMap} = this.getConfig()
        return Object.values(resourceTypeToComponentMap).reduce((acc: ComponentMap, name) => {
            acc[`${this.getName()}.${name}`] = Object.assign(() => null, {
                displayName: `${this.getName()}.${name}`
            })
            return acc
        }, {} as ComponentMap)
    }
}

const withPropsWrapper: GenericHocType<any> = (WrappedComponent: React.ComponentType<C>, props) => {
    const withPropsWrapper = (props: any) => <WrappedComponent {...props} />

    // Set a display name for easier debugging in React DevTools
    withPropsWrapper.displayName = `withPropsWrapper(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`

    return hoistNonReactStatics(withPropsWrapper, WrappedComponent)
}

export default CommerceBmSeo
