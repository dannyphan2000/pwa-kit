/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'

// Local
import {createUrlTemplate} from '../../utils/url'
import {MultiSiteProvider} from '../../contexts'
import {resolveSiteFromUrl, resolveLocaleFromUrl} from '../../utils/site-utils'

// Define a type for the HOC props
// TODO: update the type to have site, locale, and buildUrl
type WithMultiSiteProps = React.ComponentPropsWithoutRef<any>

// Define the HOC function
const withMultiSite = <P extends object>(WrappedComponent: React.ComponentType<P>) => {
    const WithMultiSite: React.FC<P> = (props: WithMultiSiteProps) => {
        
        const path = '/'
        const appConfig = {
            url: {
                site: "path",
                locale: "path",
                showDefaults: true,
                interpretPlusSignAsSpace: false
              }
        }
        // const site = resolveSiteFromUrl(path)
        const site = {
            "id": "RefArch",
            "l10n": {
                "supportedCurrencies": ["USD"],
                "defaultCurrency": "USD",
                "defaultLocale": "en-US",
                "supportedLocales": [
                    {
                        "id": "en-US",
                        "preferredCurrency": "USD"
                    },
                    {
                        "id": "en-CA",
                        "preferredCurrency": "USD"
                    }
                ]
            },
            alias: 'us'
        }
        // const locale = resolveLocaleFromUrl(path)
        const locale = {
            "id": "en-US",
            "preferredCurrency": "USD"
        }
        // @ts-ignore
        const buildUrl = createUrlTemplate({
            "url": {
              "site": "path",
              "locale": "path",
              "showDefaults": true,
              "interpretPlusSignAsSpace": false
            },
            "defaultSite": "RefArchGlobal",
            "siteAliases": {
                "RefArch": "us",
                "RefArchGlobal": "global"
            },
            "sites": [
              {
                  "id": "RefArch",
                  "l10n": {
                      "supportedCurrencies": ["USD"],
                      "defaultCurrency": "USD",
                      "defaultLocale": "en-US",
                      "supportedLocales": [
                          {
                              "id": "en-US",
                              "preferredCurrency": "USD"
                          },
                          {
                              "id": "en-CA",
                              "preferredCurrency": "USD"
                          }
                      ]
                  }
              },
              {
                  "id": "RefArchGlobal",
                  "l10n": {
                      "supportedCurrencies": ["GBP", "EUR", "CNY", "JPY"],
                      "defaultCurrency": "GBP",
                      "supportedLocales": [
                          {
                              "id": "de-DE",
                              "preferredCurrency": "EUR"
                          },
                          {
                              "id": "en-GB",
                              "preferredCurrency": "GBP"
                          },
                          {
                              "id": "es-MX",
                              "preferredCurrency": "MXN"
                          },
                          {
                              "id": "fr-FR",
                              "preferredCurrency": "EUR"
                          },
                          {
                              "id": "it-IT",
                              "preferredCurrency": "EUR"
                          },
                          {
                              "id": "ja-JP",
                              "preferredCurrency": "JPY"
                          },
                          {
                              "id": "ko-KR",
                              "preferredCurrency": "KRW"
                          },
                          {
                              "id": "pt-BR",
                              "preferredCurrency": "BRL"
                          },
                          {
                              "id": "zh-CN",
                              "preferredCurrency": "CNY"
                          },
                          {
                              "id": "zh-TW",
                              "preferredCurrency": "TWD"
                          }
                      ],
                      "defaultLocale": "en-GB"
                  }
              }
            ],
            "commerceAPI": {
              "proxyPath": "/mobify/proxy/api",
              "parameters": {
                  "clientId": "c9c45bfd-0ed3-4aa2-9971-40f88962b836",
                  "organizationId": "f_ecom_zzrf_001",
                  "shortCode": "8o7m175y",
                  "siteId": "RefArchGlobal"
              }
            },
            "einsteinAPI": {
              "host": "https://api.cquotient.com",
              "einsteinId": "1ea06c6e-c936-4324-bcf0-fada93f83bb1",
              "siteId": "aaij-MobileFirst",
              "isProduction": false
            },
            "enabled": true
          }, site.alias || site.id, locale.id)
        
        return (
            <MultiSiteProvider 
                site={site} 
                locale={locale}
                buildUrl={buildUrl}
            >
                <WrappedComponent {...(props as P)} />
            </MultiSiteProvider>
        )
    }

    return WithMultiSite
}

export default withMultiSite
