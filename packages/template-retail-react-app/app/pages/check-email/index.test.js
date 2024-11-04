/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithProviders} from '@salesforce/retail-react-app/app/utils/test-utils'
import CheckEmailPage from '@salesforce/retail-react-app/app/pages/check-email'

test('Check Email Page renders without errors', () => {
    renderWithProviders(<CheckEmailPage />)
    expect(screen.getByText('Check Your Email')).toBeInTheDocument()
    expect(typeof CheckEmailPage.getTemplateName()).toBe('string')
})
