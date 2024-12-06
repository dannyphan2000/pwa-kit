/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen, waitFor} from '@testing-library/react'
import {renderWithProviders} from '@salesforce/retail-react-app/app/utils/test-utils'
import ResetPasswordForm from '.'
import mockConfig from '@salesforce/retail-react-app/config/mocks/default'
import {useForm} from 'react-hook-form'

const MockedComponent = () => {
    const form = useForm()
    const mockForm = {
        ...form,
        formState: {
            ...form.formState,
            errors: {
                global: {message: 'Something went wrong'}
            }
        }
    }
    return (
        <div>
            <ResetPasswordForm form={mockForm} />
        </div>
    )
}

test('Renders error message with form error state', async () => {
    // Render our test component
    renderWithProviders(<MockedComponent />, {
        wrapperProps: {siteAlias: 'uk', appConfig: mockConfig.app}
    })

    await waitFor(() => {
        expect(screen.getByText(/something went wrong/i)).toBeInTheDocument()
    })
})
