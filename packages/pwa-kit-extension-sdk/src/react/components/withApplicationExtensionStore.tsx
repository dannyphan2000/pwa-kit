/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'

// Local
import {useApplicationExtensionsStore} from '../hooks/useApplicationExtensionsStore'

// Local Types
import {SliceInitializer} from '../hooks/useApplicationExtensionsStore'

// Local Types
type withStoreOptions = {
    id: string
    initializer: SliceInitializer<any>
}

/**
 * This HOC is used to add a slice to the global store for an extension.
 *
 * @param WrappedComponent
 * @param options
 * @returns
 */
const withApplicationExtensionStore = <C,>(
    WrappedComponent: React.ComponentType<C>,
    options: withStoreOptions
) => {
    const {id, initializer} = options

    // Because there extensions have unique slice names, we can safely add them to the global store.
    useApplicationExtensionsStore.getState().addSlice(id, initializer)

    // Return the original component as we aren't modifying it in any way... yet.
    return WrappedComponent
}

export default withApplicationExtensionStore
