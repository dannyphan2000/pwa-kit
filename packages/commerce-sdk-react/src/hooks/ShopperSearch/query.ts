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
 * Options for creating a typed query hook
 */
interface CreateUseQueryOptions<M extends ClientMethodNames> {
    /** The name of the method in the ShopperSearch client */
    methodName: M;
    /** The name to use for the hook in debugging tools */
    displayName: string;
}

/**
 * Creates a typed query hook for a specific Shopper Search API method.
 * 
 * @template M - The method name from the ShopperSearch client
 * @param options - Configuration options for creating the query hook
 * @returns A custom hook that provides access to the specified Shopper Search API method
 */
export const createUseQuery = <M extends ClientMethodNames>(
    options: CreateUseQueryOptions<M>
) => {
    const { methodName, displayName } = options;
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
        
        // ShopperSearch.paramKeys is guaranteed to have this structure at runtime
        const requiredKey = `${methodName}Required` as string
        const requiredParamArray = (ShopperSearch.paramKeys as any)[requiredKey] as string[]
        
        // Convert the string array to a readonly array of parameter keys
        type ParamKeys = keyof NonNullable<Options['parameters']>
        const requiredParameters = requiredParamArray as unknown as readonly ParamKeys[]
        
        const netOptions = omitNullableParameters(mergeOptions(client, apiOptions))
        
        // ShopperSearch.paramKeys is guaranteed to have this structure at runtime
        const methodParamKeys = (ShopperSearch.paramKeys as any)[methodName] as string[]
        
        // These parameters are valid at runtime
        const parameters = pickValidParams(netOptions.parameters, methodParamKeys as any)
        
        // queryKeyHelpers is guaranteed to have this structure at runtime
        const queryKeyHelper = (queryKeyHelpers as any)[methodName]
        const queryKey = queryKeyHelper.queryKey(netOptions.parameters)
        
        // We don't use `netOptions` here because we manipulate the options in `useQuery`.
        const method = async (options: Options) => {
            // client[methodName] is guaranteed to be a function at runtime
            return await (client as any)[methodName](options)
        }

        queryOptions.meta = {
            displayName,
            ...queryOptions.meta
        }

        // We need to use a type assertion here to work around TypeScript limitations
        // while ensuring the correct runtime behavior
        return useQuery({...netOptions, parameters} as any, queryOptions as any, {
            method,
            queryKey,
            requiredParameters
        }) as UseQueryResult<Data, Error>
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
export const useProductSearch = createUseQuery({
    methodName: 'productSearch',
    displayName: 'useProductSearch'
})

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
export const useSearchSuggestions = createUseQuery({
    methodName: 'getSearchSuggestions',
    displayName: 'useSearchSuggestions'
})
