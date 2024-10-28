/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
// import {Heading, Box, Button} from '@chakra-ui/react'
import {Heading} from '@chakra-ui/react/dist/cjs/typography/heading.cjs'
import {Box} from '@chakra-ui/react/dist/cjs/box/box.cjs'
import {Button} from '@chakra-ui/react/dist/cjs/button/button.cjs'
import {useSearchStores} from '@salesforce/commerce-sdk-react'
import {StoreLocatorList} from '*/components/store-locator/store-locator-list'
import {StoreLocatorInput} from '*/components/store-locator/store-locator-input'
import {useStoreLocator} from '*/components/store-locator/use-store-locator'

//This is an API limit and is therefore not configurable
const NUM_STORES_PER_REQUEST_API_MAX = 200

export const StoreLocatorContent = () => {
    const {
        searchStoresParams,
        config
    } = useStoreLocator()
    const {countryCode, postalCode, latitude, longitude, limit} = searchStoresParams
    

    const [numStoresToShow, setNumStoresToShow] = useState(limit)
    // Either the countryCode & postalCode or latitude & longitude are defined, never both
    const {
        data: searchStoresData,
        isLoading,
        refetch,
        isFetching
    } = useSearchStores({
        parameters: {
            countryCode: countryCode,
            postalCode: postalCode,
            latitude: latitude,
            longitude: longitude,
            locale: 'en-GB',
            maxDistance: config.defaultDistance,
            limit: NUM_STORES_PER_REQUEST_API_MAX,
            distanceUnit: config.defaultDistanceUnit
        }
    })

    const storesInfo =
        isLoading || isFetching
            ? undefined
            : searchStoresData?.data?.slice(0, numStoresToShow) || []
    const numStores = searchStoresData?.total || 0

    return (
        <>
            <Heading fontSize="2xl" style={{marginBottom: '25px'}}>
                Find a Store
            </Heading>
            <StoreLocatorInput refetch={refetch} />
            <StoreLocatorList storesInfo={storesInfo} />
            {!isFetching &&
            numStoresToShow < numStores &&
            numStoresToShow < NUM_STORES_PER_REQUEST_API_MAX ? (
                <Box paddingTop="10px" marginTop="10px">
                    <Button
                        key="load-more-button"
                        onClick={() => {
                            setNumStoresToShow(
                                numStoresToShow + config.defaultPageSize <=
                                    NUM_STORES_PER_REQUEST_API_MAX
                                    ? numStoresToShow + config.defaultPageSize
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
            ) : (
                ''
            )}
        </>
    )
}

StoreLocatorContent.propTypes = {}
