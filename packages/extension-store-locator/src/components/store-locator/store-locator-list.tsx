/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {useStoreLocator} from './use-store-locator'
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionIcon,
    AccordionPanel,
    Box
} from '@chakra-ui/react'
import {useSearchStores} from '@salesforce/commerce-sdk-react'

type Stores = NonNullable<ReturnType<typeof useSearchStores>['data']>['data']

interface StoreLocatorListProps {
    storesInfo?: Stores
}

export const StoreLocatorList: React.FC<StoreLocatorListProps> = ({storesInfo}) => {
    const {searchStoresParams, config} = useStoreLocator()

    const displayStoreLocatorStatusMessage = (): string => {
        if (storesInfo === undefined) return 'Loading locations...'
        if (storesInfo.length === 0) return 'Sorry, there are no locations in this area'
        if (searchStoresParams.postalCode !== undefined)
            return `Viewing stores within ${String(config.defaultDistance)}${String(
                String(config.defaultDistanceUnit)
            )} of ${String(searchStoresParams.postalCode)} in 
                ${
                    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
                    config.supportedCountries.length !== 0
                        ? config.supportedCountries.find(
                              (o: {countryCode: string}) =>
                                  o.countryCode === searchStoresParams.countryCode
                          )?.countryName || config.defaultCountry
                        : config.defaultCountry
                }`
        return 'Viewing stores near your location'
    }

    return (
        <Accordion allowMultiple flex={[1, 1, 1, 5]}>
            <AccordionItem>
                <Box
                    flex="1"
                    fontWeight="semibold"
                    fontSize="md"
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '20px'
                    }}
                >
                    {displayStoreLocatorStatusMessage()}
                </Box>
            </AccordionItem>
            {storesInfo?.map((store, index) => (
                <AccordionItem key={index}>
                    <Box margin="10px">
                        {store.name && <Box fontSize="lg">{store.name}</Box>}
                        <Box fontSize="md" color="gray.600">
                            {store.address1}
                        </Box>
                        <Box fontSize="md" color="gray.600">
                            {store.city}, {store.stateCode ? store.stateCode : ''}{' '}
                            {store.postalCode}
                        </Box>
                        {store.distance !== undefined && (
                            <>
                                <br />
                                <Box fontSize="md" color="gray.600">
                                    {store.distance} {store.distanceUnit}
                                    {' away'}
                                </Box>
                            </>
                        )}
                        {store.phone && (
                            <>
                                <br />
                                <Box fontSize="md" color="gray.600">
                                    {'Phone: '}
                                    {store.phone}
                                </Box>
                            </>
                        )}
                        {store.storeHours && (
                            <>
                                <AccordionButton color="blue.700" style={{marginTop: '10px'}}>
                                    <Box fontSize="lg">View More</Box>
                                    <AccordionIcon />
                                </AccordionButton>
                                <AccordionPanel mb={6} mt={4}>
                                    <div
                                        dangerouslySetInnerHTML={{
                                            __html: store.storeHours
                                        }}
                                    />
                                </AccordionPanel>
                            </>
                        )}
                    </Box>
                </AccordionItem>
            ))}
        </Accordion>
    )
}
