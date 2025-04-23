/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import hoistNonReactStatic from 'hoist-non-react-statics'
import {dehydrate, HydrationBoundary, QueryClient, QueryClientProvider} from '@tanstack/react-query'
import {FetchStrategy} from '../fetch-strategy'
import {PERFORMANCE_MARKS} from '../../../../utils/performance'
import logger from '../../../../utils/logger-instance'
import ReactDOMServer from "react-dom/server";

const STATE_KEY = '__reactQuery'
const passthrough = (input) => input

// Use this internal React Query event to detect queries as they're created
const createQueryPrefetchListener = (queryClient) => {
    const queries = new Set()

    // Listen for query creation events
    const unsubscribe = queryClient.getQueryCache().subscribe((event) => {
        if (event.type === 'added' && event.query.options.enabled !== false) {
            queries.add(event.query)
        }
    })

    return {
        getQueries: () => Array.from(queries),
        cleanup: unsubscribe
    }
}

/**
 * A HoC for adding React Query support to your application.
 *
 * @param {React.ReactElement} Wrapped The component to be wrapped
 * @param {Object} options
 * @param {Object} options.queryClientConfig The react query client configuration object to be used.
 *
 * @returns {React.ReactElement}
 */
export const withReactQuery = (Wrapped, options = {}) => {
    const isServerSide = typeof window === 'undefined'
    /* istanbul ignore next */
    const wrappedComponentName = Wrapped.displayName || Wrapped.name
    const queryClientConfig = options.queryClientConfig
    const beforeHydrate = options.beforeHydrate || passthrough

    /**
     * @private
     */
    class WithReactQuery extends FetchStrategy {
        render() {
            let preloadedState = {}

            this.props.locals.__queryClient =
                this.props.locals.__queryClient || new QueryClient(queryClientConfig)

            if (!isServerSide) {
                try {
                    preloadedState = beforeHydrate(window.__PRELOADED_STATE__?.[STATE_KEY] || {})
                } catch (e) {
                    logger.error('Client `beforeHydrate` failed', {
                        namespace: 'with-react-query.render',
                        additionalProperties: {error: e}
                    })
                }
            }

            return (
                <QueryClientProvider client={this.props.locals.__queryClient}>
                    <HydrationBoundary state={preloadedState}>
                        <Wrapped {...this.props} />
                    </HydrationBoundary>
                </QueryClientProvider>
            )
        }

        /**
         * @private
         */
        static async doInitAppState({res, appJSX}) {
            // Create a separate query client just for discovery to avoid shared state
            const discoveryQueryClient = new QueryClient(queryClientConfig)

            // The actual query client that will be used for the real render
            const queryClient = new QueryClient(queryClientConfig)
            res.locals.__queryClient = queryClient

            res.__performanceTimer.mark(PERFORMANCE_MARKS.reactQueryPrerender, 'start')

            try {
                // Set up a listener to capture queries as they're created
                const listener = createQueryPrefetchListener(queryClient)

                // Create a completely separate component tree for discovery
                // We're using a new instance of all providers to ensure isolation
                // potential perfomance impact since we are deepcloning a trea here???
                const discoveryApp = (
                    <QueryClientProvider client={discoveryQueryClient}>
                        {/* We use a deep clone by recreating the entire tree structure */}
                        {React.cloneElement(appJSX, {key: 'discovery-phase'})}
                    </QueryClientProvider>
                )

                // Use renderToStaticMarkup to make the render faster and discard the result
                ReactDOMServer.renderToStaticMarkup(discoveryApp)

                // Get all the discovered queries
                const queries = listener.getQueries()

                // Extract the query keys and configs we need to prefetch
                const queryConfigs = queries.map(q => ({
                    queryKey: q.queryKey,
                    queryFn: q.options.queryFn,
                    meta: q.meta
                }))
                // console.log('queries', queries)
                listener.cleanup()


                // Now prefetch data all the discovered queries in parallel using the REAL query client
                await Promise.all(
                    queryConfigs.map((config, i) => {
                        const displayName = config.meta?.displayName
                            ? `${config.meta?.displayName}:${i}`
                            : `${i}`
                        res.__performanceTimer.mark(
                            `${PERFORMANCE_MARKS.reactQueryUseQuery}.${displayName}`,
                            'start'
                        )

                        // Execute the query on the real query client
                        return queryClient.fetchQuery({
                            queryKey: config.queryKey,
                            queryFn: config.queryFn,
                            meta: config.meta
                        })
                        .then((result) => {
                            res.__performanceTimer.mark(
                                `${PERFORMANCE_MARKS.reactQueryUseQuery}.${displayName}`,
                                'end',
                                {
                                    detail: JSON.stringify(config.queryKey)
                                }
                            )

                            return result
                        })
                        .catch(() => {
                            // If there's an error in this fetch, react-query will log the error
                            // On our end, simply catch any error and move on to the next query
                        })
                    })
                )

                // Clean up the discovery query client to free memory
                discoveryQueryClient.clear()
            } catch (error) {
                logger.error('Error during query prefetching', {
                    namespace: 'with-react-query.doInitAppState',
                    additionalProperties: {error}
                })
            }

            res.__performanceTimer.mark(PERFORMANCE_MARKS.reactQueryPrerender, 'end')
            return {[STATE_KEY]: dehydrate(queryClient)}
        }

        /**
         * @private
         */
        static getInitializers() {
            return [WithReactQuery.doInitAppState, ...(Wrapped.getInitializers?.() ?? [])]
        }

        /**
         * @private
         */
        static getHOCsInUse() {
            return [withReactQuery, ...(Wrapped.getHOCsInUse?.() ?? [])]
        }
    }

    WithReactQuery.displayName = `withReactQuery(${wrappedComponentName})`

    const exclude = {
        doInitAppState: true,
        getInitializers: true,
        initAppState: true,
        getHOCsInUse: true
    }
    hoistNonReactStatic(WithReactQuery, Wrapped, exclude)

    return WithReactQuery
}
