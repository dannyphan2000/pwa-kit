/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {LoaderContext} from 'webpack'
import resolve from 'resolve'
import path from 'path'
import fs from 'fs'

// Local Imports
import {buildCandidatePaths} from '../../shared/utils'

// Constants
const SRC = 'src'

/**
 * Finds the closest package.json file from the given directory path and retrieves its package name.
 * @param startPath The starting directory path.
 * @returns The package name from the closest package.json, or null if not found.
 */
const getPackageName = (projectPath: string): string | undefined => {

    const packageJsonPath = path.join(projectPath, 'package.json')
    let packageName

    if (fs.existsSync(packageJsonPath)) {
        try {
            const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
            packageName = packageJson.name || undefined
        } catch (error) {
            console.error(`Failed to parse package.json at ${packageJsonPath}:`, error)
            return undefined
        }
    }

    return packageName
}
const overrideLoader = function (this: LoaderContext<any>) {
    // Get the import path relative to the project base directory.
    // NOTE: We intensionally exclude any path prefixes like "/" or "./" so that we can
    // use `packageIterator` in the "resolve" function used later on.
    const projectRelPath = this.resourcePath.split(`${SRC}/`)[1].split('.')[0]
    
    // Get the package name
    // NOTE: There is an opportunity to make this more performant as most of the time the file path will have
    // the package name in it because it's in the node_modules folder and we can parse it out. But there are times,
    // like when you use a mono-repo or local npm packages that you can't do this. So as a fallback you have to process
    // the packageJSON file.
    const packageName = getPackageName(this.resourcePath.split(SRC)[0])
    console.log('packageName: ', packageName)

    // Lets use the compiler configuration to ensure we are resolving the correct file extensions.
    const options = this._compiler!.options
    const extensions = options.resolve?.extensions || []
    const basedir = process.cwd()

    // @ts-ignore
    let applicationExtensions = this._compiler?.custom?.extensions || []

    // We only want to check for overrides in the following places:
    // 1. Every extension to the "right" (configured after) the extension where the import is coming from
    // NOTE: Base projects shouldn't use the inline loader, only extensions should.
    // TODO
    // Find index and split applicationExtensions

    const paths = [
        ...buildCandidatePaths(projectRelPath, {
            projectDir: basedir,
            // @ts-ignore
            extensionEntries: applicationExtensions
        }),
        this.resourcePath
    ]

    console.log('paths: ', paths)
    // Here we are using the the `resolve` library to resolve the project relative path in conjunction with
    // 'packageIterator' that will allow use to search for the import in other folders/projects.
    const newResourcePath = resolve.sync(projectRelPath, {
        basedir,
        extensions,
        packageIterator: () => paths
    })
    
    // Tell Webpack to treat this new resource as a dependency of the original module in order to have the dependency
    // traspiled with all the same loaders/plugins that the orginal file was.
    this.addDependency(newResourcePath)

    // Use Webpack's `loadModule` function to load, process, and transpile the alternative module
    const callback = this.async()
    
    // Load the replacement module adding a `noHMR=true` query so we can prevent the HMR plugin from trying 
    // to define its globals again.
    this.loadModule(`${newResourcePath}?noHMR=true`, (err, newSource) => {
        if (err) return callback(err)

        // Return the loaded and transpiled content of the alternative module
        callback(null, newSource)
    })
}

// Export the loader as the default export with proper typing
export default overrideLoader