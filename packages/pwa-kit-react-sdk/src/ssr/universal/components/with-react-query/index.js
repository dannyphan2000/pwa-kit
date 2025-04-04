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
            const queryClient = (res.locals.__queryClient =
                res.locals.__queryClient || new QueryClient(queryClientConfig))

            res.__performanceTimer.mark(PERFORMANCE_MARKS.reactQueryPrerender, 'start')

            // React 19 compatibility: Instead of using ssrPrepass, we use a two-phase approach:
            // 1. First render - this will register all queries but not wait for them
            try {
                // Set up a listener to capture queries as they're created
                const listener = createQueryPrefetchListener(queryClient)

                // Perform a temporary render to trigger all useQuery hooks
                const tempApp = React.createElement(
                    QueryClientProvider,
                    { client: queryClient },
                    appJSX
                )
                ReactDOMServer.renderToStaticMarkup(tempApp)

                // Get all the queries that were registered
                const queries = listener.getQueries()

                listener.cleanup()

                // Now prefetch all the discovered queries in parallel
                const t = await Promise.all(
                    queries.map((q, i) => {
                        const displayName = q.meta?.displayName
                            ? `${q.meta?.displayName}:${i}`
                            : `${i}`
                        res.__performanceTimer.mark(
                            `${PERFORMANCE_MARKS.reactQueryUseQuery}::${displayName}`,
                            'start'
                        )
                        return q
                            .fetch()
                            .then((result) => {
                                res.__performanceTimer.mark(
                                    `${PERFORMANCE_MARKS.reactQueryUseQuery}::${displayName}`,
                                    'end',
                                    {
                                        detail: q.queryHash
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
