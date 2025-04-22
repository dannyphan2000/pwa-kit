'use client'

/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {useSuspenseQuery} from '@tanstack/react-query'

const fetchUserData = async (id: number): Promise<any> => {
    console.log('id', id)
    const response = await fetch('https://jsonplaceholder.typicode.com/users/' + id)

    if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`)
    }

    return response.json()
}
function User() {
    const {data: user} = useSuspenseQuery<any>({
        queryKey: ['user-profile'],
        queryFn: () => fetchUserData(1)
    })

    return (
        <div>
            <div>
                <a href="/">Home</a>
            </div>
            {user && (
                <pre>
                    <div className="user-info">{JSON.stringify(user, null, 2)}</div>
                </pre>
            )}
        </div>
    )
}

export default User
