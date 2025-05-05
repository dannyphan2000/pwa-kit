# Commerce Business Manager SEO Extension

A [PWA Kit](https://github.com/SalesforceCommerceCloud/pwa-kit) extension that synchronizes Business Manager-managed routes with your PWA Kit application using the [Shopper SEO URL Mapping API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-seo?meta=getUrlMapping). This extension provides the following capabilities:

- Integrate routes managed in Business Manager with the PWA Kit
- Integration with the SCAPI Shopper SEO URL Mapping API
- Support for multiple resource types including products, categories, and redirects

Note: Using this extension will impact performance as it requires API calls during navigation.

## Installation

```sh
npm install @salesforce/extension-commerce-bm-seo
```

## Configuration

The SEO extension is configured via your config file (e.g. `app/config/default.json`) or the key `mobify.app.extensions` in your `package.json`:

```json
{
  "mobify": {
    "app": {
      "extensions": [
        [
          "@salesforce/extension-commerce-bm-seo",
          {
            "enabled": true,
            "commerceAPI": {
              "proxyPath": "/mobify/proxy/api",
              "parameters": {
                "shortCode": "8o7m175y",
                "clientId": "c9c45bfd-0ed3-4aa2-9971-40f88962b836",
                "organizationId": "f_ecom_zzrf_001",
                "siteId": "RefArchGlobal"
              }
            },
            "resourceTypeToComponentMap": {
              "category": "ProductList",
              "product": "ProductDetail"
            }
          }
        ]
      ]
    }
  }
}
```

### Configuration Options

- `commerceAPI`: Settings for connecting to the Commerce API
  - `proxyPath`: The proxy path for API requests
  - `parameters`: Commerce API connection parameters
    - `clientId`: Your Commerce API client ID
    - `organizationId`: Your organization ID
    - `shortCode`: Your short code
    - `siteId`: Your site ID
- `resourceTypeToComponentMap`: Maps resource types to component names
  - `category`: Name of component for category pages
  - `product`: Name of component for product pages
  - `content_asset`: Name of component for content assets

## How It Works

The SEO extension works by:

1. Blocking navigation
2. Querying the Shopper SEO API for URL mappings
3. Routing to the appropriate component based on the resource type
4. Passing relevant props to the component
