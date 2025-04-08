/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'

// Platform Imports
import {ApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'
import {GetRoutesParams, RouteProps} from '@salesforce/pwa-kit-extension-sdk/types'

// Local Imports
import {Config} from './types'

// Components
import {ProductListPage, withOptionalChakra} from './components'

// Others
import extensionMeta from '../extension-meta.json'

// Theme
import {theme} from './theme'

import {Theme} from '@chakra-ui/react'

class ChakraProductListExtension extends ApplicationExtension<Config> {
    static readonly id = extensionMeta.id

    extendApp<T extends React.ComponentType<T>>(
        App: React.ComponentType<T>
    ): React.ComponentType<T> {
        const HOCs = [
            (component: React.ComponentType<any>) => withOptionalChakra(component, theme as Theme)
        ] as any[]

        return applyHOCs(App, HOCs)
    }

    getRoutes(params: GetRoutesParams): RouteProps[] {
        return [
            {
                exact: true,
                component: ProductListPage,
                path: '/product-list'
            }
        ]
    }

    getTheme() {
        return theme
    }
}

export default ChakraProductListExtension
