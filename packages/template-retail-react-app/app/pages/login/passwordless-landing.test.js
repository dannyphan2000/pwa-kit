/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {screen, waitFor} from '@testing-library/react'
import {rest} from 'msw'
import {
    renderWithProviders,
    createPathWithDefaults,
    guestToken
} from '@salesforce/retail-react-app/app/utils/test-utils'
import Login from '.'
import {BrowserRouter as Router, Route} from 'react-router-dom'
import Account from '@salesforce/retail-react-app/app/pages/account'
import Registration from '@salesforce/retail-react-app/app/pages/registration'
import ResetPassword from '@salesforce/retail-react-app/app/pages/reset-password'
import mockConfig from '@salesforce/retail-react-app/config/mocks/default'
import {mockedRegisteredCustomer} from '@salesforce/retail-react-app/app/mocks/mock-data'
import {AuthHelpers, useCustomerType} from '@salesforce/commerce-sdk-react'
import {useLocation} from 'react-router-dom'

const mockMergedBasket = {
    basketId: 'a10ff320829cb0eef93ca5310a',
    currency: 'USD',
    customerInfo: {
        customerId: 'registeredCustomerId',
        email: 'customer@test.com'
    }
}

const mockAuthHelperFunctions = {
    [AuthHelpers.LoginPasswordlessUser]: {mutateAsync: jest.fn()}
}

const MockedComponent = () => {
    const match = {
        params: {pageName: 'profile'}
    }
    return (
        <Router>
            <Login />
            <Route path={createPathWithDefaults('/registration')}>
                <Registration />
            </Route>
            <Route path={createPathWithDefaults('/reset-password')}>
                <ResetPassword />
            </Route>
            <Route path={createPathWithDefaults('/account')}>
                <Account match={match} />
            </Route>
        </Router>
    )
}

jest.mock('react-router', () => {
    return {
        ...jest.requireActual('react-router'),
        useRouteMatch: () => {return {path: '/passwordless-login-landing'}}
    }
})

jest.mock('react-router-dom', () => {
    return {
        ...jest.requireActual('react-router-dom'),
        useLocation: jest.fn()
    }
})

jest.mock('@salesforce/commerce-sdk-react', () => {
    const originalModule = jest.requireActual('@salesforce/commerce-sdk-react')
    return {
        ...originalModule,
        useAuthHelper: jest
            .fn()
            .mockImplementation((helperType) => mockAuthHelperFunctions[helperType]),
        useCustomerBaskets: () => {return {data: mockMergedBasket, isSuccess: true}},
        useCustomerType: jest.fn(() => {return {isRegistered: false, customerType: 'guest'}})
    }
})

// Set up and clean up
beforeEach(() => {
    global.server.use(
        rest.post('*/customers', (req, res, ctx) => {
            return res(ctx.delay(0), ctx.status(200), ctx.json(mockedRegisteredCustomer))
        }),
        rest.get('*/customers/:customerId', (req, res, ctx) => {
            const {customerId} = req.params
            if (customerId === 'customerId') {
                return res(
                    ctx.delay(0),
                    ctx.status(200),
                    ctx.json({
                        authType: 'guest',
                        customerId: 'customerid'
                    })
                )
            }
            return res(ctx.delay(0), ctx.status(200), ctx.json(mockedRegisteredCustomer))
        })
    )
})
afterEach(() => {
    jest.resetAllMocks()
})

describe('Passwordless landing tests', function () {

    test('On passwordless landing, make sure token in magic link is passed as param', async () => {
        const token = '12345678'
        useLocation.mockReturnValue({search: `?token=${token}&redirect_url=/womens-tops`})
        renderWithProviders(<MockedComponent />, {
            wrapperProps: {
                siteAlias: 'uk',
                locale: {id: 'en-GB'},
                appConfig: mockConfig.app,
                isGuest: true
            }
        })
        expect(
            mockAuthHelperFunctions[AuthHelpers.LoginPasswordlessUser].mutateAsync
        ).toHaveBeenCalledWith({
            pwdlessLoginToken: token
        })
    })
})