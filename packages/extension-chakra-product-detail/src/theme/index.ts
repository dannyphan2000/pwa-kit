/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const theme = {
    components: {
        ProductDetail: {
            baseStyle: {
                container: {
                    border: '1px solid black',
                    maxW: 'container.lg',
                    mx: 'auto',
                    p: 6,
                    bg: 'white',
                    borderRadius: 'lg',
                    boxShadow: 'md'
                },
                layout: {
                    align: 'center',
                    flexDir: {base: 'column', md: 'row'}
                },
                image: {
                    boxSize: '300px',
                    objectFit: 'cover'
                },
                details: {
                    align: 'start',
                    spacing: 4,
                    w: '100%'
                },
                reviews: {
                    align: 'center',
                    spacing: 1
                },
                star: {
                    color: 'yellow.400'
                },
                inactiveStar: {
                    color: 'gray.300'
                },
                reviewText: {
                    fontSize: 'sm',
                    color: 'gray.500'
                },
                title: {
                    fontSize: '2xl',
                    fontWeight: 'bold'
                },
                price: {
                    fontSize: 'xl',
                    fontWeight: 'semibold',
                    color: 'blue.500'
                },
                description: {
                    fontSize: 'md',
                    color: 'gray.600'
                },
                label: {
                    fontWeight: 'bold',
                    fontSize: 'sm'
                },
                colorOptions: {
                    spacing: 2
                },
                colorBlack: {
                    w: '30px',
                    h: '30px',
                    bg: 'black',
                    borderRadius: 'full',
                    border: '2px solid gray.400',
                    cursor: 'pointer'
                },
                colorGrayDark: {
                    w: '30px',
                    h: '30px',
                    bg: 'gray.700',
                    borderRadius: 'full',
                    border: '2px solid gray.400',
                    cursor: 'pointer'
                },
                colorGrayLight: {
                    w: '30px',
                    h: '30px',
                    bg: 'gray.300',
                    borderRadius: 'full',
                    border: '2px solid gray.400',
                    cursor: 'pointer'
                },
                sizeOptions: {
                    spacing: 2
                },
                sizeButton: {
                    bg: 'gray.100',
                    _hover: {bg: 'gray.200'},
                    _focus: {bg: 'gray.300'}
                },
                selectedSize: {
                    bg: 'blue.500',
                    color: 'white',
                    _hover: {bg: 'blue.600'},
                    _focus: {bg: 'blue.700'}
                },
                quantityControl: {
                    align: 'center',
                    spacing: 4
                },
                actionButtons: {
                    spacing: 4
                },
                favoriteButton: {
                    border: '1px solid gray.400',
                    bg: 'white',
                    _hover: {bg: 'gray.100'}
                },
                orderMap: {
                    reviews: 0,
                    title: 1,
                    price: 2,
                    description: 3,
                    colorOptions: 4,
                    sizeOptions: 5,
                    quantityControl: 6,
                    actionButtons: 7
                }
            }
        }
    }
}

export {theme}
