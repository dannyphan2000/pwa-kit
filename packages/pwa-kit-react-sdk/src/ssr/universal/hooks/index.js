/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/* istanbul ignore file */

import React, {useContext, useEffect, useRef, useState} from 'react'
import {useHistory} from 'react-router-dom'
import {CorrelationIdContext, ServerContext, RoutesContext} from '../contexts'

/**
 * Use this hook to get the correlation id value of the closest CorrelationIdProvider component.
 *
 * @returns {object} The correlation id
 */
export const useCorrelationId = () => {
    const context = React.useContext(CorrelationIdContext)
    if (context === undefined) {
        throw new Error('useCorrelationId needs to be used within CorrelationIdProvider')
    }
    return context
}

/**
 * Server context
 * @typedef {Object} ServerContext
 * @property {Object} req - Request object
 * @property {Object} res - Response object
 */

/**
 * Get the server context
 * @returns {ServerContext} ServerContext object
 *
 * @example
 * const {res} = useServerContext()
 * if (res && query.error) { res.status(404) }
 */
export const useServerContext = () => {
    const serverContext = useContext(ServerContext)

    return serverContext
}

/**
 * Returns the application's origin.
 *
 * By default, it will return the ORIGIN under which we are serving the page.
 *
 * If `fromXForwardedHeader` is true, it will use the value of `x-forwarded-proto` and `x-forwarded-host` headers in req
 * to build origin. (it is false by default)
 *
 * NOTE: this is a React hook, so it has to be used in a React rendering pipeline.
 * @returns {string} origin string
 *
 */
export const useOrigin = ({fromXForwardedHeader = false}) => {
    const {res} = useServerContext()

    if (typeof window !== 'undefined') {
        return window.location.origin
    }

    const {APP_ORIGIN} = process.env

    const xForwardedOrigin = res.locals.xForwardedOrigin
    if (fromXForwardedHeader && xForwardedOrigin) {
        return xForwardedOrigin
    }
    return APP_ORIGIN
}

/**
 * Blocks the navigation to run a provided function whenever there is a new page being navigated to
 * The function must return false to unblock the navigation
 *
 * @param {function} func
 * @returns {boolean} State that is set to true during blocking, false otherwise.
 */
export const useBlockNavigation = (func) => {
    const {block, push, location} = useHistory()
    const lastLocation = useRef()
    const [isBlocked, setIsBlocked] = useState(false)
    const funcRef = useRef(func)
    const abortControllerRef = useRef(new AbortController())

    useEffect(() => {
        console.log("(JEREMY) in location use effect")
        const unblock = block((location, action) => {
            console.log("(JEREMY) in block callback function")
            if (location?.pathname !== lastLocation.current?.pathname && funcRef.current) {
                lastLocation.current = location
                abortControllerRef.current.abort()
                abortControllerRef.current = new AbortController()
                ;(async () => {
                    setIsBlocked(true)
                    const destinationUrl = await funcRef.current(
                        location,
                        action,
                        abortControllerRef.current.signal
                    )
                    console.log("(JEREMY) destinationUrl from callback passed: ", destinationUrl)
                    if (
                        destinationUrl !== undefined
                    ) {
                        setIsBlocked(false)
                        unblock()
                        push(destinationUrl)
                    }
                    else {
                        console.log("(JEREMY) destinationUrl is undefined. location: ", location)
                        unblock()
                        push(location.pathname + location.search)
                    }
                })()
                return false
            }
        })
        return () => unblock()
        
    }, [location])

    return {isBlocked, push}
}
/*
 * Use this hook to get the routes value of the closest RoutesProvider component.
 *
 * @returns {object} array of routes
 */
export const useRoutes = () => {
    const context = useContext(RoutesContext)
    if (!context) {
        throw new Error('useRoutes must be used within a RoutesProvider')
    }
    return context
}
