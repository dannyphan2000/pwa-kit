/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-party imports
import fs from 'fs'
import path from 'path'

// Local
import {expand} from './index'

// Types
import {BuildCandidatePathsOptions} from '../../types'

// TODO: Should this be in a constants folder?
const NODE_MODULES = 'node_modules'
const OVERRIDES = 'overrides'
const SRC = 'src'

/**
 * Returns the pacakge name from the `package.json` at the provided location.
 * @param projectPath The the projects root path.
 * @returns The package name or undefined if not found.
 */
export const getPackageName = (projectPath: string, opts: any): string | undefined => {
    const filesystem: any = opts?.filesystem || fs
    const packageJsonPath = path.join(projectPath, 'package.json')
    let packageName

    if (filesystem.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(filesystem.readFileSync(packageJsonPath, 'utf-8'))
            packageName = packageJson.name || undefined
        } catch (error) {
            console.error(`Failed to parse package.json at ${packageJsonPath}:`, error)
            return undefined
        }
    }

    return packageName
}

// TODO: The extensionsEntries really isn't optional, so maybe it shouldn't exist in the opts object?
/**
 * Based on the current extensibility configuration and the provided import path, return a list of paths
 * representing potential locations for overrides for the given file.
 *
 * @param {String} importPath - The import module-name.
 * @param {Object} opts - The path the file of the source import.
 * @param {Array<shortName: String, config: Array>} opts.extensionEntries - List of extension entries (tuples) used by the base PWA-Kit application.
 * @param {String} opts.projectDir - Absolute path of the base project.
 */
export const buildCandidatePaths = (importPath: string, opts: BuildCandidatePathsOptions) => {
    const {extensionEntries = [], packageName, projectDir = process.cwd()} = opts
    console.log('buildCandidatePaths: ', importPath)
    // Map all the extensions and resolve the module names to absolute paths.
    const paths: string[] = expand(extensionEntries)
        .filter(([, {enabled}]) => typeof enabled === 'undefined' || enabled)
        .map(([name]) => name)
        .reduce(
            (acc, extensionRef) => [
                path.join(projectDir, NODE_MODULES, extensionRef, SRC, OVERRIDES, packageName, importPath),
                ...acc
            ],
            [] as string[]
        )

    return paths
}
