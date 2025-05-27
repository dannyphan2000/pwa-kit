/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import {Box, Button, SimpleGrid, Tooltip} from '@chakra-ui/react'

const ColorRefinements = ({filter, toggleFilter, selectedFilters}) => {
    const intl = useIntl()

    return (
        <SimpleGrid columns={6} spacing={2}>
            {filter.values
                ?.filter((refinementValue) => refinementValue.hitCount)
                .map((value, idx) => {
                    const isSelected = selectedFilters.includes(value.value)
                    const color = value.presentationId || value.value

                    return (
                        <Tooltip
                            key={idx}
                            label={intl.formatMessage(
                                {
                                    id: 'colorRefinements.label.hitCount',
                                    defaultMessage: '{colorLabel} ({colorHitCount})'
                                },
                                {
                                    colorLabel: value.label,
                                    colorHitCount: value.hitCount
                                }
                            )}
                        >
                            <Button
                                aria-label={value.label}
                                width="32px"
                                height="32px"
                                minWidth="32px"
                                borderRadius="full"
                                backgroundColor={color}
                                border={isSelected ? '3px solid' : '1px solid'}
                                borderColor={isSelected ? 'blue.500' : 'gray.300'}
                                _hover={{
                                    borderColor: 'blue.400',
                                    transform: 'scale(1.1)'
                                }}
                                onClick={() => toggleFilter(value, filter.attributeId, isSelected)}
                            />
                        </Tooltip>
                    )
                })}
        </SimpleGrid>
    )
}

ColorRefinements.propTypes = {
    filter: PropTypes.object.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.array
}

export default ColorRefinements
