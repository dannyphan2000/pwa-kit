/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState, useEffect, useCallback} from 'react'

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
const getLocalStorageSnapshot = (key: string) => () => readValue(key)

/**
 * @internal
 */
const getLocalStorageServerSnapshot = () => {
    // local storage is not available on the server
    return null
}

/* eslint-disable react-hooks/rules-of-hooks */
// NOTE: it's ok to disable the rules-of-hooks because the existence of useSyncExternalStore will be consistent
/**
 * @internal
 */
function useLocalStorage(key: string): Value {
    // Check if useSyncExternalStore is available (React 18+)
    const useSyncExternalStore = (React as any).useSyncExternalStore

    if (useSyncExternalStore) {
        const _getLocalStorageSnapshot = useCallback(getLocalStorageSnapshot(key), [key])
        const _subscribeToLocalStorage = useCallback(subscribeToLocalStorage(key), [key])

        const store: Value = useSyncExternalStore(
            _subscribeToLocalStorage,
            _getLocalStorageSnapshot,
            getLocalStorageServerSnapshot
        )
        return store
    }

    // Fallback implementation for React 17
    // Use lazy initialization to avoid calling readValue on every render and prevent unnecessary localStorage access
    const [value, setValue] = useState<Value>(() => readValue(key))

    useEffect(() => {
        setValue(readValue(key))
    }, [key])

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
/* eslint-enable react-hooks/rules-of-hooks */

export default useLocalStorage
