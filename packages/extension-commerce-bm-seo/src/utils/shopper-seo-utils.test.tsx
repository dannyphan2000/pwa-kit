/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {getShopperSeoClient} from './shopper-seo-utils'
import {ShopperSeo} from 'commerce-sdk-isomorphic'
import Auth from '@salesforce/commerce-sdk-react/auth'
import {Config} from '../types'

jest.mock('commerce-sdk-isomorphic', () => ({
    ShopperSeo: jest.fn()
}))
jest.mock('@salesforce/commerce-sdk-react/auth', () => {
    return jest.fn().mockImplementation(() => ({
        ready: jest.fn().mockResolvedValue({access_token: 'test-token'})
    }))
})

describe('getShopperSeoClient', () => {
    const mockConfig: Config = {
        commerceAPI: {
            parameters: {
                shortCode: 'test',
                clientId: 'test-client',
                organizationId: 'test-org',
                siteId: 'test-site'
            },
            proxyPath: '/api'
        },
        resourceTypeToComponentMap: {}
    }

    const locals: Record<string, any> = {}

    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('should create and return a ShopperSeo client with correct config', async () => {
        const result = await getShopperSeoClient(locals, mockConfig)

        expect(Auth).toHaveBeenCalledWith({
            shortCode: 'test',
            clientId: 'test-client',
            organizationId: 'test-org',
            siteId: 'test-site',
            proxy: 'http://localhost/api',
            redirectURI: 'http://localhost/callback',
            logger: console
        })

        expect(ShopperSeo).toHaveBeenCalledWith({
            ...mockConfig.commerceAPI,
            proxy: 'http://localhost/api',
            headers: {authorization: 'Bearer test-token'},
            throwOnBadResponse: true
        })

        expect(result).toBeInstanceOf(ShopperSeo)
    })

    it('should reuse an existing Auth client on locals', async () => {
        locals['__commerceAPIAuth'] = {
            ready: jest.fn().mockResolvedValue({access_token: 'existing-token'})
        }

        await getShopperSeoClient(locals, mockConfig)

        expect(Auth).not.toHaveBeenCalled()
        expect(locals['__commerceAPIAuth'].ready).toHaveBeenCalled()
    })
})
