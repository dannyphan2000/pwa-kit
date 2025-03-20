/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// Third-Party
import {RouteProps} from 'react-router-dom'

// Local
import {ApplicationExtension as ApplicationExtensionBase} from '../../shared/classes/application-extension-base'
import {applyCacheForMethod} from '../utils/helpers'

// Types
import {ApplicationExtensionConfig, BeforeRouteMatchParams, GetRoutesParams, ComponentMap, DeserializedExtension, SerializedExtension, SerializedRoute} from '../../types'

export type ReactApplicationExtensionConfig = ApplicationExtensionConfig

const isServerSide = typeof window === 'undefined'

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
    protected _cachedRoutes: (RouteProps | SerializedRoute)[] | null = null

    constructor(config: Config) {
        super(config)

        if (this.getRoutesAsync) {
            // Deserialize the routes on the client to ensure the latest routes are loaded on the client
            this._cachedRoutes = this.deserialize()?.routes || null
            // Apply caching for the getRoutes method
            applyCacheForMethod(this, 'getRoutesAsync', '_cachedRoutes')
        }    
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
     * Returns routes asynchronously.
     * Only needed for async route loading.
     */
    public async getRoutesAsync?(): Promise<(RouteProps | SerializedRoute)[]>

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
     * Called on the server to serialize the extension data that will be sent to the client.
     *
     * @returns SerializedExtension - The serialized extension data.
     * @throws Error if the routes have not been loaded.
     */
    public serialize(): SerializedExtension {
        if (this._cachedRoutes === null) {
            throw new Error('Routes have not been loaded. Call getRoutes() before serializing')
        }
        const serializedRoutes = this._cachedRoutes.map((route) => {
            // Check if it is already serialized
            if ('componentName' in route) {
                return route
            }
            if (!route.component?.displayName) {
                throw new Error(
                    `Component for route with path "${
                        route.path
                    }" is missing a displayName in ${this.getName()} extension`
                )
            }
            return {
                path: route.path,
                componentName: route.component?.displayName,
                exact: true
            }
        })
        return {
            routes: serializedRoutes
        }
    }

    /**
     * Returns a map of component names to components used for deserializing extension data 
     * when `getRoutes()` is asynchronous.
     * 
     * This method is required only if `getRoutes()` is asynchronous.
     * 
     * It is recommended to use loadable components whenever possible to reduce bundle size.
     *
     * @protected
     * @returns ComponentMap - The map of component names to components.
     */
    protected getComponentMap?(): ComponentMap

    /**
     * Called on the client to deserialize the extension data that was serialized on the server.
     *
     * @param serializedExtension - The serialized extension data.
     * @returns DeserializedExtension - The deserialized extension data.
     * @throws Error if getComponentMap() is not defined.
     * @throws Error if the deserialized component cannot be found in the component map.
     */
    private deserialize(): DeserializedExtension | null {
        if (isServerSide) {
            return null
        }

        if (!this.getComponentMap) {
            throw new Error(
                `${this.getName()}.getRoutes() is async but does not define getComponentMap()`
            )
        }

        const componentMap = this.getComponentMap()
        const serializedExtension = window.__EXTENSIONS__[this.getName()]
        const routes = serializedExtension.routes.map(({componentName, ...route}) => {
            const component = componentMap[componentName]

            if (!component) {
                throw new Error(
                    `${componentName} component could not be deserialized for route with path: ${route.path}`
                )
            }

            return {
                ...route,
                component
            }
        })
        return {routes}
    }
}
