/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {RouteProps} from 'react-router-dom'

// Platform Imports
import {ApplicationExtension, withStore} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'

// Local Imports
import {withOptionalChakra} from './components/with-optional-chakra-provider'
import {withOptionalCommerceSdkReactProvider} from './components/with-optional-commerce-sdk-react-provider'
import {withStoreLocator} from './components/with-store-locator'
import {Config} from './types'

import StoreLocatorPage from './pages/store-locator'
import {logger} from './logger'
import extensionMeta from '../extension-meta.json'

class StoreLocatorExtension extends ApplicationExtension<Config> {
    static readonly id = extensionMeta.id

    extendApp<T extends React.ComponentType<T>>(
        App: React.ComponentType<T>
    ): React.ComponentType<T> {
        const config = this.getConfig()

        if (!config.supportedCountries || config.supportedCountries.length === 0) {
            logger.error(
                '[extension-chakra-store-locator] Missing supportedCountries, this extension will not work.'
            )
        }

        const HOCs = [
            (component: React.ComponentType<any>) => withStoreLocator(component, config),
            (component: React.ComponentType<any>) =>
                withOptionalCommerceSdkReactProvider(component, config),
            (component: React.ComponentType<any>) => withOptionalChakra(component),

            // Do we really want to do this, of should it automatically be done behind the scenes?
            // The positives of doing this here is that we have some flexibility on having or not having state management for a given extension.
            // Also we as lumping all the react cook into one place.
            // The negatives is that it's a little more verbose.
            // Right now we aren't injecting the store into the props of the components which is what you would normally do with an HOC. So we 
            // might want to do that. Instead we are just using the HOC to inject the store slice into the global store.
            (component: React.ComponentType<any>) => withStore(
                component, 
                {
                    sliceInitializer: (set: any, get: any) => ({
                        counter: 0,
                        incrementCounter: () =>
                            set((state: any) => ({
                                counter: state.counter + 1
                            })),
                        decrementCounter: () =>
                            set((state: any) => ({
                                counter: state.counter - 1
                            }))
                    })
                }
            )
            // NOTE: We can also simplify the signature of this HOC by making the options more readable. But the caveat is that we don't have 
            // direct access to the "global store" and only the current slice. 
            // To get around this, we can pass in set/setAll/get/getAll functions to the action function. But that might look ugly and it doesn't
            // align with the return value being the new state.
            // Alternatively we can rely on telling our developers to use the store of a given extension by accessing the global store via the use store
            // hook exported via the SDK. This is a little more verbose but it's more explicit.
            // ,
            // (component: React.ComponentType<any>) => withStore(
            //     component, 
            //     {
            //         initialState: {
            //             counter: 0,
            //             incrementCounter: (state: any) => ({
            //                 counter: state.counter + 1
            //             }),
            //             decrementCounter: (state: any) => ({
            //                 counter: state.counter - 1
            //             })
                            
            //         }
            //     }
            // )

            // Lets also talk about doing something like this:
            // const extension = useApplicationExtension(extensionMeta.id)
            // extension.openModal()
        ]

        return applyHOCs(App, HOCs)
    }

    extendRoutes(routes: RouteProps[]): RouteProps[] {
        return [
            {
                exact: true,
                path: this.getConfig().path,
                component: StoreLocatorPage
            },
            ...routes
        ]
    }

    getSliceInitializer(): any {
        // set: will set the state of the store for this extension slice.
        // get: will get the state of the store for this extension slice.
        return (set: any, get: any) => ({
            counter: 0,
            incrementCounter: () =>
                set((state: any) => ({
                    counter: state.counter + 1
                })),
            decrementCounter: () =>
                set((state: any) => ({
                    counter: state.counter - 1
                }))
        })
        // return () => ({
        //     counter: 0,
        //     incrementCounter: (set: any, get: any) => ({
        //         counter: get().counter + 1
        //     }),
        //     decrementCounter: (state: any) => ({
        //         counter: get().counter - 1
        //     })
        // })
    }
}

export default StoreLocatorExtension
