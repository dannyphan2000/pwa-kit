/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Heading, Badge, useMultiStyleConfig, SystemStyleObject} from '@chakra-ui/react'
import metaData from '../../../extension-meta.json'
import {useApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'

export const StoreLocatorHeading = (): JSX.Element => {
    const extension = useApplicationExtension(metaData.id)
    let styles: Record<string, SystemStyleObject>
    styles = useMultiStyleConfig(`${extension?.getName()}/StoreHeading`)
    if (Object.keys(styles).length === 0) {
        styles = useMultiStyleConfig('StoreHeading')
    }
    return (
        <Heading sx={styles.heading}>
            <>
                Find a Store
                <Badge sx={styles.badge}>New</Badge>
            </>
        </Heading>
    )
}
