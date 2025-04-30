/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {UseMutationResult, DefaultError} from '@tanstack/react-query'
import {ApiClients, ApiMethod, Argument, DataType, CacheUpdateGetter} from './types'
import useCommerceApi from './useCommerceApi'
import {useMutation} from './useMutation'

/**
 * Type to identify client methods that are functions
 */
export type MethodsOf<C> = {
    [K in keyof C]: C[K] extends ApiMethod<any, any> ? K : never
}[keyof C]

/**
 * Helper to ensure a method is an ApiMethod
 */
type EnsureApiMethod<T> = T extends ApiMethod<any, any> ? T : never

/**
 * Options for creating a typed mutation hook for a specific API client
 */
export interface CreateUseMutationOptions<
    ClientKey extends keyof ApiClients,
    Mutation extends MethodsOf<ApiClients[ClientKey]>
> {
    /** The client key in ApiClients (e.g. 'shopperSearch', 'shopperProducts') */
    clientKey: ClientKey
    /** Function to get the cache updates matrix for the mutation */
    getCacheUpdates: (mutation: Mutation) => CacheUpdateGetter<any, any> | undefined
}

export type MutationHook<M extends ApiMethod<any, any>, TError = DefaultError> = UseMutationResult<
    DataType<M>,
    TError,
    Argument<M>
>

/**
 * Creates a mutation hook for a specific API client.
 */
export function createUseMutation<
    ClientKey extends keyof ApiClients,
    Mutation extends MethodsOf<ApiClients[ClientKey]>
>({clientKey, getCacheUpdates}: CreateUseMutationOptions<ClientKey, Mutation>) {
    type MutateArgument = Argument<EnsureApiMethod<ApiClients[ClientKey][Mutation]>>
    type MutationData = DataType<EnsureApiMethod<ApiClients[ClientKey][Mutation]>>
    return function useMutationHook<M extends Mutation>(
        mutation: M
    ): UseMutationResult<MutationData, DefaultError, MutateArgument> {
        const commerceApi = useCommerceApi()
        const client = commerceApi[clientKey]
        const method = client[mutation].bind(client) as EnsureApiMethod<ApiClients[ClientKey][M]>

        return useMutation<ApiClients[ClientKey], MutateArgument, MutationData>({
            client,
            method,
            getCacheUpdates: (customerId, options, data) => {
                const updates = getCacheUpdates(mutation)
                if (!updates) return {update: [], invalidate: [], remove: [], clear: false}
                return updates(customerId, options, data)
            }
        })
    }
}
