/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {RouteProps} from 'react-router-dom'

// Platform Imports
import {ApplicationExtension} from '@salesforce/pwa-kit-extension-sdk/react'

// Local Imports
import {withOptionalChakra} from "*/components/store-locator/with-optional-chakra-provider"
import {withStoreLocator} from "*/components/store-locator/with-store-locator"
import {Config} from './types'

import StoreLocatorPage from './pages/store-locator'


const defaultPath: string = '/sample-page'
class StoreLocatorExtension extends ApplicationExtension<Config> {
    DEFAULT_PATH = "/store-locator";
    REQUIRED_CONFIG_FIELDS = ['defaultCountry', 'defaultCountryCode', 'defaultDistance', 'defaultDistanceUnit', 'defaultPageSize', 'defaultPostalCode', 'supportedCountries']

    extendApp<T>(App: React.ComponentType<T>): React.ComponentType<T> {
        const config = this.getConfig();

        const missingFields = this.REQUIRED_CONFIG_FIELDS.filter(field => !config[field]);
        if (missingFields.length) {
            throw new Error(`Missing required config fields: ${missingFields.join(', ')}`);
        }

        return withStoreLocator({
            path: config.path ?? this.DEFAULT_PATH,
            defaultCountry: config.defaultCountry,
            defaultCountryCode: config.defaultCountryCode,
            defaultDistance: config.defaultDistance,
            defaultDistanceUnit: config.defaultDistanceUnit,
            defaultPageSize: config.defaultPageSize,
            defaultPostalCode: config.defaultPostalCode,
            supportedCountries: config.supportedCountries
            })(withOptionalChakra(App))
    }

    extendRoutes(routes: RouteProps[]): RouteProps[] {
        return [
            {
                exact: true,
                path: this.getConfig().path || defaultPath,
                component: StoreLocatorPage
            },
            ...routes
        ]
    }
}

export default StoreLocatorExtension
