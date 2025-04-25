/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Others
import extensionMeta from '../../extension-meta.json'

export const EXTENSION_PROPS_KEY: any = extensionMeta.id

// Store props globally
export function storeProps(props: any) {
    if (typeof window !== 'undefined') {
        window[EXTENSION_PROPS_KEY] = props
    }
}

// Retrieve props later
export function getProps() {
    if (typeof window !== 'undefined') {
        return window[EXTENSION_PROPS_KEY] || {}
    }
    return {}
}
