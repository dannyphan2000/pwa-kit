/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Platform Imports
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import Auth from '@salesforce/commerce-sdk-react/auth'
import {ShopperSeo} from 'commerce-sdk-isomorphic'

// Local Imports
import {Config} from '../types'

export const getShopperSeoClient = async (locals: Record<string, any>, config: Config) => {
    const {commerceAPI} = config

    const appOrigin = getAppOrigin()

    // Saving/reusing the commerce api auth (so all extensions have access to it)
    locals['__commerceAPIAuth'] =
        locals['__commerceAPIAuth'] ??
        new Auth({
            ...commerceAPI.parameters,
            proxy: `${appOrigin}${commerceAPI.proxyPath}`,
            redirectURI: `${appOrigin}/callback`,
            // TODO: proper logger
            logger: console
        })

    const auth: Auth = locals['__commerceAPIAuth']
    const {access_token} = await auth.ready()

    const clientConfig = {
        ...commerceAPI,
        proxy: `${appOrigin}${commerceAPI.proxyPath}`
    }

    return new ShopperSeo({
        ...clientConfig,
        headers: {authorization: `Bearer ${access_token}`},
        throwOnBadResponse: true
    })
}
