/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import path from 'path'
import * as resolverUtils from './resolver'

describe('resolverUtils', () => {
    describe('"buildCandidatePaths" util returns array of paths used to module resolving base on the provided extension configuration', () => {
        ;[
            {
                name: 'Correct paths are returned when overridable import is used in an application extension',
                resourcePath: path.join('pages', 'sample'),
                extensions: [['extension-a'], ['extension-b'], ['extension-c']],
                expected: [
                    path.join(
                        process.cwd(),
                        'node_modules',
                        'extension-c',
                        'src',
                        'overrides',
                        'pages',
                        'sample'
                    ),
                    path.join(
                        process.cwd(),
                        'node_modules',
                        'extension-b',
                        'src',
                        'overrides',
                        'pages',
                        'sample'
                    ),
                    path.join(
                        process.cwd(),
                        'node_modules',
                        'extension-a',
                        'src',
                        'overrides',
                        'pages',
                        'sample'
                    )
                ]
            },
            {
                name: 'Correct paths are returned when "some" extensions are disabled',
                resourcePath: path.join('pages', 'sample'),
                extensions: [['extension-a'], ['extension-b'], ['extension-c', {enabled: false}]],
                expected: [
                    path.join(
                        process.cwd(),
                        'node_modules',
                        'extension-b',
                        'src',
                        'overrides',
                        'pages',
                        'sample'
                    ),
                    path.join(
                        process.cwd(),
                        'node_modules',
                        'extension-a',
                        'src',
                        'overrides',
                        'pages',
                        'sample'
                    )
                ]
            },
            {
                name: 'Correct paths are returned when "all" extensions are disabled',
                resourcePath: path.join('pages', 'sample'),
                extensions: [
                    ['extension-a', {enabled: false}],
                    ['extension-b', {enabled: false}],
                    ['extension-c', {enabled: false}]
                ],
                expected: []
            }
        ].forEach((testCase) => {
            test(`${testCase.name}`, () => {
                const result = resolverUtils.buildCandidatePaths(testCase.resourcePath, {
                    extensionEntries: testCase.extensions
                })

                expect(result).toEqual(testCase.expected)
            })
        })
    })
})
