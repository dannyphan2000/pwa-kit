/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {SimpleGrid, Button, Center} from '@chakra-ui/react'

const SizeRefinements = ({filter, toggleFilter, selectedFilters}) => {
    return (
        <SimpleGrid columns={4} spacing={2}>
            {filter.values
                ?.filter((refinementValue) => refinementValue.hitCount)
                .map((value, idx) => {
                    const isSelected = selectedFilters.includes(value.value)

                    return (
                        <Button
                            key={idx}
                            variant={isSelected ? 'solid' : 'outline'}
                            colorScheme={isSelected ? 'blue' : 'gray'}
                            size="sm"
                            onClick={() => toggleFilter(value, filter.attributeId, isSelected)}
                            aria-label={`Size ${value.label}`}
                        >
                            {value.label}
                        </Button>
                    )
                })}
        </SimpleGrid>
    )
}

SizeRefinements.propTypes = {
    filter: PropTypes.object.isRequired,
    toggleFilter: PropTypes.func.isRequired,
    selectedFilters: PropTypes.array
}

export default SizeRefinements
