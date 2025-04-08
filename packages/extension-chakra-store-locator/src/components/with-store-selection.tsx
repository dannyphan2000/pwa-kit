/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {useExtensionStore} from '../hooks/use-extension-store'
import {StoreSelectionProvider} from './provider'
import {Config} from '../types/config'

/**
 * Higher-order component that wraps a component with the StoreSelectionProvider
 * @param store Selected store data
 * @returns A function that takes a component and returns a wrapped component with access to the selected store and state
 */
export const withStoreSelection = <P extends object>(
    WrappedComponent: React.ComponentType<P>,
    config: Config
): React.ComponentType<P> => {
    const WithStoreSelection = (props: P) => {
        return (
            <StoreSelectionProvider config={config}>
                <WrappedComponent {...props} />
            </StoreSelectionProvider>
        )
    }

    // Preserve the display name for debugging
    WithStoreSelection.displayName = `WithStoreSelection(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`

    return WithStoreSelection
}
