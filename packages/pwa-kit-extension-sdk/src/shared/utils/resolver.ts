/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-party imports
import path from 'path'

// Local
import {expand} from './index'

// Types
import {BuildCandidatePathsOptions} from '../../types'

// TODO: Should this be in a constants folder?
const NODE_MODULES = 'node_modules'
const OVERRIDES = 'overrides'
const APP = 'app'
const SRC = 'src'

// TODO: The extensionsEntries really isn't optional, so maybe it shouldn't exist in the opts object?
/**
 * Based on the current extensibility configuration, return an array of candidate file paths to be used
 * in the dollar-prefixed import module resolution for the given import path.
 *
 * @param {String} importPath - The import module-name.
 * @param {String} sourcePath - The path to the file of the source import.
 * @param {Object} opts - The path the file of the source import.
 * @param {Array<shortName: String, config: Array>} opts.extensionEntries - List of extension entries (tuples) used by the base PWA-Kit application.
 * @param {String} opts.projectDir - Absolute path of the base project.
 */
export const buildCandidatePaths = (
    importPath: string,
    opts: BuildCandidatePathsOptions
) => {
    const {extensionEntries = [], projectDir = process.cwd()} = opts
    let paths: string[] = []
    
    // Map all the extensions and resolve the module names to absolute paths.
    paths = expand(extensionEntries)
        .filter(([, {enabled}]) => typeof enabled === 'undefined' || enabled)
        // .reverse()
        .map(([name]) => name)
        .reduce((acc, extensionRef) => (
            [
                
                path.join(projectDir, NODE_MODULES, extensionRef, SRC, OVERRIDES, importPath),
                ...acc
            ]
        ), [] as string[])

    // Include the base project "overrides" folder as the highest priority source for overrides.
    paths = [
        // Base Project
        path.join(projectDir, APP, OVERRIDES, importPath),
        // Extensions
        ...paths
    ]

    return paths
}
