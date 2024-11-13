/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    AuthHelpers,
    useAuthHelper,
    useShopperLoginMutation,
    ShopperLoginMutations
} from '@salesforce/commerce-sdk-react'
import {absoluteUrl} from '@salesforce/retail-react-app/app/utils/url'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'

/**
 * This hook provides commerce-react-sdk hooks to simplify the passwordless login flow.
 */
export const usePasswordlessLogin = () => {
    const {site} = useMultiSite()

    const authorizePasswordlessCustomer = useShopperLoginMutation(
        ShopperLoginMutations.AuthorizePasswordlessCustomer
    )

    const authorizePasswordlessLogin = async (email) => {
        const body = {
            user_id: email,
            mode: 'callback',
            channel_id: site.id,
            // TODO: Should this be set in default.js or constant?
            callback_uri: absoluteUrl('/passwordless-login-callback')
        }
        await authorizePasswordlessCustomer.mutateAsync({body})
    }

    const login = useAuthHelper(AuthHelpers.LoginPasswordlessUser)

    const fetchPasswordlessAccessToken = async (token) => {
        await login.mutateAsync({pwdlessLoginToken: token})
    }

    return {authorizePasswordlessLogin, fetchPasswordlessAccessToken}
}

export default usePasswordlessLogin
