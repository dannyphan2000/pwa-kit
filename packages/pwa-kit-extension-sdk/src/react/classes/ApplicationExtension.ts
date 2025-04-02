/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Local
import {ApplicationExtension as ApplicationExtensionBase} from '../../shared/classes/application-extension-base'
import {cacheMethodResult, createLoadableComponent, isServerSide} from '../utils/helpers'

// Types
import {RouteProps} from 'react-router-dom'
import {
    ApplicationExtensionConfig,
    BeforeRouteMatchParams,
    ComponentMap,
    GetRoutesParams,
    SerializedRouteProps
} from '../../types'

export type ReactApplicationExtensionConfig = ApplicationExtensionConfig

/**
 * An abstract class representing an Application Extension. This class provides
 * foundational methods and properties for extending an application with additional
 * configuration and routing capabilities. It is designed to be subclassed
 * by other Application Extensions that need to augment the base application, particularly
 * during server and client-side rendering.
 *
 * @abstract
 */
export class ApplicationExtension<
    Config extends ReactApplicationExtensionConfig
> extends ApplicationExtensionBase<Config> {
    protected _cachedRoutes: RouteProps[] | null = null

    constructor(config: Config) {
        super(config)

        if (!isServerSide()) {
            // Deserialize the routes on the client to ensure the latest routes are loaded on the client
            this._cachedRoutes = this.deserializeAsyncRoutes() || null
        }

        cacheMethodResult(this, 'getRoutesAsync', '_cachedRoutes')
    }

    /**
     * Called during the rendering of the base application on the server and the client.
     * It is predominantly used to enhance the "base" application by wrapping it with React providers.
     *
     * @protected
     * @param App - The base application component.
     * @returns EnhancedApp - The enhanced application component.
     */
    public extendApp<T extends React.ComponentType<T>>(
        App: React.ComponentType<T>
    ): React.ComponentType<T> {
        return App
    }

    /**
     * Called during server rendering and client application initialization. This method allows
     * you to add new routes, typically routes pointing at page components added by your application extension.
     *
     * @protected
     * @returns new routes to be added
     */
    public getRoutes(params: GetRoutesParams): RouteProps[] {
        return []
    }

    /**
     * Called during server rendering and client application initialization. This method allows
     * you to add new routes, typically routes pointing at page components added by your application extension.
     *
     * If you wish to add new routes asynchronously (e.g. via API call), please implement this method.
     *
     * @protected
     * @returns a promise resolving to new routes to be added
     */
    public getRoutesAsync?(params: GetRoutesParams): Promise<RouteProps[]>

    /**
     * Called before route matching is evaluated. This method gives each extension the opportunity
     * to modify the routes knowing that the list of routes passed-in is complete.
     *
     * @protected
     * @param routes - All the application routes from both extensions and base application.
     * @returns routes - The modified application routes.
     */
    public beforeRouteMatch(params: BeforeRouteMatchParams): RouteProps[] {
        const {allRoutes} = params
        return allRoutes
    }

    /**
     * Called on the server to serialize the extension's asynchronous routes that will be sent to the client.
     *
     * @returns SerializedRouteProps - The serialized extension data.
     * @returns null if there's no asynchronous state that needs to be serialized
     * @throws Error if the routes have not been loaded.
     */
    public serializeAsyncRoutes(): SerializedRouteProps[] | null {
        if (typeof this.getRoutesAsync === 'undefined') return null

        if (this._cachedRoutes === null) {
            throw new Error(`Routes have not been loaded. Call getRoutesAsync() before serializing`)
        }

        const serializedRoutes = this._cachedRoutes.map((route) => {
            if (!route.component) {
                throw new Error(
                    `Route with path "${String(
                        route.path
                    )}" must contain a component to be serializable in the ${this.getName()} extension`
                )
            }

            const componentPath = (route.component as any).importPath
            if (!componentPath) {
                throw new Error(
                    `Component for route with path "${String(
                        route.path
                    )}" is missing a importPath in the ${this.getName()} extension. Ensure you use createLoadableComponent`
                )
            }

            return {
                ...route,
                componentPath
            }
        })

        return serializedRoutes
    }

    /**
     * Returns a map of component names to components used for deserializing extension data
     * when `getRoutesAsync()` is asynchronous.
     *
     * This method is required only if `getRoutesAsync()` is asynchronous.
     *
     * It is recommended to use loadable components whenever possible to reduce bundle size.
     *
     * @protected
     * @returns ComponentMap - The map of component names to components.
     */
    protected getComponentMap?(): ComponentMap

    /**
     * Called on the client to deserialize the extension's asynchronous routes that were serialized on the server.
     *
     * @returns RouteProps - The deserialized extension routes.
     * @throws Error if getComponentMap() is not defined.
     * @throws Error if the deserialized component cannot be found in the component map.
     */
    private deserializeAsyncRoutes(): RouteProps[] | null {
        if (isServerSide() || typeof this.getRoutesAsync === 'undefined') {
            return null
        }

        const serializedExtension = window.__EXTENSIONS__[this.getName()]

        console.log('JINSU deserializeAsyncRoutes:', serializedExtension)

        const routes = serializedExtension.routes.map(({componentPath, ...route}) => {
            if (!componentPath) {
                throw new Error(
                    `Missing componentPath for the route with path: "${String(
                        route.path
                    )}". Ensure that ${
                        this.serializeAsyncRoutes.name
                    }() correctly assigns a componentPath to the serialized route in the ${this.getName()} extension`
                )
            }

            console.log('deserializeAsyncRoutes before createLoadableComponent', componentPath)
            const component = createLoadableComponent(componentPath)

            if (!component) {
                throw new Error(
                    `"${componentPath}" was not found. Ensure that the path exists in the ${this.getName()} extension`
                )
            }

            return {
                ...route,
                component
            }
        })
        return routes
    }
}
