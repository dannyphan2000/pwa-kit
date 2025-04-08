/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {LoaderDefinitionFunction} from 'webpack'

function kebabToUpperCamel(str: string) {
    return str
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join('')
}

const chakraThemeNamespacerLoader: LoaderDefinitionFunction = function (source) {
    let output = source
    const {resourcePath} = this
    const match = resourcePath.match(/extension-([^/]+)/)
    
    if (!match) {
        // Don't process non-extension files
        return source
    }

    // Check if the file is a theme file.
    const isThemeFile = resourcePath.match(/theme\/index\.ts$/)
    const isJSXFile = resourcePath.match(/\.(jsx|tsx)?$/)

    // Create the namespace based on the extension name.
    const namespace = kebabToUpperCamel(match[1])
    const isThemeExtension = namespace.startsWith('Theme')

    // Here we are going to replace any of the uses of the useStyleConfig
    if (isJSXFile) {
        output = source.replace(
            /useStyleConfig\(\s*'([^']+)'/g,
            (_match: any, key: string) => {
                return `useStyleConfig('${namespace}Extension_${key}'`
            }
        )
    }

    // Process theme files, but not the ones that are already namespaced aka extension themes.
    if (isThemeFile && !isThemeExtension) {
        const componentMatch = /components\s*:\s*{([\s\S]*?)}/.exec(source.toString())
        if (!componentMatch) return source

        const [match, body] = componentMatch
        const rewritten = body.replace(/(\w+)\s*:/, (_, key: string) => `${namespace}Extension_${key}:`)
        
        output = source.toString().replace(match, `components: {${rewritten}}`)
    }

    return output
}

export default chakraThemeNamespacerLoader
