/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import jwtDecode from 'jwt-decode'
import {getAppOrigin} from 'pwa-kit-react-sdk/utils/url'
import {HTTPError} from 'pwa-kit-react-sdk/ssr/universal/errors'
import {refreshTokenGuestStorageKey, refreshTokenRegisteredStorageKey} from './constants'
import fetch from 'cross-fetch'
import Cookies from 'js-cookie'
import {SLAS_REFRESH_TOKEN_COOKIE_TTL_OVERRIDE_MSG} from './constants'

/**
 * Compares the token age against the issued and expiry times. If the token's age is
 * within 60 seconds of its valid time (or exceeds it), we consider the token invalid.
 * @function
 * @param {string} token - The JWT bearer token to be inspected
 * @returns {boolean}
 */
export function isTokenExpired(token) {
    if (!token) {
        return true
    }
    const {exp, iat} = jwtDecode(token.replace('Bearer ', ''))
    const validTimeSeconds = exp - iat - 60
    const tokenAgeSeconds = Date.now() / 1000 - iat
    if (validTimeSeconds > tokenAgeSeconds) {
        return false
    }

    return true
}

// Returns fomrulated body for SopperLogin getToken endpoint
export function createGetTokenBody(urlString, slasCallbackEndpoint, codeVerifier) {
    const url = new URL(urlString)
    const urlParams = new URLSearchParams(url.search)
    const usid = urlParams.get('usid')
    const code = urlParams.get('code')
    return {
        grantType: 'authorization_code_pkce',
        code,
        usid,
        codeVerifier: codeVerifier,
        redirectUri: slasCallbackEndpoint
    }
}

// Ocapi related utilities

const toCamel = (str) => {
    if (str.startsWith('_') || str.startsWith('c_')) {
        return str
    }
    return str.replace(/([-_][a-z])/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '')
    })
}

const isObject = (obj) => {
    return obj === Object(obj) && !Array.isArray(obj) && typeof obj !== 'function'
}

export const keysToCamel = (obj) => {
    if (isObject(obj)) {
        const n = {}

        Object.keys(obj).forEach((k) => {
            n[toCamel(k)] = keysToCamel(obj[k])
        })

        return n
    } else if (Array.isArray(obj)) {
        return obj.map((i) => {
            return keysToCamel(i)
        })
    }

    return obj
}

export const camelCaseKeysToUnderscore = (_obj) => {
    if (typeof _obj != 'object') return _obj

    // Copy the incoming object so we dont mutate it
    let obj
    if (Array.isArray(_obj)) {
        obj = [..._obj]
    } else {
        obj = {..._obj}
    }

    for (var oldName in obj) {
        // Camel to underscore

        let newName = oldName.replace(/([A-Z])/g, ($1) => {
            return '_' + $1.toLowerCase()
        })

        // Only process if names are different
        if (newName != oldName) {
            // Check for the old property name to avoid a ReferenceError in strict mode.
            if (Object.prototype.hasOwnProperty.call(obj, oldName)) {
                obj[newName] = obj[oldName]
                delete obj[oldName]
            }
        }

        // Recursion
        if (typeof obj[newName] == 'object') {
            obj[newName] = camelCaseKeysToUnderscore(obj[newName])
        }
    }

    return obj
}

// This function coverts errors/faults returned from the OCAPI API to the format that is returned from the CAPI
// I added the fault key to make life easier as it's hard to discern a CAPI error
export const convertOcapiFaultToCapiError = (error) => {
    return {
        title: error.message,
        type: error.type,
        detail: error.message,
        // Unique to OCAPI I think
        arguments: error.arguments,
        fault: true
    }
}

