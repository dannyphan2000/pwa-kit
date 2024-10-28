/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    ApplicationExtensionConfig as _ServerExtensionConfig
} from '@salesforce/pwa-kit-runtime/ssr/server/extensibility'

import {
    ApplicationExtensionConfig as _ReactExtensionConfig
} from '@salesforce/pwa-kit-react-sdk/ssr/universal/extensibility'

// This is where you are going to define the configuration type for your App Extension. This is used in the constructor
// of the extension itself. Update this config type to your specific needs!

// TODO: Rather than 2 duplicate types, how can we have a single config type here?
export interface StoreLocatorConfig {
    enabled: boolean
    path: string
    defaultDistance: number
    defaultDistanceUnit: string
    defaultPageSize: number
    defaultCountry: string
    defaultCountryCode: string
    supportedCountries: Array<{
        countryCode: string
        countryName: string
    }>
}

export interface ServerExtensionConfig extends _ServerExtensionConfig {
    enabled?: boolean
    path?: string
    defaultDistance?: number
    defaultDistanceUnit?: string
    defaultPageSize?: number
    defaultCountry?: string
    defaultCountryCode?: string
    supportedCountries?: Array<{
        countryCode: string
        countryName: string
    }>
}

export interface ReactExtensionConfig extends _ReactExtensionConfig {
    enabled?: boolean
    path?: string
    defaultDistance?: number
    defaultDistanceUnit?: string
    defaultPageSize?: number
    defaultCountry?: string
    defaultCountryCode?: string
    supportedCountries?: Array<{
        countryCode: string
        countryName: string
    }>
}
