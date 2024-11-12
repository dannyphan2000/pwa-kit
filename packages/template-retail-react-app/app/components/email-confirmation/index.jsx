/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {Button, Stack, Text} from '@salesforce/retail-react-app/app/components/shared/ui'
import {BrandLogo} from '@salesforce/retail-react-app/app/components/icons'

const PasswordlessEmailConfirmation = ({form, submitForm, email = ''}) => {
    return (
        <form
            onSubmit={form.handleSubmit(submitForm)}
            data-testid="sf-form-resend-passwordless-email"
        >
            <Stack justify="center" align="center" spacing={6}>
                <BrandLogo width="60px" height="auto" />
                <Text align="center" fontSize="xl" fontWeight="semibold">
                    <FormattedMessage
                        defaultMessage="Check Your Email"
                        id="auth_modal.check_email.title.check_your_email"
                    />
                </Text>
                <Text align="center" fontSize="md">
                    <FormattedMessage
                        defaultMessage="We just sent a login link to <b>{email}</b>"
                        id="auth_modal.check_email.description.just_sent"
                        values={{
                            email: email,
                            b: (chunks) => <b>{chunks}</b>
                        }}
                    />
                </Text>
                <Stack spacing={6} pt={4}>
                    <Text align="center" fontSize="sm">
                        <FormattedMessage
                            defaultMessage="The link may take a few minutes to arrive, check your spam folder if you're having trouble finding it"
                            id="auth_modal.check_email.description.check_spam_folder"
                        />
                    </Text>

                    <Button type="submit">
                        <FormattedMessage
                            defaultMessage="Resend Link"
                            id="auth_modal.check_email.button.resend_link"
                        />
                    </Button>
                </Stack>
            </Stack>
        </form>
    )
}

PasswordlessEmailConfirmation.propTypes = {
    form: PropTypes.object,
    submitForm: PropTypes.func,
    email: PropTypes.string
}

export default PasswordlessEmailConfirmation
