/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect} from 'react'
import PropTypes from 'prop-types'
import {defineMessage, useIntl} from 'react-intl'
import {Button} from '@salesforce/retail-react-app/app/components/shared/ui'
import logger from '@salesforce/retail-react-app/app/utils/logger-instance'

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

    const isIdpValid = (name) => {
        return name in IDP_CONFIG && IDP_CONFIG[name.toLowerCase()]
    }

    useEffect(() => {
        idps.map((name) => {
            if (!isIdpValid(name)) {
                logger.error(
                    `IDP "${name}" is missing or has an invalid configuration in IDP_CONFIG. Valid IDPs are [${Object.keys(
                        IDP_CONFIG
                    ).join(', ')}].`
                )
            }
        })
    }, [idps])

    return (
        idps && (
            <>
                {idps
                    .filter((name) => isIdpValid(name))
                    .map((name) => {
                        const config = IDP_CONFIG[name.toLowerCase()]
                        const Icon = config?.icon
                        const message = formatMessage(config?.message)

                        return (
                            config && (
                                <Button
                                    onClick={() => {
                                        alert(message)
                                    }}
                                    borderColor="gray.500"
                                    color="blue.600"
                                    variant="outline"
                                    key={`${name}-button`}
                                >
                                    <Icon sx={{marginRight: 2}} />
                                    {message}
                                </Button>
                            )
                        )
                    })}
            </>
        )
    )
}

SocialLogin.propTypes = {
    idps: PropTypes.arrayOf(PropTypes.string)
}

export default SocialLogin
