/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'

// Components
import {Alert, AlertDescription, Box, Flex} from '@chakra-ui/react'

// Icons
import {AlertIcon} from '../../components/icons'

/**
 * A banner component that displays when the user is offline.
 */
const OfflineBanner = ({...rest}) => {
    return (
        <Alert status="warning" {...rest}>
            <Flex align="center">
                <AlertIcon mr={2} />
                <AlertDescription>
                    <FormattedMessage
                        defaultMessage="You're currently browsing in offline mode"
                        id="offline_banner.description.browsing_offline_mode"
                    />
                </AlertDescription>
            </Flex>
        </Alert>
    )
}

OfflineBanner.displayName = 'OfflineBanner'

OfflineBanner.propTypes = {}

export default OfflineBanner
