/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {DehydratedState} from '@tanstack/react-query'

/**
 * Resets the dataUpdatedAt timestamp for all mutations and queries in the given data object.
 * This is typically used in conjuction with pwa-kit-react-sdk's`beforeHydrate` to ensure that
 * the cached data is considered fresh on first load.
 * @param data - The data object containing mutations and queries.
 * @param timestamp - The timestamp to set the dataUpdatedAt to. If not provided, the current time will be used.
 * @returns The updated data object with reset timestamps.
 * @since 4.0.0
 */
export const resetDehydratedStateTimeStamp = (data: DehydratedState, timestamp?: Date) => {
    const time = timestamp || Date.now()

    const updateQueryTimeStamp = (item: any) => ({
        ...item,
        state: {
            ...item.state,
            dataUpdatedAt: time
        }
    })

    return {
        mutations: data.mutations.map(updateQueryTimeStamp),
        queries: data.queries.map(updateQueryTimeStamp)
    }
}
