/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import StoreHeading from '../theme/components/project/store-heading'
import metaData from '../../extension-meta.json'
import {extendTheme} from '@chakra-ui/react'

const colors = {
    transparent: 'transparent',
    current: 'currentColor',
    black: '#000000',
    white: '#FFFFFF',

    red: {
        400: '#b124e1',
        500: '#FE5C4C'
    },

    blue: {
        50: '#EEF4FF',
        100: '#D8E6FE',
        200: '#00ebff',
        300: '#78B0FD',
        400: '#1bde3c',
        500: '#ffe11b',
        600: '#0a0c60',
        700: '#0B5CAB',
        800: '#014486',
        900: '#032D60'
    }
}
const components = {
    [`${metaData.name}/StoreHeading`]: StoreHeading
}

export default extendTheme({
    colors,
    components
})
