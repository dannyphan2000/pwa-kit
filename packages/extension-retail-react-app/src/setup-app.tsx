/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {RouteProps} from 'react-router-dom'
import loadable from '@loadable/component'

// Platform Imports
import {ApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'
// TODO: Can I include the below inport with the one above?
import {applyHOCs} from '@salesforce/pwa-kit-extension-sdk/react/utils'

// Local Imports
import {Config} from './types'
import {configureRoutes} from './utils/routes-utils'
import {withAppLayout} from './components/with-app-layout'
import {withChakraUI} from './components/with-chakra-ui'
import {withCommerceSdkReact} from './components/with-commerce-sdk-react'
import {withCurrency} from './components/with-currency'
import {withMultiSite} from './components/with-multi-site'
import {withReactIntl} from './components/with-react-intl'
import {withStorefrontPreview} from './components/with-storefront-preview'

// Components
import {Skeleton} from '@chakra-ui/react'

// Page fallback
const fallback = <Skeleton height="75vh" width="100%" />

// Page Loadables
const Home = loadable(() => import('./pages/home'), {fallback})
const Login = loadable(() => import('./pages/login'), {fallback})
const Registration = loadable(() => import('./pages/registration'), {
    fallback
})
const ResetPassword = loadable(() => import('./pages/reset-password'), {fallback})
const Account = loadable(() => import('./pages/account'), {fallback})
const Cart = loadable(() => import('./pages/cart'), {fallback})
const Checkout = loadable(() => import('./pages/checkout'), {
    fallback
})
const CheckoutConfirmation = loadable(() => import('./pages/checkout/confirmation'), {fallback})
const LoginRedirect = loadable(() => import('./pages/login-redirect'), {fallback})
const ProductDetail = loadable(() => import('./pages/product-detail'), {fallback})
const ProductList = loadable(() => import('./pages/product-list'), {
    fallback
})
const Wishlist = loadable(() => import('./pages/account/wishlist'), {
    fallback
})
const PageNotFound = loadable(() => import('./pages/page-not-found'))

class RetailReactApp extends ApplicationExtension<Config> {
    extendApp<T>(App: React.ComponentType<T>): React.ComponentType<T> {
        // NOTE: The order of these HOCs is important!
        const requiredHOCs = [
            withAppLayout,
            withChakraUI, 
            withCurrency,
            withReactIntl,
            withMultiSite, 
            withStorefrontPreview,
            withCommerceSdkReact
        ]

        return applyHOCs(App, requiredHOCs)
    }

    extendRoutes(routes: RouteProps[]): RouteProps[] {
        const extensionRoutes = [
            {
                path: '/',
                component: Home,
                exact: true
            },
            {
                path: '/login',
                component: Login,
                exact: true
            },
            {
                path: '/registration',
                component: Registration,
                exact: true
            },
            {
                path: '/reset-password',
                component: ResetPassword,
                exact: true
            },
            {
                path: '/account',
                component: Account
            },
            {
                path: '/checkout',
                component: Checkout,
                exact: true
            },
            {
                path: '/checkout/confirmation/:orderNo',
                component: CheckoutConfirmation
            },
            {
                path: '/callback',
                component: LoginRedirect,
                exact: true
            },
            {
                path: '/cart',
                component: Cart,
                exact: true
            },
            {
                path: '/product/:productId',
                component: ProductDetail
            },
            {
                path: '/search',
                component: ProductList
            },
            {
                path: '/category/:categoryId',
                component: ProductList
            },
            {
                path: '/account/wishlist',
                component: Wishlist
            },
            {
                path: '*',
                component: PageNotFound
            }
        ]

        return configureRoutes([...extensionRoutes, ...routes], {app: this.getConfig()}, {
            ignoredRoutes: ['/callback', '*']
        })
    }
}

export default RetailReactApp
