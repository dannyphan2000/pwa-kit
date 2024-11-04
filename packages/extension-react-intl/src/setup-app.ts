/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {Config} from './types'

import {ApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'
import withI18nProvider from './components/with-provider'

class ReactIntlExtension extends ApplicationExtension<Config> {
    extendApp<T>(App: React.ComponentType<T>): React.ComponentType<T> {
        console.log('extendApp is implemented in extension-react-intl')
        return withI18nProvider(App)
    }
}

export default ReactIntlExtension
