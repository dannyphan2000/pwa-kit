/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {Fragment} from 'react'
import PropTypes from 'prop-types'
import {getStaticAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'
import extensionMeta from '../../extension-meta.json'

interface SampleProps {
    title: string
    [key: string]: any
}

const Sample = ({title, ...props}: SampleProps) => {
    const logoUrl = getStaticAssetUrl('salesforce-logo.svg', {
        appExtensionPackageName: extensionMeta.id
    })

    return (
        <Fragment>
            <h1>{title}</h1>
            <hr />
            <img alt="logo" src={logoUrl} width={200} />

            <p>
                If you are reading this, it means that this page was successfully added to your base
                project. 🎉
            </p>
        </Fragment>
    )
}

Sample.getTemplateName = () => 'sample'
Sample.displayName = 'SamplePage'
Sample.propTypes = {
    title: PropTypes.string
}

export default Sample
