/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
import {Box, Button, Heading} from '@chakra-ui/react'

import {StoreLocatorList} from './store-locator-list'
import {StoreLocatorForm} from './store-locator-form'
import {useStoreLocator} from './use-store-locator'

export const StoreLocatorContent = (): JSX.Element => {
    return (
        <>
            <Heading fontSize="2xl" style={{marginBottom: '25px'}}>
                Find a Store
            </Heading>
            <StoreLocatorForm />
            <StoreLocatorList />
            {/* {!isFetching &&
            numStoresToShow < numStores &&
            numStoresToShow < NUM_STORES_PER_REQUEST_API_MAX ? (
                <Box paddingTop="10px" marginTop="10px">
                    <Button
                        key="load-more-button"
                        onClick={() => {
                            setNumStoresToShow(
                                numStoresToShow + Number(config.defaultPageSize) <=
                                    NUM_STORES_PER_REQUEST_API_MAX
                                    ? numStoresToShow + Number(config.defaultPageSize)
                                    : numStoresToShow
                            )
                        }}
                        width="100%"
                        variant="outline"
                        marginBottom={4}
                    >
                        Load More
                    </Button>
                </Box>
            ) : null} */}
        </>
    )
}
