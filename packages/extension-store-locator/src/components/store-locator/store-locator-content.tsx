/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState} from 'react'
import {Box, Button, Heading} from '@chakra-ui/react'
import {useSearchStores} from '@salesforce/commerce-sdk-react'
import {StoreLocatorList} from '*/components/store-locator/store-locator-list'
import {StoreLocatorForm} from '*/components/store-locator/store-locator-form'
import {useStoreLocator} from '*/components/store-locator/use-store-locator'

//This is an API limit and is therefore not configurable
const NUM_STORES_PER_REQUEST_API_MAX = 200

export const StoreLocatorContent = (): JSX.Element => {
    const {searchStoresParams, config} = useStoreLocator()
    const {countryCode, postalCode, latitude, longitude, limit} = searchStoresParams

    const [numStoresToShow, setNumStoresToShow] = useState<number>(limit)

    const {
        data: searchStoresData,
        isLoading,
        refetch,
        isFetching
    } = useSearchStores({
        parameters: {
            countryCode,
            postalCode,
            latitude,
            longitude,
            locale: 'en-GB',
            maxDistance: config.defaultDistance,
            limit: NUM_STORES_PER_REQUEST_API_MAX,
            distanceUnit: config.defaultDistanceUnit
        }
    })

    const storesInfo =
        isLoading || isFetching ? undefined : searchStoresData?.data?.slice(0, numStoresToShow)
    const numStores = searchStoresData?.total || 0

    return (
        <>
            <Heading fontSize="2xl" style={{marginBottom: '25px'}}>
                Find a Store
            </Heading>
            <StoreLocatorForm refetch={refetch} />
            <StoreLocatorList storesInfo={storesInfo} />
            {!isFetching &&
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
            ) : null}
        </>
    )
}
