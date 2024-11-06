/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import type {ApplicationExtensionConfig} from '@salesforce/pwa-kit-extension-sdk/types'

// Represents a locale with its ID and preferred currency.
type Locale = {
    id: string
    preferredCurrency: string
}

// Defines localization settings for a site, including currencies and supported locales.
type Localization = {
    supportedCurrencies: string[]
    defaultCurrency: string
    defaultLocale: string
    supportedLocales: Locale[]
}

// Represents a site configuration, including its localization details.
type Site = {
    id: string
    l10n: Localization
}

// Configuration settings for connecting to the Commerce API.
type CommerceAPIConfig = {
    proxyPath: string
    parameters: {
        clientId: string
        organizationId: string
        shortCode: string
        siteId: string
    }
}

// Configuration settings for connecting to the Einstein API.
type EinsteinAPI = {
    host: string
    einsteinId: string
    siteId: string
    isProduction: boolean
}

// Indicates where a value should be placed in the URL.
type UrlPlacement = 'path' | 'query_string' | 'none'

// Main configuration type, extending ApplicationExtensionConfig for additional settings.
export interface Config extends ApplicationExtensionConfig {
    urlConfig: {
        site: UrlPlacement
        locale: UrlPlacement
        showDefaults: boolean
        interpretPlusSignAsSpace: boolean
    }
    defaultSite: Site['id']
    siteAliases: Record<Site['id'], string>
    sites: Site[]
    commerceAPI: CommerceAPIConfig
    einsteinAPI: EinsteinAPI
    enabled: boolean
}
