/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {defineMessage, useIntl} from 'react-intl'
import {Button, Stack} from '@salesforce/retail-react-app/app/components/shared/ui'
import logger from '@salesforce/retail-react-app/app/utils/logger-instance'
import {useAuthHelper, AuthHelpers} from '@salesforce/commerce-sdk-react'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {useAppOrigin} from '@salesforce/retail-react-app/app/hooks/use-app-origin'

// Icons
import {AppleIcon, GoogleIcon} from '@salesforce/retail-react-app/app/components/icons'

const IDP_CONFIG = {
    apple: {
        icon: AppleIcon,
        message: defineMessage({
            id: 'login_form.button.apple',
            defaultMessage: 'Apple'
        })
    },
    google: {
        icon: GoogleIcon,
        message: defineMessage({
            id: 'login_form.button.google',
            defaultMessage: 'Google'
        })
    }
}

/**
 * Create a stack of button for social login links
 * @param {array} idps - array of known IDPs to show buttons for
 * @returns
 */
const SocialLogin = ({idps}) => {
    const {formatMessage} = useIntl()
    const authorizeIDP = useAuthHelper(AuthHelpers.AuthorizeIDP)

    // Build redirectURI from config values
    const appOrigin = useAppOrigin()
    const redirectPath = getConfig().app.login.social?.redirectURI || ''
    const redirectURI = `${appOrigin}${redirectPath}`

    return (
        idps && (
            <Stack spacing={4}>
                {idps.map((name) => {
                    const config = IDP_CONFIG[name.toLowerCase()]

                    if (!config) {
                        logger.error(
                            'IDP "' +
                                name +
                                '" is missing from IDP_CONFIG. Valid IDPs are [' +
                                Object.keys(IDP_CONFIG).join(', ') +
                                '].'
                        )
                        return null
                    }

                    const Icon = config?.icon
                    const message = formatMessage(config?.message)

                    return (
                        config && (
                            <Button
                                onClick={async () => {
                                    alert(message)
                                    await authorizeIDP.mutateAsync({
                                        hint: name,
                                        redirectURI: redirectURI
                                    })
                                }}
                                borderColor="gray.500"
                                color="blue.600"
                                variant="outline"
                            >
                                <Icon sx={{marginRight: 2}} />
                                {message}
                            </Button>
                        )
                    )
                })}
            </Stack>
        )
    )
}

SocialLogin.propTypes = {
    idps: PropTypes.array,
    redirectURI: PropTypes.string
}

export default SocialLogin
