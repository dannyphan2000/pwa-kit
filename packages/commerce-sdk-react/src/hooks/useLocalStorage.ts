/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect} from 'react'

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
const subscribeToLocalStorage = (key: string) => (callback: () => void) => {
    const handleStorageChange = (e: StorageEvent) => {
        if (e.key === key) {
            callback()
        }
    }
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
}

/**
 * @internal
 */
const getLocalStorageServerSnapshot = () => {
    // local storage is not available on the server
    return null
}

/**
 * @internal
 */
function useLocalStorage(key: string): Value {
    const getLocalStorageSnapshot = () => readValue(key)

    // Check if useSyncExternalStore is available (React 18+)
    const useSyncExternalStore = (React as any).useSyncExternalStore

    // Create a fallback that returns null when useSyncExternalStore doesn't exist
    const useSyncExternalStoreSafe = useSyncExternalStore || (() => null)

    // Always call useState and useEffect to comply with Rules of Hooks
    const [value, setValue] = useState<Value>(() => readValue(key))

    useEffect(() => {
        if (!useSyncExternalStore) {
            setValue(readValue(key))
        }
    }, [key, useSyncExternalStore])

    useEffect(() => {
        if (!useSyncExternalStore) {
            const handleStorageChange = (e: StorageEvent) => {
                if (e.key === key) {
                    setValue(readValue(key))
                }
            }
            window.addEventListener('storage', handleStorageChange)

            return () => {
                window.removeEventListener('storage', handleStorageChange)
            }
        }
    }, [key, useSyncExternalStore])

    // Always call useSyncExternalStore (or its fallback) to comply with Rules of Hooks
    const syncExternalStoreValue = useSyncExternalStoreSafe(
        subscribeToLocalStorage(key),
        getLocalStorageSnapshot,
        getLocalStorageServerSnapshot
    )

    // Return the appropriate value based on availability
    return useSyncExternalStore ? syncExternalStoreValue : value
}

export default useLocalStorage
