/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {ChakraProvider, extendTheme, ThemeOverride} from '@chakra-ui/react'
import {useMergedTheme} from '../hooks/use-theme'

type WithChakraProviderProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
export const withChakraProvider = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithChakraProvider: React.FC<P> = (props: WithChakraProviderProps) => {
        const theme = useMergedTheme()
        return (
            <ChakraProvider theme={theme}>
                <WrappedComponent {...(props as P)} />
            </ChakraProvider>
        )
    }

    return WithChakraProvider
}
