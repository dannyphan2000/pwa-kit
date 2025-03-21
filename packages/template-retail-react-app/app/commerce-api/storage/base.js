/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export class BaseStorage {
    constructor(options = {}) {
        this.options = options
        if (typeof this.options.keySuffix !== 'string') {
            this.options.keySuffix = ''
        }
    }

    getSuffixedKey(key) {
        return this.options.keySuffix ? `${key}_${this.options.keySuffix}` : key
    }

    // Abstract methods that must be implemented by child classes
    /* eslint-disable no-unused-vars */
    set(_key, _value, _options) {
        throw new Error('Method "set" must be implemented by child class')
    }

    get(_key) {
        throw new Error('Method "get" must be implemented by child class')
    }

    delete(_key) {
        throw new Error('Method "delete" must be implemented by child class')
    }
    /* eslint-enable no-unused-vars */
}
