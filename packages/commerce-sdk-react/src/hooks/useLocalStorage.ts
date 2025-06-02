/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useState, useEffect} from 'react'

type Value = string | null

/**
 * @internal
 */
const readValue = (key: string): Value => {
    // TODO: Use detectLocalStorageAvailable when app can better handle clients without storage
    if (typeof window === 'undefined') {
        return null
    }
    return window.localStorage.getItem(key)
}

/**
 * @internal
 */
function useLocalStorage(key: string): Value {
    // Use lazy initialization to avoid calling readValue on every render and prevent unnecessary localStorage access
    const [value, setValue] = useState<Value>(() => readValue(key))

    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key) {
                setValue(readValue(key))
            }
        }
        window.addEventListener('storage', handleStorageChange)

        return () => {
            window.removeEventListener('storage', handleStorageChange)
        }
    }, [key])

    return value
}

export default useLocalStorage
