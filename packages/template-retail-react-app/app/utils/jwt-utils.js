/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {createRemoteJWKSet as joseCreateRemoteJWKSet, jwtVerify} from 'jose'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'


const throwSlasTokenValidationError = (message, code) => {
    throw new Error(`SLAS Token Validation Error: ${message}`, code)
}

const createRemoteJWKSet = () => {
    const appOrigin = getAppOrigin()
    const {app: appConfig} = getConfig()
    const shortCode = appConfig.commerceAPI.parameters.shortCode
    const tenantId = appConfig.commerceAPI.parameters.organizationId
    const JWKS_URI = `${appOrigin}/${shortCode}/${tenantId}/oauth2/jwks`
    console.log('THIS IS THE JWKS_URI: ' + JWKS_URI)
    return joseCreateRemoteJWKSet(new URL(JWKS_URI))
}

export const validateSlasCallbackToken = async (token) => {
    try {
        const jwks = createRemoteJWKSet()
        const {payload} = await jwtVerify(token, jwks, {})
        console.log('THIS IS THE PAYLOAD: ', payload)
        return payload
    } catch (error) {
        throwSlasTokenValidationError(error.message, 401)
    }
}