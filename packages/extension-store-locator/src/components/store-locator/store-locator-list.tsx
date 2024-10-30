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
    Box
} from '@chakra-ui/react'
import {StoreLocatorListItem} from './store-locator-list-item'
import {Stores, Store} from '../../types/store'

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
            {storesInfo?.map((store: Store, index: number) => (
                <StoreLocatorListItem key={index} store={store} />
            ))}
        </Accordion>
    )
}
