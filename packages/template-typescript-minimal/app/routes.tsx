/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import loadable, {LoadableComponent} from '@loadable/component'
import React, {lazy} from 'react'
// import Home from './pages/home'
// import User from './pages/user'
const Home = lazy(() => import('./pages/home'))
const User = lazy(() => import('./pages/user'))

const routes = [
    {
        path: '/',
        exact: true,
        // Type assertion because otherwise we encounter this error:
        // Exported variable 'routes' has or is using name 'Props' from external module "./app/pages/home" but cannot be named.
        component: Home as React.ElementType
    },
    {
        path: '/user/:userId',
        exact: true,
        // Type assertion because otherwise we encounter this error:
        // Exported variable 'routes' has or is using name 'Props' from external module "./app/pages/home" but cannot be named.
        component: User as React.ElementType
    }
]

export default routes
