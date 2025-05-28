/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {defineSlotRecipe} from '@chakra-ui/react'

export default defineSlotRecipe({
    slots: [
        'container',
        'heroImageGroup',
        'heroImage',
        'heroImageSkeleton',
        'thumbnailImageGroup',
        'thumbnailImageItem',
        'thumbnailImageSkeleton'
    ],

    base: {
        container: {},
        heroImage: {},
        heroImageGroup: {
            mb: 2
        },
        heroImageSkeleton: {
            mb: 2
        },
        thumbnailImageGroup: {
            display: 'flex',
            flexDirection: 'row',
            flexWrap: 'wrap',
            listStyleType: 'none'
        },
        thumbnailImageItem: {
            flexShrink: 0,
            cursor: 'pointer',
            flexBasis: [20, 20, 24],
            borderStyle: 'solid',
            mb: [1, 1, 2, 2],
            mr: [1, 1, 2, 2],
            _focus: {
                boxShadow: 'outline'
            },
            _focusVisible: {
                outline: 0
            }
        },
        thumbnailImageSkeleton: {
            mr: 2,
            w: [20, 20, 24, 24]
        }
    },

    variants: {
        size: {
            sm: {
                heroImageSkeleton: {
                    maxW: ['none', 'none', 'none', '500px']
                },
                heroImage: {
                    maxW: ['none', 'none', 'none', '500px']
                }
            },
            md: {
                heroImageSkeleton: {
                    maxW: ['none', 'none', 'none', '680px']
                },
                heroImage: {
                    // maxW: ['none', 'none', 'none', '680px']
                    maxW: '680px'
                }
            }
        }
    },

    defaultProps: {
        size: 'md'
    }
})
