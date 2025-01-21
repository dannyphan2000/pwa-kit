/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
// Local
import {useStore} from '../hooks/useApplicationExtensionsStore'

// Types
import {ApplicationExtension} from '../classes/ApplicationExtension'

// Local Types
type withStoreOptions = {
    id?: string,
    sliceInitializer?: any
}

const withStore = <C,>(WrappedComponent: React.ComponentType<C>, options: withStoreOptions) => {
    const {id = '@salesforce/extension-chakra-store-locator', sliceInitializer} = options

    // Because there extensions have unique slice names, we can safely add them to the global store.
    useStore
        .getState()
        .addSlice(id, sliceInitializer)

    return WrappedComponent
}

export default withStore
