/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type {ApplicationExtensionConfig} from '@salesforce/pwa-kit-extension-sdk/types'
import {
    SliceInitializer
} from '@salesforce/pwa-kit-extension-sdk/react'
export interface UserConfig extends ApplicationExtensionConfig {
    // react-router-style path to the new sample page
    path?: string
}

/**
 * When instantiating your extension, pwa-kit-extension-sdk will make sure to pass in the "complete" configuration, which has the merged user-defined and default configs.
 */
export type Config = Required<UserConfig>

interface StoreSlice {
    isBlocked: boolean
    setIsBlockedFalse: () => void
    setIsBlockedTrue: () => void
    setIsBlocked: (someBool: boolean) => void
}

// This is safe to delete if your extension does not use state. If you aren't using this, ensure you remove the
// `withApplicationExtensionStore` usage below as well.
export const sliceInitializer: SliceInitializer<StoreSlice> = (set) => ({
    isBlocked: false,
    setIsBlockedFalse: () => set((state) => ({...state, isBlocked: false})),
    setIsBlockedTrue: () => set((state) => ({...state, isBlocked: true})),
    setIsBlocked: (someBool) => set((state) => ({...state, isBlocked: someBool}))
})
