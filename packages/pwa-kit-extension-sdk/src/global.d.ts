/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {SerializedExtension} from './types'

// TODO fix typing of fields
declare global {
    interface Window {
        __INITIAL_CORRELATION_ID__: string
        __CONFIG__: object
        __PRELOADED_STATE__: string
        __ERROR__: object
        __EXTENSIONS__: {[key: string]: SerializedExtension}
        Progressive: object
    }
}

export {} // Ensures this is treated as a module
