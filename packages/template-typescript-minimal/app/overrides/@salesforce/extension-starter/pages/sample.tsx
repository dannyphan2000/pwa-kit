/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {Fragment} from 'react'
import {getStaticAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import extensionMeta from '../../extension-meta.json'

const Sample = () => {
    const logoUrl = getStaticAssetUrl('salesforce-logo.svg', {
        appExtensionPackageName: extensionMeta.id
    })

    return (
        <Fragment>
            <h1>Forced override</h1>
            
        </Fragment>
    )
}

Sample.getTemplateName = () => 'sample'

export default Sample
