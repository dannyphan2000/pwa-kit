/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    AuthHelpers,
    useAuthHelper
} from '@salesforce/commerce-sdk-react'

/**
 * This hook provides commerce-react-sdk hooks to simplify the passwordless login flow.
 */
export const usePasswordlessLogin = () => {
    const authorizePasswordless = useAuthHelper(
        AuthHelpers.AuthorizePasswordless
    )

    const authorizePasswordlessLogin = async (email) => {
        await authorizePasswordless.mutateAsync({userid: email})
    }

    const login = useAuthHelper(AuthHelpers.LoginPasswordlessUser)

    const loginWithPasswordlessAccessToken = async (token) => {
        await login.mutateAsync({pwdlessLoginToken: token})
    }

    return {authorizePasswordlessLogin, loginWithPasswordlessAccessToken}
}

export default usePasswordlessLogin
