/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {
    Accordion,
    Box,
    Stack
} from '@chakra-ui/react'
import {useIntl} from 'react-intl'

const InformationAccordion = ({product}) => {
    const {formatMessage} = useIntl()

    return (
        <Stack direction="row" spacing={[0, 0, 0, 16]}>
            <Accordion.Root allowMultiple maxWidth={'896px'} flex={[1, 1, 1, 5]}>
                {/* Details */}
                <Accordion.Item>
                    <h2>
                        <Accordion.ItemTrigger height="64px">
                            <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                {formatMessage({
                                    defaultMessage: 'Product Detail',
                                    id: 'product_detail.accordion.button.product_detail'
                                })}
                            </Box>
                            {/* <AccordionIcon /> */}
                        </Accordion.ItemTrigger>
                    </h2>
                    <Accordion.ItemContent mb={6} mt={4}>
                        <div
                            dangerouslySetInnerHTML={{
                                __html: product?.longDescription
                            }}
                        />
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Size & Fit */}
                <Accordion.Item>
                    <h2>
                        <Accordion.ItemTrigger height="64px">
                            <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                {formatMessage({
                                    defaultMessage: 'Size & Fit',
                                    id: 'product_detail.accordion.button.size_fit'
                                })}
                            </Box>
                            {/* <AccordionIcon /> */}
                        </Accordion.ItemTrigger>
                    </h2>
                    <Accordion.ItemContent mb={6} mt={4}>
                        {formatMessage({
                            defaultMessage: 'Coming Soon',
                            id: 'product_detail.accordion.message.coming_soon'
                        })}
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Reviews */}
                <Accordion.Item>
                    <h2>
                        <Accordion.ItemTrigger height="64px">
                            <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                {formatMessage({
                                    defaultMessage: 'Reviews',
                                    id: 'product_detail.accordion.button.reviews'
                                })}
                            </Box>
                            {/* <AccordionIcon /> */}
                        </Accordion.ItemTrigger>
                    </h2>
                    <Accordion.ItemContent mb={6} mt={4}>
                        {formatMessage({
                            defaultMessage: 'Coming Soon',
                            id: 'product_detail.accordion.message.coming_soon'
                        })}
                    </Accordion.ItemContent>
                </Accordion.Item>

                {/* Questions */}
                <Accordion.Item>
                    <h2>
                        <Accordion.ItemTrigger height="64px">
                            <Box flex="1" textAlign="left" fontWeight="bold" fontSize="lg">
                                {formatMessage({
                                    defaultMessage: 'Questions',
                                    id: 'product_detail.accordion.button.questions'
                                })}
                            </Box>
                            {/* <AccordionIcon /> */}
                        </Accordion.ItemTrigger>
                    </h2>
                    <Accordion.ItemContent mb={6} mt={4}>
                        {formatMessage({
                            defaultMessage: 'Coming Soon',
                            id: 'product_detail.accordion.message.coming_soon'
                        })}
                    </Accordion.ItemContent>
                </Accordion.Item>
            </Accordion.Root>
            <Box display={['none', 'none', 'none', 'block']} flex={4}></Box>
        </Stack>
    )
}

InformationAccordion.propTypes = {
    product: PropTypes.object
}

export default InformationAccordion
