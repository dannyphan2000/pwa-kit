:loudspeaker: Hey there, Salesforce Commerce Cloud community!

We’re excited to hear your thoughts on your developer experience with PWA Kit and the Composable Storefront generally! Your feedback is incredibly valuable in helping us guide our roadmap and improve our offering.

:clipboard: Take our quick survey here: [Survey](https://forms.gle/bUZNxQ3QKUcrjhV18) 

Feel free to share this survey link with your colleagues, partners, or anyone who has experience with PWA Kit. Your input will help us shape the future of our development tools.

Thank you for being a part of our community and for your continuous support! :raised_hands:

# The PWA Kit Extension SDK

A library of ExpressJS middleware, React Hooks, Custom Extension APIs and utilities used to enhance PWA-Kit applications created with extensibility support. NOTE: All applications built using the PWA-Kit platform 4.x and later will automatically have application extension support by default. If you are currently using version prior to 4.x, please upgrade your `@salesforce/pwa-kit-react-sdk` and `@salesforce/pwa-kit-runtime` packages.

## SDK Contents

### Build Tools

This SDK consists of both Webpack and Babel plugins/loaders that are used to integrate Application Extensions support in the PWA-Kit platform. These are pre-integrated in version 4.x and you will not have to interact with these plugins directly. 

#### Plugins 🔌

 -  `babel/plugin-application-extensions`

    The PWA-Kit dev server uses Babel to transpile source code at runtime on the developer's machine. This plugin is integrated via the default babel configuration file located in your projects root folder. This plugin ensures all Application Extensions are loaded based on the current `extension` configuration.

 - `webpack/application-extensions-config-plugin` 

    This webpack plugin injects the current projects extension configuration into the compiler under the key `custom.extensions`. This webpack plugin is used primarily so that the inline loader (`overrides-resolver-loader`) has access to the current extensions configured. 

#### Loaders 🏗️

 - `webpack/application-extensions-loader`

    Before deploying your PWA-Kit experience to the Managed Runtime, it's transpiled using Webpack. Similar to the Babel plugin described above, this loader, aptly named `application-extensions-loader`, replaces all imports of the Application Extensions array with a customized version specific to your applications currently configured extensions.

 - `webpack/override-resolver-loader`

    This _inline_ loader is responsible for buildtime overrides support in your PWA-Kit application. This loader allows Application Extension developer the means to define what files are and are not overrideable. 

    By using this loader in your extension code it instructs webpack to bypass the normal modules resolution and use a custom resolution path which include all the `/overrides` folders defined in subsequent extensions and your base application.

    In the following sample scenario a PWA-Kit application configuration combined with an _overridable_ import would resolve in a module resolution like one shown below.

    ```
    // app/config/default.js
    export default {
        ...
        extensions: [
            '@salesforce/extension-chakra-storefront', 
            '@salesforce/extension-chakra-checkout', 
            '@salesforce/extension-chakra-store-locator'
        ]
        ...
    }
    ```

    ```
    // extension-chakra-checkout/src/setup-app.ts

    import Checkout from 'overridable!./pages/checkout'
    ...
    ```

    `app/overrides/@salesforce/extension-checkoutpages/checkout`
    `node_modules/@salesforce/extension-chakra-store-locator/src/overrides/@salesforce/extension-checkout/pages/checkout`
    `node_modules/@salesforce/extension-chakra-chakra-storefront/src/overrides/@salesforce/extension-checkout/pages/checkout`

    Result resolution path:

    1. Check if file exists in the base application overrides `app/overrides/pages/checkout`
    2. Next, check if file extists in the last extension applied to the base application `node_modules/@salesforce/extension-chakra-store-locator/src/overrides/pages/checkout`
    3. Finally, check if file extists in the exension configured prior `node_modules/@salesforce/extension-chakra-chakra-storefront/src/overrides/pages/checkout` and do not go any further as you have reached the source importing module which is the canonical source.



### ExpressJS Middleware 👕


### React HOCs 🧩
### React Hooks 🪝

## Support Policy
Security patches are provided for 24 months after the general availability of each major version of the SDK (1.0, 2.0, and so on).