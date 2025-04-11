/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Box, Fade, FormattedMessage, Link, Text} from '@chakra-ui/react'
import BaseInventoryMessage from '@salesforce/extension-chakra-storefront/components/inventory-message'
import {useContext} from 'react'
import {StoreSelectionContext} from '../../../../../components/provider'

const InventoryMessage = ({
    product,
    showInventoryMessage,
    customInventoryMessage,
    inventoryMessage
}) => {
    const {selectedStore} = useContext(StoreSelectionContext)
    console.log('selectedStore', selectedStore)
    const inStock =
        selectedStore &&
        selectedStore.inventoryId &&
        Boolean(
            product.inventories?.find(
                (inventory) => inventory.id === selectedStore.inventoryId && inventory.orderable
            )
        )

    console.log('product.inventories', product.inventories)
    console.log('inStock', inStock)
    console.log('chakra-store-locator InventoryMessage')
    return (
        <>
            <Box gap={1} fontWeight={400} display="flex">
                {selectedStore ? (
                    <>
                        {inStock ? <Text>{'In Stock at'}</Text> : <Text>{'Out of Stock at'}</Text>}

                        <Link>{selectedStore.name}</Link>
                    </>
                ) : (
                    <>
                        <Text>{'In Stock at'}</Text>
                        <Link>
                            <Text>{'Select Store'}</Text>
                        </Link>
                    </>
                )}
            </Box>
            <BaseInventoryMessage
                product={product}
                showInventoryMessage={showInventoryMessage}
                inventoryMessage={inventoryMessage}
                customInventoryMessage={customInventoryMessage}
            />
        </>
    )
}

InventoryMessage.propTypes = {
    product: PropTypes.object,
    showInventoryMessage: PropTypes.bool,
    customInventoryMessage: PropTypes.string,
    inventoryMessage: PropTypes.string
}

export default InventoryMessage
