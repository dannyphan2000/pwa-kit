/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {Alert, Button, Stack, Text} from '@salesforce/retail-react-app/app/components/shared/ui'
import {AlertIcon, BrandLogo} from '@salesforce/retail-react-app/app/components/icons'
import {noop} from '@salesforce/retail-react-app/app/utils/utils'
import ResetPasswordFields from '@salesforce/retail-react-app/app/components/forms/reset-password-fields'

const PasswordResetSuccess = () => (
    <Stack justify="center" align="center" spacing={6}>
        <BrandLogo width="60px" height="auto" />
        <Text align="center" fontSize="md">
            <FormattedMessage
                defaultMessage={'Password Reset'}
                id="auth_modal.password_reset_success.title.password_reset"
            />
        </Text>
        <Stack spacing={6} pt={4}>
            <Text align="center" fontSize="sm">
                <FormattedMessage
                    defaultMessage="You will receive an email at <b>{email}</b> with a link to reset your password shortly."
                    id="auth_modal.password_reset_success.info.will_email_shortly"
                    values={{
                        email: submittedEmail.current,

                        b: (chunks) => <b>{chunks}</b>
                    }}
                />
            </Text>

            <Button onClick={onBackToSignInClick}>
                <FormattedMessage
                    defaultMessage="Back to Sign In"
                    id="auth_modal.password_reset_success.button.back_to_sign_in"
                />
            </Button>
        </Stack>
    </Stack>
)