// This function checks required parameters and or body for requests to OCAPI endpoints before sending
export const checkRequiredParameters = (listOfPassedParameters, listOfRequiredParameters) => {
    const isBodyOnlyRequiredParam =
        listOfRequiredParameters.includes('body') && listOfRequiredParameters.length === 1

    if (!listOfPassedParameters.parameters && !isBodyOnlyRequiredParam) {
        return {
            title: `Parameters are required for this request`,
            type: `MissingParameters`,
            detail: `Parameters are required for this request`
        }
    }

    if (listOfRequiredParameters.includes('body') && !listOfPassedParameters.body) {
        return {
            title: `Body is required for this request`,
            type: `MissingBody`,
            detail: `Body is  required for this request`
        }
    }

    if (
        isBodyOnlyRequiredParam &&
        listOfRequiredParameters.includes('body') &&
        listOfPassedParameters.body
    ) {
        return undefined
    }

    let undefinedValues = listOfRequiredParameters.filter(
        (req) => !Object.keys(listOfPassedParameters.parameters).includes(req)
    )

    undefinedValues = undefinedValues.filter((value) => value !== 'body')

    if (undefinedValues.length) {
        return {
            title: `The following parameters were missing from your resquest: ${undefinedValues.toString()}`,
            type: `MissingParameters`,
            detail: `The following parameters were missing from your resquest: ${undefinedValues.toString()}`
        }
    } else {
        return undefined
    }
}

// This function is used to interact with the OCAPI API
export const createOcapiFetch =
    (commerceAPIConfig) => async (endpoint, method, args, methodName, body) => {
        const proxy = `/mobify/proxy/ocapi`

        // The api config will only have `ocapiHost` during testing to workaround localhost proxy
        const host = commerceAPIConfig.ocapiHost
            ? `https://${commerceAPIConfig.ocapiHost}`
            : `${getAppOrigin()}${proxy}`

        const siteId = commerceAPIConfig.parameters.siteId
        const headers = {
            ...args[0].headers,
            'Content-Type': 'application/json',
            'x-dw-client-id': commerceAPIConfig.parameters.clientId
        }

        let response
        response = await fetch(`${host}/s/${siteId}/dw/shop/v21_3/${endpoint}`, {
            method: method,
            headers: headers,
            ...(body && {
                body: JSON.stringify(body)
            })
        })
        const httpStatus = response.status

        if (!args[1] && response.json) {
            response = await response.json()
        }

        const convertedResponse = keysToCamel(response)
        if (convertedResponse.fault) {
            const error = convertOcapiFaultToCapiError(convertedResponse.fault)
            throw new HTTPError(httpStatus, error.detail)
        } else {
            return convertedResponse
        }
    }

// This function derrives the SF Tenant Id from the SF OrgId
export const getTenantId = (orgId) => {
    // Derive tenant id id form org id
    const indexToStartOfTenantId = orgId.indexOf('_', orgId.indexOf('_') + 1)
    const tenantId = orgId.substring(indexToStartOfTenantId + 1)
    return tenantId
}

/**
 * Indicates if an JSON response from the SDK should be considered an error
 * @param {object} jsonResponse - The response object returned from SDK calls
 * @returns {boolean}
 */
export const isError = (jsonResponse) => {
    if (!jsonResponse) {
        return false
    }

    const {detail, title, type} = jsonResponse
    if (detail && title && type) {
        return true
    }

    return false
}

/**
 * Decorator that wraps functions to handle error response.
 * @param {function} func - A function which returns a promise
 * @returns {function}
 */
export const handleAsyncError = (func) => {
    return async (...args) => {
        const result = await func(...args)
        if (isError(result)) {
            throw new Error(result.detail)
        }
        return result
    }
}

/**
 * Converts snake-case strings to space separated or sentence case
 * strings by replacing '_' with a ' '.
 * @param {string} text snake-case text.
 * @returns {string} space separated string.
 */
export const convertSnakeCaseToSentenceCase = (text) => {
    return text.split('_').join(' ')
}

/**
 * No operation function. You can use this
 * empty function when you wish to pass
 * around a function that will do nothing.
 * Usually used as default for event handlers.
 */
export const noop = () => {}

/** Utility to determine if you are on the browser (client) or not. */
export const onClient = () => typeof window !== 'undefined'

/**
 * Gets the default cookie attributes. Sets the secure flag unless running on localhost in Safari.
 * Sets the sameSite attribute to `"none"` when running in a trusted iframe.
 */
