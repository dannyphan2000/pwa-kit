/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect, useState} from 'react'
import PropTypes from 'prop-types'
import {useIntl, defineMessage} from 'react-intl'
import {Box, Container} from '@salesforce/retail-react-app/app/components/shared/ui'
import {
    AuthHelpers,
    useAuthHelper,
    useCustomerBaskets,
    useCustomerId,
    useCustomerType,
    useShopperBasketsMutation
} from '@salesforce/commerce-sdk-react'
import useNavigation from '@salesforce/retail-react-app/app/hooks/use-navigation'
import Seo from '@salesforce/retail-react-app/app/components/seo'
import {useForm} from 'react-hook-form'
import {useRouteMatch} from 'react-router'
import {useLocation} from 'react-router-dom'
import useEinstein from '../../commerce-api/hooks/useEinstein'

import LoginForm from '../../components/login'

import {isServer} from '../../utils/utils'

import {
    AuthHelpers,
    useAuthHelper,
    useCustomer,
    useCustomerId,
    useCustomerType,
    useCustomerBaskets,
    useShopperBasketsMutation
} from '@salesforce/commerce-sdk-react'

const Login = () => {
    const {formatMessage} = useIntl()

    const customerId = useCustomerId()
    const {isRegistered, customerType} = useCustomerType()

    const customer = useCustomer(
        {parameters: {customerId}},
        {enabled: !!customerId && isRegistered}
    )

    // const customer = useCustomer()
    const navigate = useNavigation()
    const form = useForm()
    const location = useLocation()
    const queryParams = new URLSearchParams(location.search)
    const {path} = useRouteMatch()
    const einstein = useEinstein()

    const login = useAuthHelper(AuthHelpers.LoginRegisteredUserB2C)
    const register = useAuthHelper(AuthHelpers.Register)

    const {data: baskets} = useCustomerBaskets(
        {parameters: {customerId}},
        {enabled: !!customerId && !isServer, keepPreviousData: true}
    )

    const submitForm = async (data) => {
        try {
            await login.mutateAsync({
                username: data.email,
                password: data.password
            })
            const hasBasketItem = baskets?.baskets?.[0]?.productItems?.length > 0
            // we only want to merge basket when the user is logged in as a recurring user
            // only recurring users trigger the login mutation, new user triggers register mutation
            // this logic needs to stay in this block because this is the only place that tells if a user is a recurring user
            // if you change logic here, also change it in login page
            const shouldMergeBasket = hasBasketItem && prevAuthType === 'guest'
            if (shouldMergeBasket) {
                mergeBasket.mutate({
                    headers: {
                        // This is not required since the request has no body
                        // but CommerceAPI throws a '419 - Unsupported Media Type' error if this header is removed.
                        'Content-Type': 'application/json'
                    },
                    parameters: {
                        createDestinationBasket: true
                    }
                })
            }
        } catch (error) {
            const message = /invalid credentials/i.test(error.message)
                ? formatMessage({
                      defaultMessage: 'Incorrect username or password, please try again.',
                      id: 'login_page.error.incorrect_username_or_password'
                  })
                : error.message
            form.setError('global', {type: 'manual', message})
        }
    }

        return {
            login: async (data) => {
                if (loginType === LOGIN_TYPES.PASSWORD) {
                    try {
                        await login.mutateAsync({username: data.email, password: data.password})
                    } catch (error) {
                        const message = /Unauthorized/i.test(error.message)
                            ? formatMessage(LOGIN_ERROR_MESSAGE)
                            : formatMessage(API_ERROR_MESSAGE)
                        form.setError('global', {type: 'manual', message})
                    }
                    handleMergeBasket()
                } else if (loginType === LOGIN_TYPES.PASSWORDLESS) {
                    setPasswordlessLoginEmail(data.email)
                    await handlePasswordlessLogin(data.email)
                }
            },
            email: async () => {
                await handlePasswordlessLogin(passwordlessLoginEmail)
            }
        }[currentView](data)
    }

    // Handles passwordless login by retrieving the 'token' from the query parameters and
    // executing a passwordless login attempt using the token. The process waits for the
    // customer baskets to be loaded to guarantee proper basket merging.
    useEffect(() => {
        if (path === PASSWORDLESS_LOGIN_LANDING_PATH && isSuccessCustomerBaskets) {
            const token = decodeURIComponent(queryParams.get('token'))
            if (queryParams.get('redirect_url')) {
                setRedirectPath(decodeURIComponent(queryParams.get('redirect_url')))
            } else {
                setRedirectPath('')
            }

            const passwordlessLogin = async () => {
                try {
                    await loginPasswordless.mutateAsync({pwdlessLoginToken: token})
                } catch (e) {
                    const errorData = await e.response?.json()
                    const message = INVALID_TOKEN_ERROR.test(errorData.message)
                        ? formatMessage(INVALID_TOKEN_ERROR_MESSAGE)
                        : formatMessage(API_ERROR_MESSAGE)
                    form.setError('global', {type: 'manual', message})
                }
            }
            passwordlessLogin()
        }
    }, [path, isSuccessCustomerBaskets])

    // If customer is registered push to account page and merge the basket
    useEffect(() => {
        if (isRegistered) {
            handleMergeBasket()
            const redirectTo = redirectPath ? redirectPath : '/account'
            navigate(redirectTo)
        }
    }, [isRegistered, redirectPath])

    /**************** Einstein ****************/
    useEffect(() => {
        einstein.sendViewPage(location.pathname)
        dataCloud.sendViewPage(location.pathname)
    }, [])

    return (
        <Box data-testid="login-page" bg="gray.50" py={[8, 16]}>
            <Seo title="Sign in" description="Customer sign in" />
            <Container
                paddingTop={16}
                width={['100%', '407px']}
                bg="white"
                paddingBottom={14}
                marginTop={8}
                marginBottom={8}
                borderRadius="base"
            >
                {!form.formState.isSubmitSuccessful && currentView === LOGIN_VIEW && (
                    <LoginForm
                        form={form}
                        submitForm={submitForm}
                        clickCreateAccount={() => navigate('/registration')}
                        handlePasswordlessLoginClick={() => {
                            setLoginType(LOGIN_TYPES.PASSWORDLESS)
                        }}
                        handleForgotPasswordClick={() => navigate('/reset-password')}
                        isPasswordlessEnabled={isPasswordlessEnabled}
                        isSocialEnabled={isSocialEnabled}
                        idps={idps}
                        setLoginType={setLoginType}
                    />
                )}
                {form.formState.isSubmitSuccessful && currentView === EMAIL_VIEW && (
                    <PasswordlessEmailConfirmation
                        form={form}
                        submitForm={submitForm}
                        email={passwordlessLoginEmail}
                    />
                )}
            </Container>
        </Box>
    )
}

Login.getTemplateName = () => 'login'

Login.propTypes = {
    initialView: PropTypes.oneOf([LOGIN_VIEW, EMAIL_VIEW]),
    match: PropTypes.object
}

export default Login
