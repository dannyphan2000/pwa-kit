/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import StoreHeading from '../theme/components/project/store-heading'
import metaData from '../../extension-meta.json'
import {extendTheme} from '@chakra-ui/react'

const components = {
    [`${metaData.name}/StoreHeading`]: StoreHeading
}

export default extendTheme({
    components
})
