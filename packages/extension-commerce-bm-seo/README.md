# SEO Extension

A [PWA Kit](https://github.com/SalesforceCommerceCloud/pwa-kit) extension that adds SEO functionality to your application through the [Shopper SEO URL Mapping API](https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-seo?meta=getUrlMapping). This extension provides features like:

- Integrate routes managed in Business Manager with the PWA Kit
- Integration with SCAPI Shopper SEO URL Mapping API
- Support for multiple resource types (products, categories)

## Installation

```sh
npm install @salesforce/extension-commerce-bm-seo

# Also: 
# - install the peer dependencies listed in the package.json
# - see the Peer Dependancies section below for any other steps (e.g. make sure your app uses CommerceApiProvider component)
```

## Peer Dependencies

PWA-Kit Application Extensions are NPM packages at their most simplest form, and as such you can define
what peer dependencies are required when using it. Because this application extension provides
Chakra UI via a page and components, it requires that the some peer dependencies are installed.

Depending on what features your application extensions provides it's recommended you include any third-party
packages as peer dependencies so that your base application doesn't end up having multiple versions of a 
given package. See package.json for the full list of peer dependencies.

## Configuration

The SEO extension is configured via the `mobify.app.extensions` property in your config files or `package.json`:

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
            "commerceAPIAuth": {
              "propertyNameInLocals": "commerceAPIAuth"
            },
            "resourceTypeToComponentMap": {
              "category": "ProductList",
              "product": "ProductDetail",
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
- `commerceAPIAuth`: Authentication configuration
  - `propertyNameInLocals`: Property name for storing auth in locals
- `resourceTypeToComponentMap`: Maps resource types to component names
  - `category`: Component name for category pages
  - `product`: Component name for product pages
  - `content_asset`: Component name for content assets

## How It Works

The SEO extension works by:

1. Intercepting incoming requests
2. Querying the Shopper SEO API for URL mappings
3. Dynamically routing to the appropriate component based on the resource type
4. Passing the relevant props to the component

The extension uses the Commerce API's Shopper SEO URL Mapping endpoint to handle SEO-friendly URLs and ensure proper routing within your PWA Kit application.
