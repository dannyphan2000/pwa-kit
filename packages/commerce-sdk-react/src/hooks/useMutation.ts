/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    useMutation as useReactQueryMutation,
    useQueryClient,
    UseMutationOptions,
    MutationFunction
} from '@tanstack/react-query'
import {helpers} from 'commerce-sdk-isomorphic'
import useAuthContext from './useAuthContext'
import useConfig from './useConfig'
import {
    ApiClient,
    ApiMethod,
    ApiOptions,
    CacheUpdateGetter,
    MergedOptions,
    OptionalCustomEndpointClientConfig
} from './types'
import {useAuthorizationHeader} from './useAuthorizationHeader'
import useCustomerId from './useCustomerId'
import {mergeOptions, updateCache} from './utils'
import {CommerceApiProviderProps} from '../provider'

/**
 * Helper for mutation hooks, contains most of the logic in order to keep individual hooks small.
 * @param hookConfig - Config values that vary per API endpoint
 * @internal
 */
export const useMutation = <
    Client extends ApiClient,
    Options extends ApiOptions,
    Data
>(hookConfig: {
    client: Client
    method: ApiMethod<Options, Data>
    getCacheUpdates: CacheUpdateGetter<MergedOptions<Client, Options>, Data>
}) => {
    const queryClient = useQueryClient()
    const customerId = useCustomerId()
    const authenticatedMethod = useAuthorizationHeader(hookConfig.method)

    return useReactQueryMutation(authenticatedMethod, {
        onSuccess(data, options) {
            // commerce-sdk-isomorphic merges `clientConfig` and `options` under the hood,
            // so we also need to do that to get the "net" options that are actually sent to SCAPI.
            const netOptions = mergeOptions(hookConfig.client, options)
            const cacheUpdates = hookConfig.getCacheUpdates(customerId, netOptions, data)
            updateCache(queryClient, cacheUpdates, data)
        }
    })
}

type TMutationVariables = {
    body?: unknown
    parameters?: {[key: string]: string | number | boolean | string[] | number[]}
    headers?: {[key: string]: string}
} | void

/**
 * A hook for SCAPI custom endpoint mutations.
 *
 * Besides calling custom endpoint, this hook does a few things for better DX.
 * 1. inject access token
 * 2. merge SCAPI client configurations from the CommerceApiProvider
 * @param apiOptions - Options passed through to commerce-sdk-isomorphic
 * @param mutationOptions - Options passed through to @tanstack/react-query
 * @returns A TanStack Query mutation hook with data from the custom API endpoint.
 */
export const useCustomMutation = <TData = unknown, TError = unknown>(
    apiOptions: OptionalCustomEndpointClientConfig,
    mutationOptions?: UseMutationOptions<TData, TError, TMutationVariables>
) => {
    const auth = useAuthContext()
    const globalConfig = useConfig()
    const logger = globalConfig.logger || console

    const createMutationFnWithAuth = (): MutationFunction<TData, TMutationVariables> => {
        return async (args): Promise<TData> => {
            const {access_token} = await auth.ready()
            return (await helpers
                .callCustomEndpoint(
                    generateCustomEndpointOptions(args, apiOptions, globalConfig, access_token)
                )
                .catch(async (error) => {
                    if (error?.response?.status == 401) {
                        const response = await error?.response?.json()
                        if (
                            response?.detail ===
                            'Customer credentials changed after token was issued.'
                        ) {
                            logger.info('Login was invalidated. Clearing login state.')
                            await auth.logout()

                            // Retry again after resetting auth state
                            const {access_token} = await auth.ready()
                            return await helpers.callCustomEndpoint(
                                generateCustomEndpointOptions(
                                    args,
                                    apiOptions,
                                    globalConfig,
                                    access_token
                                )
                            )
                        } else {
                            throw error
                        }
                    } else {
                        throw error
                    }
                })) as TData
        }
    }

    return useReactQueryMutation<TData, TError, TMutationVariables, unknown>(
        createMutationFnWithAuth(),
        mutationOptions
    )
}

const generateCustomEndpointOptions = (
    args: TMutationVariables,
    apiOptions: OptionalCustomEndpointClientConfig,
    config: Omit<CommerceApiProviderProps, 'children'>,
    access_token: string
) => {
    const globalHeaders = config.headers || {}
    const globalClientConfig = {
        parameters: {
            clientId: config.clientId,
            siteId: config.siteId,
            organizationId: config.organizationId,
            shortCode: config.shortCode
        },
        proxy: config.proxy,
        throwOnBadResponse: true
    }

    return {
        ...apiOptions,
        options: {
            ...apiOptions.options,
            headers: {
                Authorization: `Bearer ${access_token}`,
                // Note the order of the following destructred objects is important.
                // Priority assending order: global config < mutation config < mutate func args
                ...globalHeaders,
                ...apiOptions.options?.headers,
                ...(args?.headers ? args.headers : {})
            },
            ...(args?.body ? {body: args.body} : {}),
            ...(args?.parameters ? {parameters: args.parameters} : {})
        },
        clientConfig: {
            ...globalClientConfig,
            ...(apiOptions.clientConfig || {})
        }
    }
}
