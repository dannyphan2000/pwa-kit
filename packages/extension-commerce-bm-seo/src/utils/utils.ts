/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Platform Imports
import Auth from '@salesforce/commerce-sdk-react/auth'
import {ShopperSeo} from 'commerce-sdk-isomorphic'

// Local Imports
import {Config} from '../types'

export const getShopperSeoClient = async (locals: Record<string, any>, config: Config) => {
    const {
        commerceAPI,
        commerceAPIAuth: {propertyNameInLocals: authProperty}
    } = config

    const appOrigin = getAppOrigin(locals)

    // Saving/reusing the commerce api auth (so all extensions have access to it)
    locals[authProperty] =
        locals[authProperty] ??
        new Auth({
            ...commerceAPI.parameters,
            proxy: `${appOrigin}${commerceAPI.proxyPath}`,
            redirectURI: `${appOrigin}/callback`,
            logger: console // TODO: proper logger
        })

    const auth: Auth = locals[authProperty]
    const {access_token} = await auth.ready()

    const clientConfig = {
        ...commerceAPI,
        proxy: `${appOrigin}${commerceAPI.proxyPath}`
    }

    return new ShopperSeo({
        ...clientConfig,
        headers: {authorization: `Bearer ${access_token}`}
    })
}

// getAppOrigin is going to be deprecated in PWA Kit v4. Currently we have a replacement (useOrigin) but it's a React hook. So we still need a non-hook version.
// TODO: move to somewhere in SDK
export const getAppOrigin = (locals: Record<string, any> = {}, fromXForwardedHeader = false): string => {
    if (typeof window !== 'undefined') {
        return window.location.origin
    }

    const xForwardedOrigin = locals.xForwardedOrigin
    if (fromXForwardedHeader && xForwardedOrigin) {
        return xForwardedOrigin
    }

    const {APP_ORIGIN = ''} = process.env
    return APP_ORIGIN
}
