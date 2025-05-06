/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import dedent from 'dedent'
import fse from 'fs-extra'
import Handlebars from 'handlebars'
import path from 'path'

// Local
import {kebabToUpperCamelCase} from '../shared/utils'

// Types
import {ApplicationExtensionsLoaderOptions} from './webpack/types'
import type {ApplicationExtensionEntry} from '../types'

// Constants
import {LOCAL_EXTENSIONS_DIR, OVERRIDABLE_FILE_NAME, NODE_MODULES_FOLDER} from './constants'

// Register Handlebars helpers
Handlebars.registerHelper('getInstanceName', (aString: string) => {
    // Extract namespace and name from the package identifier
    const hasNamespace = aString.startsWith('@') && aString.includes('/')
    const [namespace, name] = hasNamespace
        ? [aString.slice(1).split('/')[0], aString.split('/')[1]]
        : ['', aString]

    return kebabToUpperCamelCase(`${namespace ? `${namespace}-` : ''}${name}`)
})
Handlebars.registerHelper('isNotLast', (index, arrayLength) => index !== arrayLength - 1)
Handlebars.registerHelper('isNode', (target) => target === 'node')
Handlebars.registerHelper('isWeb', (target) => target === 'web')
Handlebars.registerHelper('jsonStringify', (context) => JSON.stringify(context, null, 0))

// NOTE: We inline this template because it's easier to bundle it in the code than load it from the file system due
// to issues with pathing because the current working directory for the loader isn't the same as the base project.
// We can look to resolve this in the future as it would be nice to have a independant file for the template.
const templateString = dedent`
    {{#if (isWeb @root.target)}}
    import loadable from '@loadable/component'
    {{/if}}

    {{#each configured}}
    {{#if (isNode @root.target)}}
    import {{getInstanceName this.[0]}} from '{{this.[0]}}/setup-server'
    {{else}}
    const {{getInstanceName this.[0]}}Loader = loadable.lib(() => import('{{this.[0]}}/setup-app'))
    {{/if}}
    {{/each}}

    const extensionConfigs = {
        {{#each configured}}
        '{{this.[0]}}': {{{jsonStringify this.[1]}}},
        {{/each}}
    }

    {{#if (isNode @root.target)}}
    const getApplicationExtensions = () => {
        {{#if configured}}
        return [{{#each configured}}new {{getInstanceName this.[0]}}({{{jsonStringify this.[1]}}}){{#if (isNotLast @index @root.configured.length)}}, {{/if}}{{/each}}]
        {{else}}
        return []
        {{/if}}
    }
    {{else}}
    const getApplicationExtensions = async () => {
    	{{#if configured}}
        const modules = await Promise.all([{{#each configured}}{{getInstanceName this.[0]}}Loader.load(){{#if (isNotLast @index @root.configured.length)}},{{/if}}{{/each}}])
        return [{{#each configured}}new modules[{{@index}}].default({{{jsonStringify this.[1]}}}){{#if (isNotLast @index @root.configured.length)}}, {{/if}}{{/each}}]
        {{else}}
        return []
        {{/if}}
    }
    {{/if}}

    export {
        getApplicationExtensions,
        extensionConfigs
    }
`

export const renderTemplate = (data: ApplicationExtensionsLoaderOptions) => {
    // Compile the template
    const template = Handlebars.compile(templateString)

    // Apply data to the compiled template
    return template(data).trim()
}

/**
 * @private
 * Reads and parses a .force_overrides file into a list of clean override entries.
 * - Skips empty lines
 * - Skips full-line comments (`// comment`)
 * - Supports inline comments (`override // comment`)
 */
export const getOverridesFromFile = (filePath: string): string[] => {
    try {
        const content = fse.readFileSync(filePath, 'utf8')
        return content
            .split(/\r?\n/)
            .map((line) => line.trim())
            .filter((line) => line && !line.startsWith('//'))
            .map((line) => line.split('//')[0].trim()) // remove inline comments
            .filter(Boolean)
    } catch (e: any) {
        if (e.code !== 'ENOENT') {
            console.warn(`Error reading override file at ${filePath}:`, e)
        }
        return []
    }
}

/**
 * PRIVATE: Returns a list of potential file paths where `.force_overrides` files might exist.
 *
 * These paths include:
 * - A top-level `.force_overrides` file in the root of the project.
 * - One per extension, prioritized with the local package version first.
 *
 * Note:
 * - Each extension is assumed to be either a string or a tuple, where the first item is the extension name.
 * - This function does not check if the files actually exist; it simply builds candidate paths.
 *
 * @param projectDir - The root directory of the project.
 * @param extensions - A list of extension names or tuples where the first element is the extension name.
 * @returns An array of string file paths to check for overrides.
 */
export const getForceOverridesFilePaths = (
    projectDir: string,
    extensions: ApplicationExtensionEntry[]
): string[] => {
    return [
        path.join(projectDir, OVERRIDABLE_FILE_NAME),
        ...extensions.flatMap((ext) => {
            const name = typeof ext === 'string' ? ext : ext[0]
            return [
                path.join(projectDir, LOCAL_EXTENSIONS_DIR, name, OVERRIDABLE_FILE_NAME),
                path.join(projectDir, NODE_MODULES_FOLDER, name, OVERRIDABLE_FILE_NAME)
            ]
        })
    ]
}
