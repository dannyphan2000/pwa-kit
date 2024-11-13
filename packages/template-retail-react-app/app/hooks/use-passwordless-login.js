/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useShopperLoginMutation, ShopperLoginMutations} from '@salesforce/commerce-sdk-react'
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

    const postAuthorizePasswordlessCustomer = async (email) => {
        const body = {
            user_id: email,
            mode: 'callback',
            channel_id: site.id,
            callback_uri: absoluteUrl('/passwordless-login-callback')
        }
        await authorizePasswordlessCustomer.mutateAsync({body})
    }

    return {
        postAuthorizePasswordlessCustomer
    }
}

export default usePasswordlessLogin
