/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'

import loadable from '@loadable/component'

import {Redirect} from 'react-router-dom'
 
const GettingStarted = loadable(() => import('./pages/getting-started'))

const routes = [
    {
        // The path that the local dev server would open initially.
        // You can configure the server in /app/ssr.js file.
        path: '/__pwa-kit/getting-started',
        exact: true,
        component: GettingStarted
    }, 
    {
        path: '/',
        exact: true,
        component: () => {
            return <Redirect to={'/__pwa-kit/getting-started'} />
        }
    }
]

export default routes
