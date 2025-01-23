/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {useApplicationExtensions} from '@salesforce/pwa-kit-extension-sdk/react'
import {extendTheme, ThemeOverride} from '@chakra-ui/react'
import {useExtensionConfig} from '../hooks/use-extension-config'
import metaData from '../../extension-meta.json'
import * as ChakraUI from '@chakra-ui/react'

const chakraBuiltInComponents = Object.keys(ChakraUI)

/**
 * This hook will look into each extension theme and merge all the themes into one single theme
 * and provider ChakraProvider and the ability to control the theme of entirely project.
 * As this extension aims to provider one single ChakraProvider for entire app. It should be the first extension
 * to be installed before any other extension-chakra-*.
 * Note: The order of extension is important!
 * the theme of latter extension will override any properties of previous extension except extension-chakra-base
 */
export const useMergedTheme = () => {
    const extensions = useApplicationExtensions()
    // how to get this type right?
    const baseConfig: any = useExtensionConfig()
    const baseExtensionTheme: ThemeOverride = baseConfig.theme
    console.log('baseConfig', baseConfig)
    const extensionWithoutBase = extensions.filter((extension) => {
        return extension.getName() !== metaData.name
    })
    const componentsInExtensions = extensionWithoutBase
        .map((extension) => {
            const theme =
                extension.getTheme && extension.getConfig()?.applyTheme ? extension.getTheme() : {}
            return Object.keys(theme.components)
        })
        .flat()

    // we only want to namespace duplicate component from different extensions that is not chakra built in components
    const duplicateComponents = componentsInExtensions
        .filter(
            (item, index, arr) => arr.indexOf(item) !== index && arr.lastIndexOf(item) === index
        )
        .filter((comp) => !chakraBuiltInComponents.includes(comp))
    console.log('duplicateComponents', duplicateComponents)

    // TODO: fix types
    const extensionThemes: ThemeOverride[] = extensionWithoutBase
        .map((extension) => {
            const extensionTheme =
                extension.getTheme && extension.getConfig()?.applyTheme ? extension.getTheme() : {}
            // Should we get rid of origin component name after name spacing it?
            Object.keys(extensionTheme.components).forEach((componentName) => {
                if (duplicateComponents.includes(componentName)) {
                    console.log('extension.getName()', extension.getName())
                    const nameSpace = `${extension.getName()}/${componentName}`
                    extensionTheme.components[nameSpace] = extensionTheme.components[componentName]
                    delete extensionTheme.components[componentName]
                }
            })
            return extensionTheme
        })
        .filter((ex) => Object.keys(ex).length !== 0)
    const theme: ThemeOverride = extendTheme(...extensionThemes, baseExtensionTheme)

    console.log('theme', theme)
    return theme
}
