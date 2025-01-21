:loudspeaker: Hey there, Salesforce Commerce Cloud community!

We’re excited to hear your thoughts on your developer experience with PWA Kit and the Composable Storefront generally! Your feedback is incredibly valuable in helping us guide our roadmap and improve our offering.

:clipboard: Take our quick survey here: [Survey](https://forms.gle/bUZNxQ3QKUcrjhV18) 

Feel free to share this survey link with your colleagues, partners, or anyone who has experience with PWA Kit. Your input will help us shape the future of our development tools.

Thank you for being a part of our community and for your continuous support! :raised_hands:

# Description

This is a sample PWA-Kit Application Extension. The purpose of this application extensions is to show how
the Application Extensions API can be used to enhance your PWA-Kit base project.

# Folder Structure

This directory contains the PWA Kit Application Extension base files and structure. It includes the following files:
```
├── src
│   ├── setup-server.ts
│   └── setup-client.ts
└── dev
```

1. `src/setup-server.ts`: The server-side setup function for the extension.
2. `src/setup-client.ts`: The client-side setup function for the extension.
3. `dev/`: PWA Kit App TypeScript template project used for developing the generated PWA Kit App Extension.

# Peer Dependencies

PWA-Kit Application Extensions are NPM packages at their most simplest form, and as such you can define
what peer dependencies are required when using it. Because this sample application extension provides
UI via a new "Sample" page, it requires that the below dependencies are installed at a minimum. 

Depending on what features your application extensions provides it's recommended you include any third-party
packages as peer dependencies so that your base application doesn't end up having multiple versions of a 
given package.

"react": "^18.2.0",
"react-dom": "^18.2.0"

# Configuration

This section is optional and will depend on your application extensions implementation. If you have features
that are configurable, then list those configurations here so that the PWA-Kit project implementor can configure
the extension as they like. 

```
{
    path: 'sample-page'
}
```

# Installation

```
> npm install @salesforce/extension-starter<br/>
> Downloading npm package... <br/>
> Installing extension... <br/>
> Finished. <br/>
> Congratulations! The Sample extension was successfully installed! Please visit https://www.npmjs.com/package/@salesforce/extension-starter for more information on how to use this extension.
```

# State Management

By default all extensions are enhanced with state management using the `withApplicationExtensionStore` higher-order component. Under the hood
the state is provided using [Zustand](https://www.npmjs.com/package/zustand) as a global store for the entire PWA-Kit application. 
Each Application Extension inserts a "slice" into this global store following the 
[slicing pattern](https://github.com/pmndrs/zustand/blob/37e1e3f193a5e5dec6fbd0f07514aec59a187e01/docs/guides/slices-pattern.md). 
This allows you to have data separation from one extension to the other when it's important, but also allows you to access state its 
associated actions of other extensions when needed. 

An examples of why you might want to access state and action from another extension would be opening a store-locator map modal provided via 
the store-locator extension from other pages like the storefronts toolbar or the base project.

This is how you would do something like this.

```
// /base-project/app/components/my-component.jsx
import {useExtensionsStore} from '@salesforce/pwa-kit-extension-sdk/react'

export MyComponent = () => {
    // Grab the slice of the extension state for "extension-a"
    const {toggleMapsModal} = useExtensionsStore(
        (state) =>
            state.state['@salesforce/extension-store-locator'] || {}
    )

    return (
        <div>
            <button onClick={() => toggleMapsModal()}/>
        </div>
    )
}
```

# Advanced Usage

In order to customize this Application Extension to your particular needs we suggest that you refer to the section titled
"configuration", but if there is something that you want to customize that isn't configurable and cannot wait for a feature
request to be fulfilled, then you can use overrides. 

Below is a list of files that can't be overridden from within your PWA-Kit base project. Please refer to the documentation here on
how to properly override extensions. Additionally it's up to the Application Extension developer as to which files can and 
cannot be overridden. Please refer to this documentation on how to write your first PWA-Kit Application Extension.

## Overridable Files

```
/src/path/to/overridable/file.ts
```


