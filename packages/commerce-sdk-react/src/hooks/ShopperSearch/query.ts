/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {UseQueryResult} from '@tanstack/react-query'
import {ShopperSearch} from 'commerce-sdk-isomorphic'
import {ApiClients, ApiQueryOptions, Argument, DataType, NullableParameters} from '../types'
import useCommerceApi from '../useCommerceApi'
import {useQuery} from '../useQuery'
import {mergeOptions, omitNullableParameters, pickValidParams} from '../utils'
import * as queryKeyHelpers from './queryKeyHelpers'

type Client = ApiClients['shopperSearch']
// Type to ensure we only get function methods from the client
type ClientMethodNames = {
    [K in keyof Client]: Client[K] extends (...args: any[]) => any ? K : never
}[keyof Client]

/**
 * Creates a typed query hook for a specific Shopper Search API method.
 * 
 * @template M - The method name from the ShopperSearch client
 * @param methodName - The name of the method in the ShopperSearch client
 * @param displayName - The name to use for the hook in debugging tools
 * @returns A custom hook that provides access to the specified Shopper Search API method
 */
export const createUseQuery = <M extends ClientMethodNames>(
    methodName: M,
    displayName: string
) => {
    type MethodType = Client[M]
    
    /**
     * Custom hook for accessing a Shopper Search API method
     * 
     * @param apiOptions - Options to pass through to `commerce-sdk-isomorphic`, with `null` accepted for unset API parameters.
     * @param queryOptions - TanStack Query query options, with `enabled` by default set to check that all required API parameters have been set.
     * @returns A TanStack Query query hook with data from the specified Shopper Search endpoint.
     */
    return (
        apiOptions: NullableParameters<Argument<MethodType>>,
        queryOptions: ApiQueryOptions<MethodType> = {}
    ): UseQueryResult<DataType<MethodType>, Error> => {
        type Options = Argument<MethodType>
        type Data = DataType<MethodType>
        const {shopperSearch: client} = useCommerceApi()
        
        // Use a type assertion for the required parameters to avoid indexing issues
        // @ts-ignore This is safe as we know the structure of ShopperSearch.paramKeys
        const requiredParameters = ShopperSearch.paramKeys[`${methodName}Required`]

        // Parameters can be set in `apiOptions` or `client.clientConfig`;
        // we must merge them in order to generate the correct query key.
        const netOptions = omitNullableParameters(mergeOptions(client, apiOptions))
        
        // Use a type assertion for the param keys to avoid indexing issues
        // @ts-ignore This is safe as we know the structure of ShopperSearch.paramKeys
        const methodParamKeys = ShopperSearch.paramKeys[methodName]
        
        // @ts-ignore Need to bypass type checking for parameters
        const parameters = pickValidParams(netOptions.parameters, methodParamKeys)
        
        // Use a type assertion for the query key helper to avoid indexing issues
        // @ts-ignore This is safe as we know the structure of queryKeyHelpers
        const queryKey = queryKeyHelpers[methodName].queryKey(netOptions.parameters)
        
        // We don't use `netOptions` here because we manipulate the options in `useQuery`.
        // Use a safer way to call the method that handles the type issues
        const method = async (options: Options) => {
            // @ts-ignore This is safe as we know the method exists on the client
            return await client[methodName](options)
        }

        queryOptions.meta = {
            displayName,
            ...queryOptions.meta
        }

        // For some reason, if we don't explicitly set these generic parameters, the inferred type for
        // `Data` sometimes, but not always, includes `Response`, which is incorrect. I don't know why.
        // @ts-ignore TODO: Fix react query result error generics
        return useQuery<Client, Options, Data>({...netOptions, parameters}, queryOptions, {
            method,
            queryKey,
            requiredParameters
        })
    }
}

/**
 * Provides keyword and refinement search functionality for products.
 *
 * Only returns the product ID, link, and name in the product search hit.
 * The search result contains only products that are online and assigned to site catalog.
 * @group ShopperSearch
 * @category Query
 * @parameter apiOptions - Options to pass through to `commerce-sdk-isomorphic`, with `null` accepted for unset API parameters.
 * @parameter queryOptions - TanStack Query query options, with `enabled` by default set to check that all required API parameters have been set.
 * @returns A TanStack Query query hook with data from the Shopper Search `productSearch` endpoint.
 * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=productSearch| Salesforce Developer Center} for more information about the API endpoint.
 * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shoppersearch.shoppersearch-1.html#productsearch | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useQuery | TanStack Query `useQuery` reference} for more information about the return value.
 */
export const useProductSearch = createUseQuery('productSearch', 'useProductSearch')

/**
 * Provides keyword search functionality for products, categories, and brands suggestions.
 *
 * Returns suggested products, suggested categories, and suggested brands for the given search phrase.
 * @group ShopperSearch
 * @category Query
 * @parameter apiOptions - Options to pass through to `commerce-sdk-isomorphic`, with `null` accepted for unset API parameters.
 * @parameter queryOptions - TanStack Query query options, with `enabled` by default set to check that all required API parameters have been set.
 * @returns A TanStack Query query hook with data from the Shopper Search `getSearchSuggestions` endpoint.
 * @see {@link https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=getSearchSuggestions| Salesforce Developer Center} for more information about the API endpoint.
 * @see {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/classes/shoppersearch.shoppersearch-1.html#getsearchsuggestions | `commerce-sdk-isomorphic` documentation} for more information on the parameters and returned data type.
 * @see {@link https://tanstack.com/query/latest/docs/react/reference/useQuery | TanStack Query `useQuery` reference} for more information about the return value.
 */
export const useSearchSuggestions = createUseQuery('getSearchSuggestions', 'useSearchSuggestions')
