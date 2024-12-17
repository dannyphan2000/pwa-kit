/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Redirect, Route} from 'react-router-dom'
import PropTypes from 'prop-types'

/**
 * The `RedirectWithStatus` HOC component is used to specify a different status code when redirecting via
 * the Redirect component.
 * The default redirect behavior when this component is not used is to set a 302 status.
 *
 * @param {number} status - The HTTP status code. Defaults to 302 if not specified
 */
export const RedirectWithStatus = ({status = 302, ...props}) => {
    return (
        <Route
            render={({staticContext}) => {
                if (staticContext) staticContext.status = status
                return <Redirect {...props} />
            }}
        />
    )
}

RedirectWithStatus.propTypes = {
    status: PropTypes.number,
    to: PropTypes.string
}