export const getDefaultCookieAttributes = () => {
    return {
        // Deployed sites will always be HTTPS, but the local dev server is served over HTTP.
        // Ideally, this would be `secure: true`, because Chrome and Firefox both treat
        // localhost as a Secure context. But Safari doesn't, so here we are.
        secure: !onClient() || window.location.protocol === 'https:',
        // By default, Chrome does not allow cookies to be sent/read when the code is loaded in
        // an iframe (e.g storefront preview). Setting sameSite to "none" loosens that
        // restriction, but we only want to do so when when the iframe parent is in our allow
        // list. Outside of iframe, we want to keep most browser default value (Chrome or Firefox uses Lax)
        // https://web.dev/samesite-cookie-recipes/
        sameSite: 'Lax'
    }
}

/** Determines whether local storage is available. */
export function detectLocalStorageAvailable() {
    if (typeof window === 'undefined') return false
    try {
        // If access to `localStorage` is forbidden, accessing the property will throw an error
        return !!window.localStorage
    } catch {
        return false
    }
}

/** Determines whether cookies are available by trying to set a test value. */
export function detectCookiesAvailable(options) {
    if (typeof document === 'undefined') return false
    if (!navigator.cookieEnabled) return false
    // Even if `cookieEnabled` is true, cookies may not work. A site may allow first-party, but not
    // third-party, a browser extension may block cookies, etc. The most reliable way to detect if
    // cookies are available is to try to set one
    const testKey = 'commerce-sdk-react-temp'
    const testValue = '1'
    const netOptions = {
        ...getDefaultCookieAttributes(),
        ...options
    }
    try {
        Cookies.set(testKey, testValue, netOptions)
        const success = Cookies.get(testKey) === testValue
        Cookies.remove(testKey, netOptions)
        return success
    } catch {
        return false
    }
}

/**
 * Decode SLAS JWT and extract information such as customer id, usid, etc.
 *
 * @param {string} jwt - The JWT token to parse
 * @returns {Object} Parsed JWT data
 */
export function parseSlasJWT(jwt) {
    const payload = jwtDecode(jwt)
    const {sub, isb, dnt} = payload

    if (!sub || !isb) {
        throw new Error('Unable to parse access token payload: missing sub and isb.')
    }

    // ISB format
    // 'uido:ecom::upn:Guest||xxxEmailxxx::uidn:FirstName LastName::gcid:xxxGuestCustomerIdxxx::rcid:xxxRegisteredCustomerIdxxx::chid:xxxSiteIdxxx',
    const isbParts = isb.split('::')
    const uido = isbParts[0].split('uido:')[1]
    const isGuest = isbParts[1] === 'upn:Guest'
    const customerId = isGuest ? isbParts[3].replace('gcid:', '') : isbParts[4].replace('rcid:', '')

    const loginId = isGuest ? 'guest' : isbParts[1].replace('upn:', '')

    const isAgent = Boolean(isbParts?.[isGuest ? 5 : 6]?.startsWith('agent:'))
    const agentId = isAgent ? isbParts?.[isGuest ? 5 : 6]?.replace('agent:', '') : null

    // SUB format
    // cc-slas::zzrf_001::scid:c9c45bfd-0ed3-4aa2-xxxx-40f88962b836::usid:b4865233-de92-4039-xxxx-aa2dfc8c1ea5
    const usid = sub.split('::')[3].replace('usid:', '')

    return {
        isGuest,
        customerId,
        usid,
        dnt,
        loginId,
        isAgent,
        agentId,
        uido
    }
}

/**
 * Converts a duration in seconds to a Date object.
 * This function takes a number representing seconds and returns a Date object
 * for the current time plus the given duration.
 *
 * @param {number} seconds - The number of seconds to add to the current time.
 * @returns {Date} A Date object for the expiration time.
 */
export function convertSecondsToDate(seconds) {
    if (typeof seconds !== 'number') {
        throw new Error('The refresh_token_expires_in seconds parameter must be a number.')
    }
    return new Date(Date.now() + seconds * 1000)
}