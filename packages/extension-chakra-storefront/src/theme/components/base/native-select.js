/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {defineSlotRecipe} from '@chakra-ui/react'

// Note: Chakra v3 no longer has filled variant,
// we re-created it here so it will be used app-wise for native select
export default defineSlotRecipe({
    variants: {
        variant: {
            filled: {
                field: {
                    border: '2px solid',
                    borderColor: 'transparent',
                    background: 'red.200',
                    _hover: {
                        background: 'gray.200'
                    },
                    _readOnly: {
                        boxShadow: 'none !important',
                        userSelect: 'all'
                    },
                    _focusVisible: {
                        background: 'transparent',
                        borderColor: 'blue.500'
                    }
                },
                indicator: {
                    color: 'white'
                }
            }
        }
    },
    defaultVariants: {
        variant: 'filled'
    }
})
