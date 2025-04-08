/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {
    Box,
    Button,
    Image,
    Text,
    VStack,
    HStack,
    IconButton,
    RadioGroup,
    useStyleConfig
} from '@chakra-ui/react'
import StarIcon from 'overridable!./star-icon'
import {useState} from 'react'

type ProductDetailProps = {
    variant?: string
}
  
const ProductDetail: React.FC<ProductDetailProps> = ({variant}) => {
    const styles = useStyleConfig('ProductDetail', {variant})
    const [size, setSize] = useState('40')
    const [quantity, setQuantity] = useState(1)

    const {orderMap = {}} = styles

    return (
        <Box sx={styles.container}>
            <HStack spacing={8} sx={styles.layout}>
                <Image src="https://media.istockphoto.com/id/1359180038/photo/wristwatch.jpg?s=2048x2048&w=is&k=20&c=-z2ouAL6uyFVy9Qm4puO5MWTo8_eI3KiIcxTaFRsQnc=" alt="Watch" __css={styles.image} />
                <VStack align="start" spacing={4} sx={styles.details}>
                    <HStack sx={styles.reviews} order={orderMap.reviews}>
                        {[...Array(4)].map((_, i) => (
                            <StarIcon key={i} sx={styles.star} />
                        ))}
                        <StarIcon sx={styles.inactiveStar} />
                        <Text sx={styles.reviewText}>(12 Reviews)</Text>
                    </HStack>
                    <Text sx={styles.title} order={orderMap.title}>Classic Black</Text>
                    <Text sx={styles.price} order={orderMap.price}>£229.00</Text>
                    <Text sx={styles.description} fontStyle={'italic'} order={orderMap.description}>
                        With a sleek design and a captivating essence, this is a modern Classic made
                        for every occasion.
                    </Text>

                    <Text sx={styles.label} order={orderMap.colorOptions}>Color:</Text>
                    <RadioGroup defaultValue="black" order={orderMap.colorOptions}>
                        <HStack sx={styles.colorOptions}>
                            <Box sx={styles.colorBlack} />
                            <Box sx={styles.colorGrayDark} />
                            <Box sx={styles.colorGrayLight} />
                        </HStack>
                    </RadioGroup>

                    <Text sx={styles.label} order={orderMap.sizeOptions}>Size:</Text>
                    <HStack sx={styles.sizeOptions} order={orderMap.sizeOptions}>
                        {['32', '36', '40'].map((s) => (
                            <Button
                                key={s}
                                onClick={() => setSize(s)}
                            >
                                {s}
                            </Button>
                        ))}
                    </HStack>

                    <HStack sx={styles.quantityControl} order={orderMap.quantityControl}>
                        <IconButton
                            aria-label="Decrease"
                            icon={<Text>-</Text>}
                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        />
                        <Text>{quantity}</Text>
                        <IconButton
                            aria-label="Increase"
                            icon={<Text>+</Text>}
                            onClick={() => setQuantity(quantity + 1)}
                        />
                    </HStack>

                    <HStack sx={styles.actionButtons} order={orderMap.actionButtons} >
                        <Button>♡ Favorite</Button>
                        <Button>Add to cart</Button>
                    </HStack>
                </VStack>
            </HStack>
        </Box>
    )
}

export {ProductDetail}
