/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import {defineSlotRecipe} from '@chakra-ui/react'

export default defineSlotRecipe({
    slots: ['root', 'icon'],
    base: {
        root: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            whiteSpace: 'nowrap',
            verticalAlign: 'middle',
            lineHeight: '1.2',
            borderRadius: 'md',
            fontWeight: 'semibold',
            transitionProperty: 'common',
            transitionDuration: 'normal',
            _focusVisible: {
                boxShadow: 'outline'
            },
            _disabled: {
                opacity: 0.4,
                cursor: 'not-allowed',
                boxShadow: 'none'
            },
            _hover: {
                _disabled: {
                    bg: 'initial'
                }
            }
        },
        icon: {
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: '1'
        }
    },
    variants: {
        variant: {
            unstyled: {
                root: {
                    bg: 'transparent',
                    color: 'inherit',
                    _hover: {
                        bg: 'transparent'
                    },
                    _active: {
                        bg: 'transparent'
                    }
                }
            },
            ghost: {
                root: {
                    bg: 'transparent',
                    color: 'inherit',
                    _hover: {
                        bg: 'blackAlpha.100'
                    },
                    _active: {
                        bg: 'blackAlpha.200'
                    }
                }
            },
            solid: {
                root: {
                    bg: 'gray.100',
                    color: 'gray.800',
                    _hover: {
                        bg: 'gray.200'
                    },
                    _active: {
                        bg: 'gray.300'
                    }
                }
            },
            outline: {
                root: {
                    border: '1px solid',
                    borderColor: 'inherit',
                    _hover: {
                        bg: 'blackAlpha.50'
                    },
                    _active: {
                        bg: 'blackAlpha.100'
                    }
                }
            },
            nav: {
                root: {
                    bg: 'transparent',
                    color: 'gray.600',
                    _hover: {
                        bg: 'transparent',
                        color: 'gray.800'
                    },
                    _active: {
                        bg: 'transparent',
                        color: 'gray.800'
                    }
                }
            },
            scroller: {
                root: {
                    borderRadius: 'full',
                    bg: 'white/36 !important',
                    _hover: {
                        bg: 'white/48 !important'
                    },
                    width: '12',
                    height: '12'
                },
                icon: {
                    color: 'black',
                    width: '6',
                    height: '6'
                }
            }
        }
    },
    defaultVariants: {
        variant: 'ghost'
    }
})
