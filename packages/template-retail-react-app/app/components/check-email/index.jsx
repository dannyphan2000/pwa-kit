/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage, useIntl} from 'react-intl'
import {Button, Stack, Text} from '@salesforce/retail-react-app/app/components/shared/ui'
import {BrandLogo} from '@salesforce/retail-react-app/app/components/icons'

const CheckEmail = ({email}) => {
    return (
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
                    //TODO: Replace with email from login form !!!
                    values={{
                        email: 'email@email.com',

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

                <Button onClick={() => {}}>
                    <FormattedMessage
                        defaultMessage="Resend Link"
                        id="auth_modal.check_email.button.resend_link"
                    />
                </Button>
            </Stack>
        </Stack>
    )
}

CheckEmail.propTypes = {
    email: PropTypes.string
}

export default CheckEmail
