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

    // TODO: fix types
    const extensionThemes: ThemeOverride[] = extensionWithoutBase
        .map((extension) => {
            const extensionTheme =
                extension.getTheme && extension.getConfig()?.applyTheme ? extension.getTheme() : {}
            return extensionTheme
        })
        .filter((ex) => Object.keys(ex).length !== 0)
    const theme: ThemeOverride = extendTheme(...extensionThemes, baseExtensionTheme)
    // console.log('theme', theme)
    return theme
}
