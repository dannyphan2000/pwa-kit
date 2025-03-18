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

// Types
import {ApplicationExtensionConfig, ComponentMap, DeserializedExtension, SerializedExtension} from '../../types'

const isServerSide = typeof window === 'undefined'

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
export abstract class ApplicationExtension<
    Config extends ReactApplicationExtensionConfig
> extends ApplicationExtensionBase<Config> {
    public isRoutesAsync: boolean
    protected _cachedRoutes: RouteProps[] | null = null

    constructor(config: Config) {
        super(config)
        this.extendRoutes = this.extendRoutes.bind(this)
        this.isRoutesAsync = this.isGetRoutesAsync()

        if (this.isRoutesAsync) {
            this.handleAsyncRoutes()
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
     * you to modify the routes of the base application, typically used to add new routes pointing
     * at page components added by your application extension.
     *
     * @protected
     * @param routes - The list application routes currently loaded.
     * @returns routes - The modified application routes.
     */
    public extendRoutes(routes: RouteProps[]): Promise<RouteProps[]> {
        return Promise.resolve(routes)
    }

    public getRoutes(): RouteProps[] | Promise<RouteProps[]> {
        return []
    }

    /**
     * Called before route matching is evaluated. This method gives each extension the opportunity
     * to modify the routes knowing that the list of routes passed-in is complete.
     *
     * @protected
     * @param routes - All the application routes from both extensions and base application.
     * @returns routes - The modified application routes.
     */
    public beforeRouteMatch(routes: RouteProps[]): RouteProps[] {
        return routes
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
            if (!route.component?.displayName) {
                throw new Error(`Component for route with path "${route.path}" is missing a displayName in ${this.getName()} extension`)
            }
            return {
                path: route.path,
                componentName: route.component?.displayName,
            }
        })
        return {
            routes: serializedRoutes
        }
    }

    /**
     * Returns a map of component names to components that are used to deserialize the extension data.
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
    private deserialize(serializedExtension: SerializedExtension): DeserializedExtension {
        if (!this.getComponentMap) {
            throw new Error(`${this.getName()}.getRoutes() is async but does not define getComponentMap()`);
        }

        const componentMap = this.getComponentMap()
        const routes = serializedExtension.routes.map(
            ({path, componentName}) => {
                let component = componentMap[componentName]

                if (!component) {
                    throw new Error(`${componentName} component could not be deserialized for route with path: ${path}`)
                }

                return {
                    path,
                    exact: true,
                    component
                }
            }
        )
        return {routes}
    }

    private handleAsyncRoutes() {
        if (!isServerSide) {
            // Deserialize the routes on the client to ensure the latest routes are loaded on the client
            this._cachedRoutes = this.deserialize(window.__EXTENSIONS__[this.getName()]).routes;
        }
    
        // Apply caching for the getRoutes method
        this.applyCacheForMethod('getRoutes', '_cachedRoutes');
    }

    private isGetRoutesAsync(): boolean {
        const routes = this.getRoutes();
        return routes instanceof Promise;
    }

    private applyCacheForMethod(methodName: string, cacheProperty: string) {
        const originalMethod = (this as any)[methodName];

        if (typeof originalMethod === 'function') {
            (this as any)[methodName] = function (this: any, ...args: any[]) {
                if (this[cacheProperty] !== null) {
                    return this[cacheProperty];
                }

                const result = originalMethod.apply(this, args);

                if (result instanceof Promise) {
                    const promise = result.then((resolved) => (this[cacheProperty] = resolved));
                    this[cacheProperty] = promise;
                    return promise;
                } else {
                    return (this[cacheProperty] = result);
                }
            };
        }
    }

}
