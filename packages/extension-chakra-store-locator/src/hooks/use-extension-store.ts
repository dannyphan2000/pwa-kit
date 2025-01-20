/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {useStore as useExtensionsStore} from '@salesforce/pwa-kit-extension-sdk/react'
import extensionMeta from '../../extension-meta.json'

/**
 * This hook returns the store for the current application extension.
 */
// export const useExtensionStore = () => useExtensionsStore((state: Record<string, any>) => state[extensionMeta.id])

export const useExtensionStore = () => useExtensionsStore((state: Record<string, any>) => state.state[extensionMeta.id] || {})