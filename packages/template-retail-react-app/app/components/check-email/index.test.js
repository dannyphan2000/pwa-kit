/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen} from '@testing-library/react'
import {renderWithProviders} from '@salesforce/retail-react-app/app/utils/test-utils'
import CheckEmail from '@salesforce/retail-react-app/app/components/check-email'

test('renders CheckEmail component with passed email', () => {
    const email = 'test@salesforce.com'
    renderWithProviders(<CheckEmail email={email} />)
    expect(screen.getByText(email)).toBeInTheDocument()
})
