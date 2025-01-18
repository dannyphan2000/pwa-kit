/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/**
 * @module @salesforce/pwa-kit-react-sdk/ssr/universal/errors
 */

/**
 * @class HTTPError
 * @extends Error
 * @param {number} status - The HTTP status code
 * @param {string} message - The error message
 * @example
 * import {HTTPError} from '@salesforce/pwa-kit-react-sdk/ssr/universal/errors'
 * 
 * // Create an HTTPError
 * const error = new HTTPError(404, 'Not Found')
 * console.log(error.message)
 * // Not Found
 */
export class HTTPError extends Error {
    constructor(status, message) {
        super(message)
        this.constructor = HTTPError
        this.__proto__ = HTTPError.prototype
        this.message = message
        this.status = status
    }

    toString() {
        return `HTTPError ${this.status}: ${this.message}`
    }
}

/**
 * @class HTTPNotFound
 * @extends HTTPError
 * @param {string} message - The error message
 * @example
 * import {HTTPNotFound} from '@salesforce/pwa-kit-react-sdk/ssr/universal/errors'
 * 
 * // Create an HTTPNotFound error
 * const error = new HTTPNotFound('Not Found')
 * console.log(error.message)
 * // Not Found
 */
export class HTTPNotFound extends HTTPError {
    constructor(message) {
        super(404, message)
        this.constructor = HTTPNotFound
        this.__proto__ = HTTPNotFound.prototype
    }
}
