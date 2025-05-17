/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export default {
    parts: ['container', 'heading', 'item', 'loading', 'error'],
    baseStyle: {
        container: {
            bg: 'white',
            boxShadow: 'base',
            borderColor: 'gray.200',
            maxWidth: '600px',
            mx: 'auto',
            my: 4
        },
        heading: {
            color: 'blue.700',
            fontSize: '18px',
            fontWeight: 'semibold'
        },
        item: {
            _hover: {
                bg: 'gray.50'
            }
        },
        loading: {
            color: 'gray.600'
        },
        error: {
            maxWidth: '600px',
            mx: 'auto',
            my: 4
        }
    }
}
