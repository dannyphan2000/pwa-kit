/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {ShopperSearch, ShopperProducts} from 'commerce-sdk-isomorphic'
import {ApiClients, ApiMethod, Argument} from '../types'
import {pickValidParams} from '../utils'

/**
 * Helper type to extract API method parameters from any API client method
 */
type ClientMethodParams<
    C extends keyof ApiClients,
    M extends keyof ApiClients[C] & string
> = ApiClients[C][M] extends ApiMethod<any, any>
    ? NonNullable<Argument<ApiClients[C][M]>['parameters']>
    : never;

/**
 * Factory function to create query key helpers for specific API endpoints
 */
function createQueryKeyHelper<P>(
    getPath: (params: P) => string[],
    paramKeys: ReadonlyArray<string>
) {
    const basePath = ['/commerce-sdk-react', '/organizations/']
    const helper = {
        path: (params: P) => [
            ...basePath,

            // organizationId is always required for all API endpoints
            (params as any).organizationId,
            ...getPath(params)
        ],

        queryKey: (params: P) => {
            return [
                ...helper.path(params),
                pickValidParams(params as Record<string, any>, Array.from(paramKeys))
            ];
        }
    };
    
    return helper;
}

const queryKeyHelpers = {
    shopperSearch: {
        productSearch: createQueryKeyHelper<ClientMethodParams<'shopperSearch', 'productSearch'>>(
            (params) => ['/product-search'],
            ShopperSearch.paramKeys.productSearch
        ),
        getSearchSuggestions: createQueryKeyHelper<ClientMethodParams<'shopperSearch', 'getSearchSuggestions'>>(
            (params) => ['/search-suggestions'],
            ShopperSearch.paramKeys.getSearchSuggestions
        )
    },
    shopperProducts: {
        getProducts: createQueryKeyHelper<ClientMethodParams<'shopperProducts', 'getProducts'>>(
            (params) => ['/products'],
            ShopperProducts.paramKeys.getProducts
        )
    }
    // Add other API clients as needed
};

export default queryKeyHelpers
