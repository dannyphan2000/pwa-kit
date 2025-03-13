/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {resetDehydratedStateTimeStamp} from './utils'
import {DehydratedState} from '@tanstack/react-query'
describe('resetDehydratedStateTimeStamp', () => {
    const mockDehydratedState : DehydratedState = {
        mutations: [],
        queries: [
            {
                state: {
                    dataUpdatedAt: 2000,
                    data: 'query data',
                    dataUpdateCount: 1,
                    error: null,
                    errorUpdateCount: 0,
                    errorUpdatedAt: 0,
                    fetchStatus: 'idle',
                    fetchFailureCount: 0,
                    fetchMeta: null,
                    isInvalidated: false,
                    fetchFailureReason: null,
                    status: 'success'
                },
                queryKey: ['queries', 'key1'],
                queryHash: 'queries-key1'
            },
            {
                state: {
                    dataUpdatedAt: 3000,
                    data: 'query data 2',
                    dataUpdateCount: 1,
                    error: null,
                    errorUpdateCount: 0,
                    errorUpdatedAt: 0,
                    fetchStatus: 'idle',
                    fetchFailureCount: 0,
                    fetchMeta: null,
                    isInvalidated: false,
                    fetchFailureReason: null,
                    status: 'success'
                },
                queryKey: ['queries', 'key2'],
                queryHash: 'queries-key2'
            }
        ]
    }

    it('should update all dataUpdatedAt timestamps with the provided timestamp', () => {
        const specificTime = new Date(2023, 5, 15)
        const result = resetDehydratedStateTimeStamp(mockDehydratedState, specificTime)

        expect(result.queries[0].state.dataUpdatedAt).toBe(specificTime.getTime())
        expect(result.queries[1].state.dataUpdatedAt).toBe(specificTime.getTime())
    })

    it('should use current time when no timestamp is provided', () => {
        const before = Date.now()

        const result = resetDehydratedStateTimeStamp(mockDehydratedState)
        const after = Date.now()

        expect(result.queries[0].state.dataUpdatedAt).toBeGreaterThanOrEqual(before)
        expect(result.queries[0].state.dataUpdatedAt).toBeLessThanOrEqual(after)
        
        expect(result.queries[1].state.dataUpdatedAt).toBeGreaterThanOrEqual(before)
        expect(result.queries[1].state.dataUpdatedAt).toBeLessThanOrEqual(after)
    })

    it('should preserve all other properties of the state objects', () => {
        const specificTime = new Date(2023, 5, 15)

        const result = resetDehydratedStateTimeStamp(mockDehydratedState, specificTime)

        expect(result.queries[0].state.data).toBe('query data')
        expect(result.queries[0].queryKey).toEqual(['queries', 'key1'])
        
        expect(result.queries[1].state.data).toBe('query data 2')
        expect(result.queries[1].queryKey).toEqual(['queries', 'key2'])
    })

    it('should handle empty mutations and queries arrays', () => {
        const emptyState = {
            mutations: [],
            queries: []
        }

        const result = resetDehydratedStateTimeStamp(emptyState, new Date(2023, 5, 15))
        
        expect(result.mutations).toEqual([])
        expect(result.queries).toEqual([])
    })
})
