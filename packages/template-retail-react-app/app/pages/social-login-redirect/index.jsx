/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useEffect} from 'react'
import {FormattedMessage} from 'react-intl'
import {
    Box,
    Container,
    Stack,
    Text,
    Spinner
} from '@salesforce/retail-react-app/app/components/shared/ui'

// Hooks
import useNavigation from '@salesforce/retail-react-app/app/hooks/use-navigation'
import {useAuthHelper, AuthHelpers} from '@salesforce/commerce-sdk-react'
import {useSearchParams} from '@salesforce/retail-react-app/app/hooks'
import {useCurrentCustomer} from '@salesforce/retail-react-app/app/hooks/use-current-customer'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {useAppOrigin} from '@salesforce/retail-react-app/app/hooks/use-app-origin'
import {
    getSessionJSONItem,
    clearSessionJSONItem,
    buildRedirectURI
} from '@salesforce/retail-react-app/app/utils/utils'

const SocialLoginRedirect = () => {
    const navigate = useNavigation()
    const [searchParams] = useSearchParams()
    const loginIDPUser = useAuthHelper(AuthHelpers.LoginIDPUser)
    const {data: customer} = useCurrentCustomer()
    // Build redirectURI from config values
    // Build redirectURI from config values
    const appOrigin = useAppOrigin()
    const redirectPath = getConfig().app.login.social?.redirectURI || ''
    const redirectURI = buildRedirectURI(appOrigin, redirectPath)

    const locatedFrom = getSessionJSONItem('returnToPage')

    // Runs after successful 3rd-party IDP authorization, processing query parameters
    useEffect(() => {
        if (searchParams.code && searchParams.usid) {
            loginIDPUser.mutateAsync({
                code: searchParams.code,
                usid: searchParams.usid,
                redirectURI: redirectURI
            })
        }
    }, [])

    // If customer is registered, push to secure account page
    useEffect(() => {
        if (customer?.isRegistered) {
            clearSessionJSONItem('returnToPage')
            if (locatedFrom) {
                navigate(locatedFrom)
            } else {
                navigate('/account')
            }
        }
    }, [customer?.isRegistered])

    return (
        <Box data-testid="login-redirect-page" bg="gray.50" py={[8, 16]}>
            <Container
                paddingTop={16}
                width={['100%', '407px']}
                bg="white"
                paddingBottom={14}
                marginTop={8}
                marginBottom={8}
                borderRadius="base"
            >
                <Stack justify="center" align="center" spacing={8} marginBottom={8}>
                    <Spinner opacity={0.85} color="blue.600" animationDuration="0.8s" size="lg" />
                    <Text align="center" fontSize="xl" fontWeight="semibold">
                        <FormattedMessage
                            id="social_login_redirect.message.authenticating"
                            defaultMessage="Authenticating..."
                        />
                    </Text>
                    <Text align="center" fontSize="m">
                        <FormattedMessage
                            id="social_login_redirect.message.redirect_link"
                            defaultMessage="If you are not automatically redirected, click <link>this link</link> to proceed."
                            values={{
                                link: (chunks) => (
                                    <a
                                        href="/account"
                                        style={{color: '#0176D3', textDecoration: 'underline'}}
                                    >
                                        {chunks}
                                    </a>
                                )
                            }}
                        />
                    </Text>
                </Stack>
            </Container>
        </Box>
    )
}

SocialLoginRedirect.getTemplateName = () => 'social-login-redirect'

export default SocialLoginRedirect
