/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import jose from 'jose'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'


const throwSlasTokenValidationError = (message, code) => {
    throw new Error(`SLAS Token Validation Error: ${message}`, code)
}

const createRemoteJWKSet = () => {
    const appOrigin = getAppOrigin()
    const {app: appConfig} = getConfig()
    const shortCode = appConfig.commerceApi.parameters.shortCode
    const tenantId = appConfig.commerceApi.parameters.organizationId
    const JWKS_URI = `${appOrigin}/${shortCode}/${tenantId}/oauth2/jwks`
    return jose.createRemoteJWKSet(new URL(JWKS_URI))
}

export const verifySlasCallbackToken = async (token) => {
    try {
        const jwks = createRemoteJWKSet(new URL(jwksUri))
        const {payload} = await jose.jwtVerify(token, jwks, {})
        return payload
    } catch (error) {
        throwSlasTokenValidationError(error.message, 401)
    }
}
