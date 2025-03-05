/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {useIntl} from 'react-intl'

// Components
import {Alert, Text, useSlotRecipe} from '@chakra-ui/react'

// Icons
import {AlertIcon} from '../icons'

const OfflineBanner = () => {
    const intl = useIntl()
    const recipe = useSlotRecipe({key: 'offlineBanner'})
    const recipe1 = useSlotRecipe({key: 'alert'})
    console.log('recipe1()', recipe1())

    const styles = recipe()
    return (
        <Alert.Root status="info" css={styles.container} role="alert" size="lg">
            <Alert.Indicator>
                <AlertIcon css={styles.icon} />
            </Alert.Indicator>
            <Text css={styles.message}>
                {intl.formatMessage({
                    id: 'offline_banner.description.browsing_offline_mode',
                    defaultMessage: "You're currently browsing in offline mode"
                })}
            </Text>
        </Alert.Root>
    )
}

export default OfflineBanner
