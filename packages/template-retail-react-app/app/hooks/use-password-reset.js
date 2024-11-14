/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    useShopperLoginMutation,
    ShopperLoginMutations
} from '@salesforce/commerce-sdk-react'
import {absoluteUrl} from '@salesforce/retail-react-app/app/utils/url'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'

/**
 * This hook provides commerce-react-sdk hooks to simplify the reset password flow.
 */
export const usePasswordReset = () => {
    const {site} = useMultiSite()

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
            // TODO: How to dynamically set the client id?
            client_id: 'faed469c-f8b1-4427-af87-715fcd8c3240',
            // TODO: Should this be set in default.js or constant?
            callback_uri: 'https://webhook.site/a134b707-0514-4655-a293-9cd92073bf12',
            // callback_uri: absoluteUrl('/reset-password-landing'),
            hint: 'cross_device'
        }
        await getPasswordResetTokenMutation.mutateAsync({headers, body})
    }

    const resetPasswordMutation = useShopperLoginMutation(
        ShopperLoginMutations.ResetPassword
    )

    const resetPassword = async ({email, token, newPassword}) => {
        // TODO: how to remove the auth header when public client is being used
        const headers = {Authorization: ''}
        const body = {
            pwd_action_token: token,
            // TODO: How to dynamically set the client id?
            client_id: 'faed469c-f8b1-4427-af87-715fcd8c3240',
            new_password: newPassword,
            channel_id: site.id,
            user_id: email
        }
        await resetPasswordMutation.mutateAsync({headers, body},
            {
                onSuccess: () => {
                    setIsEditing(false)
                    toast({
                        title: formatMessage({
                            defaultMessage: 'Profile updated',
                            id: 'profile_card.info.profile_updated'
                        }),
                        status: 'success',
                        isClosable: true
                    })
                    headingRef?.current?.focus()
                }
            }
        )
    }
    
    return {getPasswordResetToken, resetPassword}
}

export default usePasswordReset
