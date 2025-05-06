/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/no-var-requires */
const baseConfig = require('@salesforce/pwa-kit-dev/configs/babel/babel-config').default
const path = require('path')

// Create a copy of the config manually to preserve functions
const extendedConfig = {
    ...baseConfig
}

const originalIgnoreFunction = baseConfig.ignore && baseConfig.ignore[0]

extendedConfig.ignore = [
    function (filepath) {
        // First check our additional allowlist
        const normalizedPath = path.normalize(filepath)
        // allowlist these ESM packages so they're NOT ignored
        const allowlist = ['@chakra-ui', '@ark-ui', 'proxy-compare', 'uqr']

        // If it's in an allowed package, DO NOT ignore it
        if (allowlist.some((pkg) => normalizedPath.includes(`node_modules${path.sep}${pkg}`))) {
            return false
        }

        if (typeof originalIgnoreFunction === 'function') {
            return originalIgnoreFunction(filepath)
        }

        // Fallback logic if originalIgnoreFunction doesn't exist
        if (/node_modules/.test(normalizedPath)) {
            return true // Ignore node_modules by default
        }

        return false
    }
]

module.exports = extendedConfig
