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

// Local Imports
import {Config} from './types'

// Components
import {withChakra} from './components'

// Others
import extensionMeta from '../extension-meta.json'

// Theme
import {theme} from './theme'

class SalesforceExtensionTheme extends ApplicationExtension<Config> {
    static readonly id = extensionMeta.id

    extendApp<T extends React.ComponentType<T>>(
        App: React.ComponentType<T>
    ): React.ComponentType<T> {
        const HOCs = [withChakra]

        return applyHOCs(App, HOCs)
    }

    getTheme(): any {
        return theme
    }
}

export default SalesforceExtensionTheme
