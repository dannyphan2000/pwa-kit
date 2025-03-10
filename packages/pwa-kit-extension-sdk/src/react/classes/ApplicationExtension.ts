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
import {ApplicationExtensionConfig, Module, Modules} from '../../types'

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
    public extendRoutes(routes: RouteProps[]): RouteProps[] {
        return routes
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
     * Protected method to get the component map. This method should be called
     * by subclasses to provide the correct path for importing modules.
     *
     * @protected
     * @param path - The path to the modules directory that contains the page components.
     * @returns A promise that resolves to the component map.
     */
    protected async generateComponentMapFromModules(modules: Modules): Promise<Modules> {
        const componentMap = Object.keys(modules).reduce((acc: Modules, key: string) => {
            const module = modules[key]
            // TODO: will displayName always exist or do we need error handling?
            acc[module.displayName] = module
            return acc
        }, {})
        return componentMap 
    }


    // TODO: should we make an abstract class for getComponentMap to enforce 
    // subclasses to implement it?
    /**
     * Default method to get the component map using the default path './pages'.
     * Subclasses can override this method if they need to use a different path.
     *
     * @returns A promise that resolves to the component map.
     */
    // public abstract getComponentMap(): Promise<ComponentMap>
}
