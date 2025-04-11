/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useMemo} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import {Text, Fade} from '@chakra-ui/react'
import {useDerivedProduct} from '../../hooks'

const InventoryMessage = ({product, showInventoryMessage, customInventoryMessage, inventoryMessage}) => {
    // DEVELOPER NOTES: Attempted to move the related hooks and logic to this component but had issues.
    // However in the actual implementation, we should see to move the logic to this component
    // const intl = useIntl()
    // const {showInventoryMessage, inventoryMessage} = useDerivedProduct(
    //     product,
    //     isProductPartOfSet,
    //     isProductPartOfBundle
    // )
    // const isProductASet = product?.type.set
    // const isProductABundle = product?.type.bundle

    // const {customInventoryMessage} = useMemo(() => {
    //     let currentInventoryMsg = ''
    //     if (
    //         !showInventoryMessage &&
    //         (isProductASet || isProductABundle) &&
    //         childProductOrderability
    //     ) {
    //         // if any of the children are not orderable, it will disable the add to cart button
    //         const unavailableChildProductKey = Object.keys(childProductOrderability).find((key) => {
    //             return childProductOrderability[key].showInventoryMessage
    //         })
    //         if (unavailableChildProductKey) {
    //             const unavailableChildProduct = childProductOrderability[unavailableChildProductKey]
    //             if (unavailableChildProduct.unfulfillable) {
    //                 currentInventoryMsg = intl.formatMessage(
    //                     {
    //                         defaultMessage: 'Only {stockLevel} left for {productName}!',
    //                         id: 'use_product.message.inventory_remaining_for_product'
    //                     },
    //                     {
    //                         stockLevel: unavailableChildProduct.stockLevel,
    //                         productName: unavailableChildProduct.productName
    //                     }
    //                 )
    //             }
    //             if (unavailableChildProduct.isOutOfStock) {
    //                 currentInventoryMsg = intl.formatMessage(
    //                     {
    //                         defaultMessage: 'Out of stock for {productName}',
    //                         id: 'use_product.message.out_of_stock_for_product'
    //                     },
    //                     {productName: unavailableChildProduct.productName}
    //                 )
    //             }
    //         }
    //     }
    //     return {customInventoryMessage: currentInventoryMsg}
    // }, [showInventoryMessage, childProductOrderability])
    console.log('chakra-storefront InventoryMessage')
    return (
        <>
            {showInventoryMessage && !customInventoryMessage && (
                <Fade in={true}>
                    <Text color="orange.600" fontWeight={600} marginBottom={8}>
                        {inventoryMessage}
                    </Text>
                </Fade>
            )}
            {customInventoryMessage && (
                <Fade in={true}>
                    <Text color="orange.600" fontWeight={600} marginBottom={8}>
                        {customInventoryMessage}
                    </Text>
                </Fade>
            )}
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
