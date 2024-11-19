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
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'

/**
 * This hook provides commerce-react-sdk hooks to simplify the passwordless login flow.
 */
export const usePasswordlessLogin = () => {
    const {site} = useMultiSite()
    const {passwordless} = getConfig().app.login

    const authorizePasswordlessCustomer = useShopperLoginMutation(
        ShopperLoginMutations.AuthorizePasswordlessCustomer
    )

    const authorizePasswordlessLogin = async (email) => {
        const body = {
            user_id: email,
            mode: 'callback',
            channel_id: site.id,
            callback_uri: passwordless.callbackURI
        }
        await authorizePasswordlessCustomer.mutateAsync({body})
    }

    const login = useAuthHelper(AuthHelpers.LoginPasswordlessUser)

    const loginWithPasswordlessAccessToken = async (token) => {
        await login.mutateAsync({pwdlessLoginToken: token})
    }

    return {authorizePasswordlessLogin, loginWithPasswordlessAccessToken}
}

export default usePasswordlessLogin
