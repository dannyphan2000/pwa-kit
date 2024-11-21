/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import webpack, {
    Compiler,
    Configuration,
    Stats,
    RuleSetRule,
    InputFileSystem,
    OutputFileSystem,
    WebpackPluginInstance,
    ResolvePluginInstance
} from 'webpack'
import {IFs, createFsFromVolume, Volume} from 'memfs'

// TODO: This should be coming from a shared location (config or constants) but we can't do that just yet
// as the config is immediately invoked so it causes errors in this file.
export const SUPPORTED_FILE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.json']

interface WebpackOptions {
    alias?: Record<string, string>
    buildLoaders?: (context: {fileSystem: IFs}) => RuleSetRule[]
    buildPlugins?: (context: {fileSystem: IFs}) => WebpackPluginInstance[]
    buildResolvePlugins?: (context: {fileSystem: IFs}) => ResolvePluginInstance[]
    files?: Record<string, string>
    mode?: Configuration['mode']
}

/**
 * Runs the Webpack compiler with a virtual file system.
 *
 * @param {string} fixture - The name of the entry file for Webpack to compile.
 * @param {Object} [options={}] - Optional configuration for the Webpack compiler.
 * @param {Function} [options.buildPlugins] - A function that returns an array of Webpack plugins. It is passed the virtual file system.
 * @param {Object} [options.files={}] - An object representing the virtual file system. The keys are file paths and the values are file content.
 * @param {Object} [options.mode="none"] - The mode in which you want the compiler to run. Default is "none". NOTE: Running in production mode will cause warning to be suppressed, ensure your tests account for that..
 *
 * @returns {Promise} A promise that resolves with the Webpack stats object or rejects with errors.
 *
 * @example
 * const fixture = 'src/index.js';
 * const files = {
 *   '/src/index.js': 'console.log("Hello, world!");',
 *   '/package.json': '{"name": "test"}'
 * };
 * const plugins = (fs) => [new MyCustomPlugin()];
 * runWebpackCompiler(fixture, { files, buildPlugins: plugins })
 *   .then((stats) => console.log('Compilation successful'))
 *   .catch((errors) => console.error('Compilation failed', errors));
 */
export const runWebpackCompiler = (
    fixture: string,
    options: WebpackOptions = {}
): Promise<Stats> => {
    const {
        alias = {},
        buildLoaders = () => [],
        buildPlugins = () => [],
        buildResolvePlugins = () => [],
        files = {},
        mode = 'none'
    } = options

    // Setup the virtual filesystem with the provided files.
    const volume = Volume.fromJSON(files)
    const fileSystem: IFs = createFsFromVolume(volume)

    // Get loaders and plugins.
    const plugins = buildPlugins({fileSystem})
    const resolvePlugins = buildResolvePlugins({fileSystem})
    const loaders = buildLoaders({fileSystem})

    const compiler: Compiler = webpack({
        entry: `${fixture}`,
        mode,
        output: {
            path: '/dist',
            filename: 'bundle.js'
        },
        resolve: {
            alias,
            extensions: SUPPORTED_FILE_EXTENSIONS,
            plugins: resolvePlugins,
            symlinks: true
        },
        plugins,
        module: {
            rules: loaders
        }
    })

    // Tell Webpack to use the previously created virtual fs.
    compiler.inputFileSystem = fileSystem as unknown as InputFileSystem
    compiler.outputFileSystem = fileSystem as unknown as OutputFileSystem

    return new Promise((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) reject(err)
            if (stats?.hasErrors()) reject(stats?.toJson().errors)

            resolve(stats as Stats)
        })
    })
}
