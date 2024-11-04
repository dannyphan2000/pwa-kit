/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import dedent from 'dedent'
import Handlebars from 'handlebars'

// Local
import {kebabToUpperCamelCase, nameRegex} from '../shared/utils'

// Types
import {ApplicationExtensionsLoaderOptions} from './webpack/types'

// Register Handlebars helpers
Handlebars.registerHelper('getInstanceName', (aString: string) => {
    const match = aString.match(nameRegex)

    // Explicitly define `namespace` and `name` as strings with fallback values
    const namespace = match?.[1] ?? ''
    const name = match?.[2] ?? ''

    return kebabToUpperCamelCase(`${namespace ? `${namespace}-` : ''}${name}`)
})
Handlebars.registerHelper('isNode', (target) => target === 'node')
Handlebars.registerHelper('isWeb', (target) => target === 'web')

// NOTE: We inline this template because it's easier to bundle it in the code than load it from the file system due
// to issues with pathing because the current working directory for the loader isn't the same as the base project.
// We can look to resolve this in the future as it would be nice to have a independant file for the template.
const templateString = dedent`
    import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
    import {expand} from '../../shared/utils/helpers'

    {{#if (isWeb @root.target)}}
    import loadable from '@loadable/component'
    {{/if}}

    {{#each installed}}
    {{#if (isNode @root.target)}}
    import {{getInstanceName .}} from '{{.}}/setup-server'
    {{else}}
    const {{getInstanceName .}}Loader = loadable.lib(() => import('{{.}}/setup-app'))
    {{/if}}
    {{/each}}

    const installedExtensions = {
    {{#each installed}}
    {{#if (isNode @root.target)}}
        '{{.}}': {{getInstanceName .}},
    {{else}}
        '{{.}}': {{getInstanceName .}}Loader,
    {{/if}}
    {{/each}}
    }

    const getConfiguredExtensions = () => expand(getConfig()?.app?.extensions || [])

    {{#if (isNode @root.target)}}
    const getApplicationExtensions = () => {
        const configuredExtensions = getConfiguredExtensions()
        if (configuredExtensions) {
            return configuredExtensions.map((extension) => {
                const packageName = extension[0]
                const config = extension[1]
                return new installedExtensions[packageName](config)
            })
        }
        return []
    }
    {{else}}
    const getApplicationExtensions = async () => {
        const configuredExtensions = getConfiguredExtensions()
        if (configuredExtensions) {
            const modules = await Promise.all(configuredExtensions.map((extension) => {
                const packageName = extension[0]
                return installedExtensions[packageName].load()
            }))
            return configuredExtensions.map((extension, index) => {
                const config = extension[1]
                return new modules[index].default(config)
            })
        }
        return []
    }
    {{/if}}

    export {
        getApplicationExtensions
    }
`

export const renderTemplate = (data: ApplicationExtensionsLoaderOptions) => {
    // Compile the template
    const template = Handlebars.compile(templateString)

    // Apply data to the compiled template
    return template(data).trim()
}
