/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {Stats} from 'webpack'
import {runWebpackCompiler} from './test-utils'

// Local Imports
import ApplicationExtensionConfigPlugin from './application-extensions-config-plugin'

// Types
import type {ExtendedCompiler} from './types'

describe('Application Extensions Config Plugin', () => {
    const testCases = [
        {
            description: 'Plugin injects Application Extensions configuration passed to it.',
            entryPoint: '/app/overrides/pages/sample-page.jsx',
            // Compiler configuration.
            compilerConfig: {
                plugins: [
                    new ApplicationExtensionConfigPlugin({
                        extensions: [
                            ['@salesforce/extension-this', {enabled: true}],
                            ['@salesforce/extension-that', {enabled: true}],
                            ['@salesforce/extension-other', {enabled: true}]
                        ]
                    })
                ],
                files: {
                    // Local project with overrides
                    '/app/overrides/pages/sample-page.jsx': '// Base Project - Sample Page'
                }
            },
            expects: (output: any) => {
                expect(output).toStrictEqual({
                    extensions: [
                        ['@salesforce/extension-this', {enabled: true}],
                        ['@salesforce/extension-that', {enabled: true}],
                        ['@salesforce/extension-other', {enabled: true}]
                    ]
                })
            }
        }
    ]

    describe('application-extensions-config-plugin:', () => {
        testCases.forEach((options: any) => {
            const {compilerConfig, description, entryPoint, expects} = options
            const {plugins, files} = compilerConfig

            test(`${description as string}`, async () => {
                let output, error

                try {
                    const stats: Stats = await runWebpackCompiler(entryPoint, {
                        files,
                        buildPlugins: () => plugins
                    })

                    const compiler: ExtendedCompiler = stats.compilation.compiler
                    output = compiler.custom
                } catch (e) {
                    error = e
                }

                expects(output, error)
            })
        })
    })
})
