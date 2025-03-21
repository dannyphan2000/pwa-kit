/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {BaseStorage} from './base'

const globalMap = new Map()

export class MemoryStorage extends BaseStorage {
    constructor(options = {}) {
        super(options)
        // Use optional chaining operator to check if sharedContext is true
        this.map = options?.sharedContext ? globalMap : new Map()
    }

    set(key, value) {
        const suffixedKey = this.getSuffixedKey(key)
        this.map.set(suffixedKey, value)
    }

    get(key) {
        const suffixedKey = this.getSuffixedKey(key)
        return this.map.get(suffixedKey) || ''
    }

    delete(key) {
        const suffixedKey = this.getSuffixedKey(key)
        this.map.delete(suffixedKey)
    }
}
