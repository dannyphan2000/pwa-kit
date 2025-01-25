/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Heading, Badge, useMultiStyleConfig, SystemStyleObject} from '@chakra-ui/react'
import metaData from '../../extension-meta.json'

/**
 * Note: for any custom component for extension, the name space convention needs to be `${extensionName}/<componanyName>
 * The reason we need this convention is to assure extensions components theme
 * can work well with other extensions when installed in a single project. This will ensure the name will be unique per theme
 */
export const StoreLocatorHeading = (): JSX.Element => {
    const styles = useMultiStyleConfig(`${metaData.name}/StoreHeading`)
    return (
        <Heading sx={styles.heading}>
            <>
                Find a Store
                <Badge sx={styles.badge}>New</Badge>
            </>
        </Heading>
    )
}
