/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import {Compiler, LoaderContext} from 'webpack'
import {ApplicationExtensionEntry} from '../../types'

export interface ApplicationExtensionsLoaderOptions {
    configured: ApplicationExtensionEntry[]
    target: 'node' | 'web'
}

export type ApplicationExtensionsLoaderContext = LoaderContext<ApplicationExtensionsLoaderOptions>

/**
 * Define the ExtendedCompiler type by picking and adding properties
 * from the Webpack LoaderContext.
 */
export type ExtendedCompiler = Compiler & {
    custom?: {
        extensions: any[]
    }
}

export interface OverridesResolverRuleOptions {
    extensions?: ApplicationExtensionEntry[]
    projectDir: string
    resolveExtensions: string[]
    target?: string
    isMonoRepo?: boolean
}
