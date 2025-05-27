/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'

// Components
import {
    Accordion,
    AccordionButton,
    AccordionItem,
    AccordionPanel,
    Box,
    Text
} from '@chakra-ui/react'

// Icons
import {ChevronDownIcon, ChevronRightIcon} from '../icons'

/**
 * A nested accordion component that can display hierarchical data.
 */
const NestedAccordion = ({items = [], ...rest}) => {
    const renderItem = (item, level = 0) => {
        const hasChildren = item.children && item.children.length > 0

        return (
            <AccordionItem key={item.id} border="none">
                {({isExpanded}) => (
                    <>
                        <AccordionButton
                            pl={level * 4}
                            justifyContent="flex-start"
                            _hover={{bg: 'gray.50'}}
                        >
                            {hasChildren && (
                                <>
                                    {isExpanded ? (
                                        <ChevronDownIcon mr={2} />
                                    ) : (
                                        <ChevronRightIcon mr={2} />
                                    )}
                                </>
                            )}
                            <Text flex="1" textAlign="left">
                                {item.name}
                            </Text>
                        </AccordionButton>
                        {hasChildren && (
                            <AccordionPanel p={0}>
                                <Accordion allowToggle>
                                    {item.children.map((child) => renderItem(child, level + 1))}
                                </Accordion>
                            </AccordionPanel>
                        )}
                    </>
                )}
            </AccordionItem>
        )
    }

    return (
        <Box {...rest}>
            <Accordion allowToggle>{items.map((item) => renderItem(item))}</Accordion>
        </Box>
    )
}

NestedAccordion.displayName = 'NestedAccordion'

NestedAccordion.propTypes = {
    /**
     * Array of items to display in the nested accordion
     */
    items: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired,
            children: PropTypes.array
        })
    )
}

export default NestedAccordion
