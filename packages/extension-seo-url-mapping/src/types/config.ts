/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type {ApplicationExtensionConfig} from '@salesforce/pwa-kit-extension-sdk/types'

// Defines the map of resource types to component display name.
// https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-seo?meta=getUrlMapping
type ResourceTypeToComponentMap = {
    category: string
    product: string
    content: string
}

/**
 * This defines how your extension can be configured in the user's project. Please update it to your specific needs!
 */
export interface UserConfig extends ApplicationExtensionConfig {
    resourceTypeToComponentMap: ResourceTypeToComponentMap
    commerceApi?: {
        proxyPath: string
        parameters: {
            shortCode: string
            clientId: string
            organizationId: string
            siteId: string
            locale: string
            currency: string
        }
    }
}

/**
 * When instantiating your extension, pwa-kit-extension-sdk will make sure to pass in the "complete" configuration, which has the merged user-defined and default configs.
 */
export type Config = Required<UserConfig>
