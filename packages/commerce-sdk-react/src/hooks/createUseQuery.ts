/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* eslint-disable @typescript-eslint/ban-ts-comment */
import {UseQueryResult} from '@tanstack/react-query'
import {
    ApiClients, 
    ApiMethod,
    ApiOptions,
    ApiQueryOptions, 
    Argument, 
    DataType, 
    NullableParameters
} from './types'
import useCommerceApi from './useCommerceApi'
import {useQuery} from './useQuery'
import {mergeOptions, omitNullableParameters, pickValidParams} from './utils'

/**
 * Type to identify client methods that are functions
 */
export type MethodsOf<C> = {
    [K in keyof C]: C[K] extends ApiMethod<any, any> ? K : never
}[keyof C]

/**
 * Options for creating a typed query hook for a specific API client
 */
export interface CreateUseQueryOptions<
    ClientKey extends keyof ApiClients,
    M extends MethodsOf<ApiClients[ClientKey]>
> {
    /** The client key in ApiClients (e.g., 'shopperSearch', 'shopperProducts') */
    clientKey: ClientKey;
    /** The name of the method in the API client */
    methodName: M;
    /** The name to use for the hook in debugging tools */
    displayName: string;
}

/**
 * Type definition for a query hook function
 */
export type QueryHook<M extends ApiMethod<any, any>> = (
    apiOptions: NullableParameters<Argument<M>>,
    queryOptions?: ApiQueryOptions<M>
) => UseQueryResult<DataType<M>, Error>;

/**
 * Helper to ensure a method is an ApiMethod
 */
type EnsureApiMethod<T> = T extends ApiMethod<any, any> ? T : never;

/**
 * Creates a typed query hook for a specific API client method.
 * 
 * @template ClientKey - The key of the client in ApiClients
 * @template M - The method name from the specified client
 * @param options - Configuration options for creating the query hook
 * @param queryKeyHelper - The query key helper for the specified method
 * @returns A custom hook that provides access to the specified API method
 */
export const createUseQuery = <
    ClientKey extends keyof ApiClients,
    M extends MethodsOf<ApiClients[ClientKey]>
>(
    options: CreateUseQueryOptions<ClientKey, M>,
    queryKeyHelper: {
        queryKey: (params: any) => any;
    }
): QueryHook<EnsureApiMethod<ApiClients[ClientKey][M]>> => {
    const { clientKey, methodName, displayName } = options;
    type Client = ApiClients[ClientKey];
    // Ensure method type is a function
    type Method = ApiClients[ClientKey][M] & ApiMethod<any, any>;
    
    /**
     * Custom hook for accessing an API method
     */
    const hook = (
        apiOptions: NullableParameters<Argument<Method>>,
        queryOptions: ApiQueryOptions<Method> = {}
    ): UseQueryResult<DataType<Method>, Error> => {
        type Options = Argument<Method>
        type Data = DataType<Method>
        
        // Get the client from useCommerceApi based on clientKey
        const commerceApi = useCommerceApi();
        // @ts-ignore - We know this exists based on the type constraint
        const client: Client = commerceApi[clientKey];
        
        // Get the SDK class for parameter keys
        // @ts-ignore - Access to constructor which is guaranteed to exist
        const SDKClass = client.constructor;
        
        // Get required parameters for this method
        const requiredKey = `${String(methodName)}Required`;
        // @ts-ignore - Access to paramKeys which is defined at runtime
        const requiredParamArray = (SDKClass.paramKeys as any)[requiredKey] as string[];
        
        // Convert the string array to a readonly array of parameter keys
        type ParamKeys = keyof NonNullable<Options['parameters']>
        const requiredParameters = requiredParamArray as unknown as readonly ParamKeys[];
        
        const netOptions = omitNullableParameters(mergeOptions(client, apiOptions));
        
        // Get valid parameter keys for this method
        // @ts-ignore - Access to paramKeys which is defined at runtime
        const methodParamKeys = (SDKClass.paramKeys as any)[String(methodName)] as string[];
        
        // These parameters are valid at runtime
        const parameters = pickValidParams(netOptions.parameters || {}, methodParamKeys as any);
        
        // Get query key for this method
        const queryKey = queryKeyHelper.queryKey(netOptions.parameters);
        
        // We don't use `netOptions` here because we manipulate the options in `useQuery`.
        const method = async (options: Options) => {
            // client[methodName] is guaranteed to be a function at runtime
            return await (client[methodName] as Method)(options);
        }

        queryOptions.meta = {
            displayName,
            ...queryOptions.meta
        }

        return useQuery<
            typeof client,
            Options,
            Data,
            Error,
            Data   // We're not transforming the data, so TData = TQueryFnData
        >(
            {...netOptions, parameters} as any,
            queryOptions as any,
            {
                method,
                queryKey,
                requiredParameters
            }
        )
    };

    return hook;
}
