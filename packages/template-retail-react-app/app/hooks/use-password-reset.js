/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {AuthHelpers, useAuthHelper} from '@salesforce/commerce-sdk-react'
import {useToast} from '@salesforce/retail-react-app/app/components/shared/ui'
import {useIntl} from 'react-intl'
import {absoluteUrl} from '@salesforce/retail-react-app/app/utils/url'
/**
 * This hook provides commerce-react-sdk hooks to simplify the reset password flow.
 */
export const usePasswordReset = () => {
    const toast = useToast()
    const {formatMessage} = useIntl()

    const getPasswordResetTokenMutation = useAuthHelper(AuthHelpers.GetPasswordResetToken)
    const resetPasswordMutation = useAuthHelper(AuthHelpers.ResetPassword)

    const getPasswordResetToken = async (email) => {
        await getPasswordResetTokenMutation.mutateAsync({
            user_id: email,
            callback_uri: absoluteUrl('/reset-password-callback')
        })
    }

    const resetPassword = async ({email, token, newPassword}) => {
        await resetPasswordMutation.mutateAsync(
            {user_id: email, pwd_action_token: token, new_password: newPassword},
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
