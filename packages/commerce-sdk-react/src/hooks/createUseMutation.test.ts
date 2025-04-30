/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {renderHook} from '@testing-library/react'
import useCommerceApi from './useCommerceApi'
import * as useMutationModule from './useMutation'
import {createUseMutation} from './createUseMutation'
import {MethodsOf} from './createUseMutation'
import {ApiClients} from './types'

// Mock dependencies
jest.mock('./useCommerceApi')
jest.mock('./useMutation')

describe('createUseMutation', () => {
    // Define the ShopperBasketsMutation type
    type ShopperBasketsMutation = MethodsOf<ApiClients['shopperBaskets']>

    // Mock API client and method
    const mockApiMethod = jest.fn().mockResolvedValue({data: 'test-data'})
    const mockClient = {
        createBasket: mockApiMethod,
        constructor: {
            paramKeys: {
                createBasket: ['param1', 'param2']
            }
        },
        clientConfig: {
            parameters: {},
            headers: {}
        }
    }

    // Mock useCommerceApi hook
    const mockUseCommerceApi = useCommerceApi as jest.Mock
    mockUseCommerceApi.mockReturnValue({
        shopperBaskets: mockClient
    })

    // Mock useMutation hook
    const mockUseMutation = jest.fn()
    jest.spyOn(useMutationModule, 'useMutation').mockImplementation(mockUseMutation)

    // Mock cache update getter
    const mockCacheUpdateGetter = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
        mockUseMutation.mockReturnValue({
            data: {data: 'test-data'},
            isLoading: false,
            error: null,
            mutate: jest.fn(),
            mutateAsync: jest.fn()
        })
    })

    it('calls useMutation with the correct arguments', () => {
        // Create the mutation hook
        const useTestMutation = createUseMutation<'shopperBaskets', ShopperBasketsMutation>({
            clientKey: 'shopperBaskets',
            getCacheUpdates: mockCacheUpdateGetter
        })

        // Use the hook
        renderHook(() => useTestMutation('createBasket'))

        // Verify useMutation was called with correct parameters
        expect(mockUseMutation).toHaveBeenCalledTimes(1)

        const useMutationCallArgs = mockUseMutation.mock.calls[0][0]

        // Verify client is correctly passed
        expect(useMutationCallArgs.client).toBe(mockClient)

        // Verify method is correctly bound to the client
        expect(useMutationCallArgs.method).toBeDefined()
        expect(typeof useMutationCallArgs.method).toBe('function')

        // Verify getCacheUpdates function is passed
        expect(useMutationCallArgs.getCacheUpdates).toBeDefined()
        expect(typeof useMutationCallArgs.getCacheUpdates).toBe('function')
    })
})
