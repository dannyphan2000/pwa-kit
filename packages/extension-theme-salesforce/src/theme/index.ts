/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

const theme = {
    components: {
        // Base Components
        Button: {
            baseStyle: {
                borderRadius: 'base',
                backgroundColor: 'blue.600',
                color: 'white',
                _hover: {bg: 'blue.700', _disabled: {bg: 'blue.300'}},
                _active: {bg: 'blue.800'},
                _disabled: {bg: 'blue.300'}
            },
            defaultProps: {
                colorScheme: 'blue'
            }
        },
        // Custom Components
        ChakraProductDetailExtension_ProductDetail: {
            baseStyle: {
                container: {
                    border: '1px solid darkgray'
                },
                description: {
                    fontStyle: 'italic'
                },
                price: {
                    fontSize: '4xl',
                    fontWeight: 'bold',
                },
                layout: {
                    align: 'center',
                    flexDir: {base: 'column', md: 'row-reverse'}
                },
                image: {
                    boxSize: '500px',
                    objectFit: 'cover'
                },
                star: {
                    color: 'red.400',
                    transition: 'transform 0.2s',
                    _hover: {
                        transform: 'scale(1.2)'
                    },
                },
                orderMap: {
                    price: 0,
                    title: 1,
                    description: 2,
                    sizeOptions: 3,
                    colorOptions: 4,
                    quantityControl: 5,
                    actionButtons: 6,
                    reviews: 7,
                }
            }
        },
        ChakraProductListExtension_ProductList: {
            baseStyle: {
                container: {
                    border: '1px solid darkgray',
                    flexDir: 'row-reverse'
                },
                productCard: {
                    transition: 'all 0.2s ease-in-out',
                    _hover: {
                        boxShadow: 'lg',
                        transform: 'scale(1.05)'
                    }
                }
            }  
        }
    }
}

export {theme}
