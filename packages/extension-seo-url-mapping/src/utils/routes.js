/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Redirect} from 'react-router-dom'

/**
 * Transforms a URL mapping from the Shopper Search getUrlMapping API to a routes config.
 * https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-seo?meta=getUrlMapping
 *
 * @param {Object} urlMapping - The URL mapping object returned from the Shopper SEO getURLMapping API.
 * @param {Object} component - The component to be rendered for the route.
 */
export const transformUrlMappingToRoute = (path, urlMapping, component) => {
    let Component, props

    // Resource type is not defined for redirects with a URL destination
    const isRedirect = !urlMapping.resourceType

    if (isRedirect) {
        Component = Redirect
        props = {
            to: urlMapping.destinationUrl
        }
    } else {
        // TODO: support "content_asset" resource types
        Component = component
        props = {
            [`${urlMapping.resourceType}Id`]: urlMapping.resourceId
        }
    }

    return {
        path: path,
        // DEVELOPER NOTE: Here we would want to use a Loadable component as to not bloat the home page chunk size.
        component: Component,
        // component: () => {
        //     const WrapperComponent = (props) => <Component {...props} />
        //     console.log('JINSUUU', Component.displayName)
        //     WrapperComponent.displayName = Component.displayName
        //     return WrapperComponent
        // },
        props
    }
}

// TODO: replace with useUrlMapping hook in commerce-sdk-react
export const getUrlMapping = async (urlSegment) => {
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
