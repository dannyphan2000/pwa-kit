/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {UseMutationResult} from '@tanstack/react-query'
import {
    ApiClients,
    ApiMethod,
    Argument,
    CacheUpdateGetter,
    DataType,
    MergedOptions
} from './types'
import useCommerceApi from './useCommerceApi'
import {useMutation} from './useMutation'

/**
 * Type to identify client methods that are functions
 */
export type MethodsOf<C> = {
    [K in keyof C]: C[K] extends ApiMethod<any, any> ? K : never
}[keyof C]

/**
 * Options for creating a typed mutation hook for a specific API client
 */
export interface CreateUseMutationOptions<
    ClientKey extends keyof ApiClients,
    MutationEnum extends string
> {
    /** The client key in ApiClients (e.g., 'shopperSearch', 'shopperProducts') */
    clientKey: ClientKey
    /** Function to get the cache updates matrix for the mutation */
    getCacheUpdates: (mutation: MutationEnum) => CacheUpdateGetter<any, any> | undefined
}

/**
 * Creates a typed mutation hook factory for specific API client methods.
 *
 * This function creates a hook that takes a mutation name as input and returns
 * a TanStack Query mutation hook for that specific operation. It's designed to work
 * with an enum of available mutations for type safety.
 *
 * @template ClientKey - The key of the client in ApiClients
 * @template MutationEnum - The enum type containing the available mutation names
 * @param options - Configuration options for creating the mutation hook
 * @returns A function that accepts a mutation name and returns a custom hook for that mutation
 */
export const createUseMutation = <
    ClientKey extends keyof ApiClients,
    MutationEnum extends string
>(
    options: CreateUseMutationOptions<ClientKey, MutationEnum>
) => {
    const {clientKey, getCacheUpdates} = options
    
    /**
     * Custom hook for accessing an API mutation method
     * @param mutation - The name of the mutation to use
     * @returns A TanStack Query mutation hook for the specified mutation
     */
    function useMutationHook<M extends string>(mutation: M & MutationEnum) {
        type Client = ApiClients[ClientKey]
        
        const cacheUpdateFn = getCacheUpdates(mutation)
        if (!cacheUpdateFn) {
            throw new Error(`The '${mutation}' mutation is not implemented`)
        }

        const commerceApi = useCommerceApi()
        const client = commerceApi[clientKey] as Client
        
        // We need to cast mutation to keyof Client to keep TypeScript happy
        const methodKey = mutation as unknown as keyof Client
        const method = client[methodKey] as ApiMethod<any, any>
        
        type Options = Argument<typeof method>
        type Data = DataType<typeof method>

        return useMutation({
            client,
            method: (opts: Options) => method(opts),
            getCacheUpdates: cacheUpdateFn as CacheUpdateGetter<MergedOptions<Client, Options>, Data>
        })
    }

    return useMutationHook
}
