/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {createMultiStyleConfigHelpers} from '@chakra-ui/react'
const {defineMultiStyleConfig} = createMultiStyleConfigHelpers(['heading', 'badge'])

export default defineMultiStyleConfig({
    baseStyle: {
        heading: {
            fontSize: '14px',
            mb: 6,
            backgroundColor: 'orange',
            color: 'blue',
            padding: 4
        },
        badge: {
            bg: 'pink.100',
            ml: 1
        }
    },
    variants: {
        'dark-mode': {
            heading: {backgroundColor: 'black'}
        }
    }
})
