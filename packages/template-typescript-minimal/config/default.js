/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

module.exports = {
    app: {
      extensions: [
        ["@salesforce/extension-chakra-storefront", {
          enabled: true,
          url: {
              site: "none",
              locale: "none"
          }}],
        ["@salesforce/extension-seo-url-mapping", {
            enabled: true,
            resourceTypeToComponentMap: {
              category: 'ProductList',
              product: 'ProductDetail',
              // TODO: what component should content be mapped to?
              content_asset: 'ProductList'
            }
        }]
      ]
    },
    ssrEnabled: true,
    ssrOnly: [
      "ssr.js",
      "ssr.js.map",
      "node_modules/**/*.*"
    ],
    ssrShared: [
      "static/favicon.ico",
      "static/robots.txt",
      "**/*.js",
      "**/*.js.map",
      "**/*.json"
    ],
    ssrParameters: {
      ssrFunctionNodeVersion: "20.x",
      proxyConfigs: [
        {
          host: "kv7kzm78.api.commercecloud.salesforce.com",
          path: "api"
        },
        {
          host: "zzrf-001.dx.commercecloud.salesforce.com",
          path: "ocapi"
        }
      ]
    }
}