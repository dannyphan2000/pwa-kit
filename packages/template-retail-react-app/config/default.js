/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const sites = require('./sites.js')

module.exports = {
    app: {
        url: {
            site: 'path',
            locale: 'path',
            showDefaults: true,
            interpretPlusSignAsSpace: false
        },
        login: {
            passwordless: {
                enabled: true,
                callbackURI: 'https://webhook.site/970b4840-1608-4a48-977f-ab1a6047e699'
            },
            social: {
                enabled: false,
                idps: ['google', 'apple'],
                redirectURI: '/social-callback'
            },
            resetPassword: {
                callbackURI: 'https://webhook.site/970b4840-1608-4a48-977f-ab1a6047e699'
            }
        },
        defaultSite: 'RefArchGlobal',
        siteAliases: {
            RefArch: 'us',
            RefArchGlobal: 'global'
        },
        sites,
        commerceAPI: {
            proxyPath: `/mobify/proxy/api`,
            parameters: {
                clientId: '58f1b970-50be-4ec4-8124-25a1ed943b8b',
                organizationId: 'f_ecom_bgvn_stg',
                shortCode: 'sandbox-001',
                siteId: 'RefArchGlobal'
            }
        },
        einsteinAPI: {
            host: 'https://api.cquotient.com',
            einsteinId: '1ea06c6e-c936-4324-bcf0-fada93f83bb1',
            // This differs from the siteId in commerceAPIConfig for testing purposes
            siteId: 'aaij-MobileFirst',
            isProduction: false
        }
    },
    externals: [],
    pageNotFoundURL: '/page-not-found',
    ssrEnabled: true,
    ssrOnly: ['ssr.js', 'ssr.js.map', 'node_modules/**/*.*'],
    ssrShared: [
        'static/ico/favicon.ico',
        'static/robots.txt',
        '**/*.js',
        '**/*.js.map',
        '**/*.json'
    ],
    ssrParameters: {
        ssrFunctionNodeVersion: '20.x',
        proxyConfigs: [
            {
                host: 'sandbox-001.api.commercecloud.salesforce.com',
                path: 'api'
            },
            {
                host: 'zzrf-001.dx.commercecloud.salesforce.com',
                path: 'ocapi'
            }
        ]
    }
}
