/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {runWebpackCompiler} from './test-utils'

// Local Imports
import ApplicationExtensionConfigPlugin from './application-extensions-config-plugin'

describe('Overrides Resolver Loader', () => {
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
            expects: (output) => {
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
                    const stats = await runWebpackCompiler(entryPoint, {
                        files,
                        buildPlugins: () => plugins
                    })

                    // Here we are looking at the first module imported via the dollar syntax and testing that it's right.
                    output = stats.compilation.compiler.custom
                    // console.log('output: ', output)
                } catch (e) {
                    error = e
                }

                expects(output, error)
            })
        })
    })
})
