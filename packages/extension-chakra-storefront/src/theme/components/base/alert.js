/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {defineRecipe} from '@chakra-ui/react/'
import {alertAnatomy} from '@chakra-ui/react/dist/esm/anatomy'
console.log('alertAnatomy', alertAnatomy.keys())

export default defineRecipe({
    slots: alertAnatomy.keys(),
    variants: {
        variant: {
            subtle: {
                root: {
                    borderColor: 'colorPalette.600',
                    borderWidth: 1,
                    borderStyle: 'solid'
                }
            }
        }
    }
})
