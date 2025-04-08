/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {useTheme, Theme, ChakraProvider} from '@chakra-ui/react'

import {useApplicationExtensions} from '@salesforce/pwa-kit-extension-sdk/react'

import {extendTheme} from '@chakra-ui/react'

type WithOptionalChakra = React.ComponentPropsWithoutRef<any>

/**
 * Higher-order component that conditionally wraps a given component with ChakraProvider.
 *
 * @param WrappedComponent - The component to be optionally wrapped with ChakraProvider.
 * @param theme - Optional Chakra UI theme to be used
 * @returns A component that wraps the given component with ChakraProvider if it is not already present in the component tree.
 */
export const withOptionalChakra = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    theme?: Theme
) => {
    const WithOptionalChakra: React.FC<P> = (props: WithOptionalChakra) => {
        // console.log('withOptionalChakra: ', withOptionalChakra)
        const chakraTheme = useTheme()

        // @TODO: Is there a better way to determine if ChakraProvider is already in the tree?
        const hasChakraProvider = chakraTheme && Object.keys(chakraTheme || {}).length > 0

        // Get all the extensions.
        // Note: Should be be able to filter extensions based on type? We don't want to call getTheme on the theme extension for example.
        let extensions = useApplicationExtensions()
        extensions = [...extensions].reverse()

        // 🔥 Merge all namespaced themes dynamically
        // NOTE: Here I am reversing the order of the extensions, but what I should really be doing is ensuring that the 1 theme extension
        // is always the first.
        const mergedTheme: any = extendTheme(theme, ...extensions.reverse().map((extension: any) => {
            return extension.getTheme()
        }))

        // console.log('extension product detail hasChakraProvider: ', hasChakraProvider)
        return !hasChakraProvider ? (
            <ChakraProvider theme={mergedTheme}>
                <WrappedComponent {...(props as P)} />
            </ChakraProvider>
        ) : (
            <WrappedComponent {...(props as P)} />
        )
    }

    return WithOptionalChakra
}
