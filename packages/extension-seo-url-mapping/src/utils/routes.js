/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'

// TODO: should we create a useShopperSeo hook in commerce-sdk-react
export const getUrlMapping = async (urlSegment, commerceApiConfig) => {
    let mapping

    // DEVELOPER NOTES: Replace with actual getUrlMapping call
    if (urlSegment === '/seo-category') {
        // Mock a response that returns a resourceType category
        mapping = {
            copySourceParams: false,
            destinationUrl: '/s/RefArch/search?lang=en_US&cgid=newarrivals',
            resourceId: 'newarrivals',
            resourceType: 'category',
            statusCode: '301'
        }
    } else if (urlSegment === '/seo-product') {
        // Mock a response that returns a resourceType product
        mapping = {
            copySourceParams: false,
            destinationUrl:
                '/s/RefArchGlobal/en_GB/platinum-blue-stripes-easy-care-fitted-shirt-/008884303989M.html?cgid=mens',
            productCategoryId: 'mens',
            resourceId: '008884303989M',
            resourceType: 'product',
            statusCode: '301'
        }
    } else if (urlSegment === '/seo-redirect') {
        mapping = {
            copySourceParams: false,
            destinationUrl: '/category/top-sellers',
            statusCode: '301'
        }
    } else if (urlSegment === '/seo-content') {
        mapping = {
            copySourceParams: false,
            destinationUrl:
                '/s/RefArchGlobal/en_GB/content%20asset%20page%20includes/404-banner.html',
            resourceId: '404-banner',
            resourceType: 'content_asset',
            statusCode: '301'
        }
    } else {
        return
    }

    return mapping
}
