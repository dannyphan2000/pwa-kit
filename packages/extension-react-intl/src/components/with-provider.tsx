/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import Provider from './provider'

/**
 * Higher-order component that conditionally wraps a given component with ChakraProvider.
 *
 * @param WrappedComponent - The component to be optionally wrapped with ChakraProvider.
 * @param theme - Optional Chakra UI theme to be used
 * @returns A component that wraps the given component with ChakraProvider if it is not already present in the component tree.
 */
const withI18nProvider = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
) => {
    // write a higher-order component that wraps the given component with the I18nProvider
    const WithI18nProvider: React.FC<P> = (props: P) => {
        return <Provider>
            <WrappedComponent {...props} />
        </Provider>
    }
    return WithI18nProvider
}

export default withI18nProvider