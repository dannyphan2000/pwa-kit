/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {LoaderContext} from 'webpack'
import path from 'path'
import resolve from 'resolve'

// Local Imports
import {buildCandidatePaths, getPackageName} from '../../shared/utils'

// Types
import type {ExtendedCompiler} from './types'

// TODO: Move to constants file.
// Constants
const SRC = 'src'
const OVERRIDES = 'overrides'
const APP = 'app'

/**
 * Webpack loader to override the resolution of a module based on the PWA-Kit applications
 * extension configuration.
 *
 * This loader resolves a new resource path by evaluating possible overrides in other
 * extensions, transpilubg the file with the same loaders/plugins as the original file.
 *
 * @param {LoaderContext<any>} this - The Webpack loader context, which provides information
 * about the module being processed and the current Webpack compiler.
 */
const OverrideResolverLoader = function (this: LoaderContext<any>) {
    // Get the import path relative to the project base directory.
    // NOTE: We intensionally exclude any path prefixes like "/" or "./" so that we can
    // use `packageIterator` in the "resolve" function used later on.
    const {resourcePath, _compiler} = this
    const compiler = _compiler as ExtendedCompiler
    const projectRelPath = resourcePath.split(`${SRC}/`)[1].split('.')[0] // File path relative to the project directory without file extension
    const projectPath = resourcePath.split(SRC)[0]
    const options = this.getOptions()

    // Get the package name
    // NOTE: There is an opportunity to make this more performant as most of the time the file path will have
    // the package name in it because it's in the node_modules folder and we can parse it out. But there are times,
    // like when you use a mono-repo or local npm packages that you can't do this. So as a fallback you have to process
    // the packageJSON file.
    const packageName = getPackageName(projectPath, {filesystem: options.resolveOptions})

    if (!packageName) {
        console.warn('OVERRIDES-LOADER: Unable to determine import package name. Bailing...')
        return resourcePath
    }

    // Lets use the compiler configuration to ensure we are resolving the correct file extensions.
    const compilerOptions = this._compiler!.options
    const extensions = compilerOptions.resolve?.extensions || []
    const basedir = options?.baseDir || process.cwd()
    const applicationExtensions = compiler?.custom?.extensions || []

    // Get the master list of all possible candidate paths based on your current extension configuration.
    console.log('packageName: ', packageName)
    let paths = buildCandidatePaths(projectRelPath, {
        packageName,
        projectDir: basedir,
        extensionEntries: applicationExtensions
    })

    // Extensions that define overridable files can only have those files overridden by other extensions configured
    // after it, and also the base template. For this reason we have to slice the candidate paths at it returns paths
    // for all configured extensions.
    // @example
    // Given the following extension list: ['@salesforce/extension-a', '@salesforce/extension-b', '@salesforce/extension-c']
    // Overridable files defined in extension-a can only be overridden by extensions b and c, and the base project.
    // Overridable files defined in extension-b can only be overridden by extension c, and the base project.
    // Overridable files defined in extension-c can only be overridden by the base project.
    const currentExtensionIndex = paths.findIndex((path) => path.indexOf(packageName) > -1)
    paths = paths.slice(0, currentExtensionIndex)

    // TODO: think about moving this back into the buildCandidatePaths utility, so we have a single place that is dealing with
    // resolver path generation.
    const baseProjectOverridePath = path.join(basedir, APP, OVERRIDES, packageName, projectRelPath)
    // Here we are using the the `resolve` library to resolve the project relative path in conjunction with
    // 'packageIterator' that will allow use to search for the import in other folders/projects.

    // Also include the base override path and the path from the extension doing the import.
    const resolvedResourcePath = resolve.sync(projectRelPath, {
        basedir,
        extensions,
        packageIterator: () => [
            baseProjectOverridePath, // Always look in the base project for an override for a given import path, this is the highest priority.
            ...paths, // Next look at all the overrides in applicable application extensions overrides
            resourcePath // Finally fallback to the file that is being overridden.
        ],
        ...options?.resolveOptions
    })

    // Tell Webpack to treat this new resource as a dependency of the original module in order to have the dependency
    // traspiled with all the same loaders/plugins that the orginal file was.
    this.addDependency(resolvedResourcePath)

    // Use Webpack's `loadModule` function to load, process, and transpile the alternative module
    const callback = this.async()

    // Load the replacement module adding a `noHMR=true` query so we can prevent the HMR plugin from trying
    // to define its globals again.
    this.loadModule(`${resolvedResourcePath}?noHMR=true`, (err, newSource) => {
        if (err) return callback(err)

        // Return the loaded and transpiled content of the alternative module
        callback(null, newSource)
    })
}

// Export the loader as the default export with proper typing
export default OverrideResolverLoader
