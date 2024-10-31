/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Box, Container} from '@salesforce/retail-react-app/app/components/shared/ui'
import Seo from '@salesforce/retail-react-app/app/components/seo'
import CheckEmail from '@salesforce/retail-react-app/app/components/check-email'

const CheckEmailPage = () => {
    return (
        <Box data-testid="check-email-page" bg="gray.50" py={[8, 16]}>
            <Seo title="Check your email" description="Check your email" />
            <Container
                paddingTop={16}
                width={['100%', '407px']}
                bg="white"
                paddingBottom={14}
                marginTop={8}
                marginBottom={8}
                borderRadius="base"
            >
                <CheckEmail />
            </Container>
        </Box>
    )
}

CheckEmailPage.getTemplateName = () => 'check-email'

CheckEmailPage.propTypes = {}

export default CheckEmailPage
