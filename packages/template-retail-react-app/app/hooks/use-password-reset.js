/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useShopperLoginMutation, ShopperLoginMutations} from '@salesforce/commerce-sdk-react'
import {absoluteUrl} from '@salesforce/retail-react-app/app/utils/url'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {useToast} from '@salesforce/retail-react-app/app/components/shared/ui'
import {useIntl} from 'react-intl'

/**
 * This hook provides commerce-react-sdk hooks to simplify the reset password flow.
 */
export const usePasswordReset = () => {
    const {site} = useMultiSite()
    const {clientId} = getConfig().app.commerceAPI.parameters
    const toast = useToast()
    const {formatMessage} = useIntl()

    const getPasswordResetTokenMutation = useShopperLoginMutation(
        ShopperLoginMutations.GetPasswordResetToken
    )

    const getPasswordResetToken = async (email) => {
        // TODO: how to remove the auth header when public client is being used
        const headers = {Authorization: ''}
        const body = {
            user_id: email,
            mode: 'callback',
            channel_id: site.id,
            // TODO: Should this be handled by commerce-sdk-react
            client_id: clientId,
            // TODO: Should this be set in default.js or constant?
            // callback_uri: 'https://webhook.site/679c46ea-a63b-41e1-b768-4db79d953646',
            callback_uri: absoluteUrl('/reset-password-callback'),
            hint: 'cross_device'
        }
        await getPasswordResetTokenMutation.mutateAsync({headers, body})
    }

    const resetPasswordMutation = useShopperLoginMutation(ShopperLoginMutations.ResetPassword)

    const resetPassword = async ({email, token, newPassword}) => {
        // TODO: how to remove the auth header when public client is being used
        const headers = {Authorization: ''}
        const body = {
            pwd_action_token: token,
            // TODO: Should this be handled by commerce-sdk-react
            client_id: clientId,
            new_password: newPassword,
            channel_id: site.id,
            user_id: email
        }
        await resetPasswordMutation.mutateAsync(
            {headers, body},
            {
                onSuccess: () => {
                    toast({
                        title: formatMessage({
                            defaultMessage: 'Password Reset Success',
                            id: 'password_reset_success.toast'
                        }),
                        status: 'success',
                        position: 'bottom-right',
                        isClosable: true
                    })
                }
            }
        )
    }

    return {getPasswordResetToken, resetPassword}
}

export default usePasswordReset
