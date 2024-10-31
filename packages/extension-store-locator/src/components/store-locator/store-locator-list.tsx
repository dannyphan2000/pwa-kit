/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {
    Accordion,
    AccordionItem,
    Box
} from '@chakra-ui/react'
import {StoreLocatorListItem} from './store-locator-list-item'
import {useStoreLocator} from './v2-use-store-locator'
import {Stores, Store} from '../../types/store'

interface StoreLocatorListProps {
    storesInfo?: Stores
}

export const StoreLocatorList: React.FC<StoreLocatorListProps> = () => {
    const {data, isLoading, config, formValues, mode} = useStoreLocator()

    const displayStoreLocatorStatusMessage = (): string => {
        if (isLoading) return 'Loading locations...'
        if (data?.total === 0) return 'Sorry, there are no locations in this area'

        if (mode === 'input') {
            return `Viewing stores within ${String(config.defaultDistance)}${String(
                String(config.defaultDistanceUnit)
            )} of ${String(data?.data[0].postalCode)} in 
                ${
                    config.supportedCountries.length !== 0
                        ? config.supportedCountries.find(
                              (o: {countryCode: string}) =>
                                  o.countryCode === formValues.countryCode
                          )?.countryName || config.defaultCountry
                        : config.defaultCountry
                }`
        }

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
            {data?.data?.map((store: Store, index: number) => (
                <StoreLocatorListItem key={index} store={store} />
            ))}
        </Accordion>
    )
}
