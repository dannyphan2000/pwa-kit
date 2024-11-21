/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Types
import {ApplicationExtensionEntry} from '../../types'

interface ApplicationExtensionConfigPluginOptions {
    extensions: ApplicationExtensionEntry[]
}

// This Webpack plugin injects the provided extensions configuration on to the compiler object. This allows us
// to use the `overrides-resolver-loader` as an inline loader knowing that it can get the extensions configuration
// from the compilation object

class ApplicationExtensionConfigPlugin {
    private options: ApplicationExtensionConfigPluginOptions

    constructor(options: ApplicationExtensionConfigPluginOptions) {
        this.options = options
    }

    apply(compiler: any) {
        compiler.hooks.initialize.tap('ApplicationExtensionConfigPlugin', () => {
            compiler.custom = {
                extensions: this.options.extensions
            }
        })
    }
}

export default ApplicationExtensionConfigPlugin
