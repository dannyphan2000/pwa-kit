/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {fireEvent, screen, waitFor} from '@testing-library/react'
import {useAuthHelper, AuthHelpers} from '@salesforce/commerce-sdk-react'
import mockConfig from '@salesforce/retail-react-app/config/mocks/default'
import {renderWithProviders} from '@salesforce/retail-react-app/app/utils/test-utils'
import usePasswordlessLogin from '@salesforce/retail-react-app/app/hooks/use-passwordless-login'

const mockEmail = 'test@email.com'
const mockToken = '123456'
const mockSiteId = mockConfig.app.defaultSite
const mockCallbackUri = mockConfig.app.login.passwordless.callbackURI

const MockComponent = () => {
    const {authorizePasswordlessLogin, loginWithPasswordlessAccessToken} = usePasswordlessLogin()

    return (
        <div>
            <button
                data-testid="authorize-passwordless-login"
                onClick={() => authorizePasswordlessLogin(mockEmail)}
            />
            <button
                data-testid="login-with-passwordless-access-token"
                onClick={() => loginWithPasswordlessAccessToken(mockToken)}
            />
        </div>
    )
}

jest.mock('@salesforce/commerce-sdk-react', () => {
    const originalModule = jest.requireActual('@salesforce/commerce-sdk-react')
    return {
        ...originalModule,
        useAuthHelper: jest.fn(),
    }
})

const authorizePasswordless = {mutateAsync: jest.fn()}
const loginPasswordlessUser = {mutateAsync: jest.fn()}
useAuthHelper.mockImplementation((param) => {
    if (param === AuthHelpers.LoginPasswordlessUser) {
        return loginPasswordlessUser
    } else if (param === AuthHelpers.AuthorizePasswordless) {
        return authorizePasswordless
    }
})

afterEach(() => {
    jest.clearAllMocks()
})

describe('The usePasswordlessLogin', () => {
    test('authorizePasswordlessLogin sends expected api request', async () => {
        renderWithProviders(<MockComponent />)

        const trigger = screen.getByTestId('authorize-passwordless-login')
        await fireEvent.click(trigger)
        await waitFor(() => {
            expect(authorizePasswordless.mutateAsync).toHaveBeenCalled()
            expect(authorizePasswordless.mutateAsync).toHaveBeenCalledWith({userid: mockEmail})
        })
    })

    test('loginWithPasswordlessAccessToken sends expected api request', async () => {
        renderWithProviders(<MockComponent />)

        const trigger = screen.getByTestId('login-with-passwordless-access-token')
        await fireEvent.click(trigger)
        await waitFor(() => {
            expect(loginPasswordlessUser.mutateAsync).toHaveBeenCalled()
            expect(loginPasswordlessUser.mutateAsync).toHaveBeenCalledWith({pwdlessLoginToken: mockToken})
        })
    })
})
