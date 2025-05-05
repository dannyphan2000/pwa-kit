/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {renderWithProviders} from '@salesforce/retail-react-app/app/utils/test-utils'
import {useForm} from 'react-hook-form'
import UpdatePasswordFields from '@salesforce/retail-react-app/app/components/forms/update-password-fields'
import {screen} from '@testing-library/react'

const WrapperComponent = ({...props}) => {
    const form = useForm()
    return <UpdatePasswordFields form={form} />
}

describe('UpdatePasswordFields component', () => {
    test('renders current password, new password, and confirm new password fields by default', () => {
        renderWithProviders(<WrapperComponent />)

        const currentPasswordInput = screen.getByLabelText('Current Password')
        expect(currentPasswordInput).toBeInTheDocument()
        expect(currentPasswordInput).toHaveAttribute('type', 'password')

        const newPasswordInput = screen.getByLabelText('New Password')
        expect(newPasswordInput).toBeInTheDocument()
        expect(newPasswordInput).toHaveAttribute('type', 'password')

        const confirmNewPasswordInput = screen.getByLabelText('Confirm New Password')
        expect(confirmNewPasswordInput).toBeInTheDocument()
        expect(confirmNewPasswordInput).toHaveAttribute('type', 'password')
    })
})
