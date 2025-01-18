<a name="module_@salesforce/pwa-kit-runtime/ssr/server/express"></a>

## @salesforce/pwa-kit-runtime/ssr/server/express
<a name="module_@salesforce/pwa-kit-runtime/ssr/server/express.getRuntime"></a>

### @salesforce/pwa-kit-runtime/ssr/server/express.getRuntime ⇒ <code>Object</code>
Get the appropriate runtime object for the current environment (remote or development)

### getRuntime().render(req, res, next) ⇒ <code>Promise.&lt;void&gt;</code>
This is the main react-rendering function for SSR. It is an Express handler that performs
server-side rendering of the React application.

The function follows these main steps:
1. Matches the requested URL to a route
2. Loads the React component for that route
3. Initializes the application state
4. Renders the React application to HTML
5. Sends the response with appropriate status code and headers

**Kind**: static method of [<code>@salesforce/pwa-kit-react-sdk/ssr/server/react-rendering</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/server/react-rendering)
**Returns**: <code>Promise.&lt;void&gt;</code> - Resolves when rendering is complete
**Throws**:

- <code>Error</code> Unrecoverable errors are passed to Express error handling


| Param | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Express request object |
| res | <code>Object</code> | Express response object |
| next | <code>function</code> | Express next middleware function |

**Example**
```js
import {getRuntime} from '@salesforce/pwa-kit-runtime/ssr/server/express'
const runtime = getRuntime()
app.get('*', runtime.render)
```

<a name="module_@salesforce/pwa-kit-runtime/utils/ssr-server"></a>

## @salesforce/pwa-kit-runtime/utils/ssr-server

* [@salesforce/pwa-kit-runtime/utils/ssr-server](#module_@salesforce/pwa-kit-runtime/utils/ssr-server)
    * [.isRemote()](#module_@salesforce/pwa-kit-runtime/utils/ssr-server.isRemote) ⇒ <code>boolean</code>
    * [.parseCacheControl(value)](#module_@salesforce/pwa-kit-runtime/utils/ssr-server.parseCacheControl) ⇒ <code>Object</code>

<a name="module_@salesforce/pwa-kit-runtime/utils/ssr-server.isRemote"></a>

### @salesforce/pwa-kit-runtime/utils/ssr-server.isRemote() ⇒ <code>boolean</code>
Determines if the current environment is running in AWS Lambda

**Kind**: static method of [<code>@salesforce/pwa-kit-runtime/utils/ssr-server</code>](#module_@salesforce/pwa-kit-runtime/utils/ssr-server)
**Returns**: <code>boolean</code> - True if running in AWS Lambda, false otherwise
**Example**
```js
import {isRemote} from '@salesforce/pwa-kit-runtime/utils/ssr-server'

if (isRemote()) {
  console.log('Running in AWS Lambda')
} else {
  console.log('Running in development environment')
}
```

<a name="module_@salesforce/pwa-kit-runtime/utils/ssr-config"></a>

## @salesforce/pwa-kit-runtime/utils/ssr-config
<a name="module_@salesforce/pwa-kit-runtime/utils/ssr-config.getConfig"></a>

### @salesforce/pwa-kit-runtime/utils/ssr-config.getConfig() ⇒ <code>Object</code>
Returns the app configuration object.

**Kind**: static method of [<code>@salesforce/pwa-kit-runtime/utils/ssr-config</code>](#module_@salesforce/pwa-kit-runtime/utils/ssr-config)
**Returns**: <code>Object</code> - The application configuration object

**Example**
```js
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
const config = getConfig()
console.log(config)
```

<a name="module_@salesforce/pwa-kit-runtime/utils/logger-factory"></a>

## @salesforce/pwa-kit-runtime/utils/logger-factory
<a name="module_@salesforce/pwa-kit-runtime/utils/logger-factory..createLogger"></a>

### @salesforce/pwa-kit-runtime/utils/logger-factory~createLogger(config) ⇒ <code>PWAKitLogger</code>
Create a logger instance for each package.

**Kind**: inner method of [<code>@salesforce/pwa-kit-runtime/utils/logger-factory</code>](#module_@salesforce/pwa-kit-runtime/utils/logger-factory)
**Returns**: <code>PWAKitLogger</code> - - An instance of PWAKitLogger configured for the specified package.

| Param | Type | Description |
| --- | --- | --- |
| config | <code>Object</code> | Configuration object for the logger. |
| config.packageName | <code>string</code> | The name of the package where the logger is used. |

**Example**
```js
import createLogger from '@salesforce/pwa-kit-runtime/utils/logger-factory'

const logger = createLogger({
  packageName: '@salesforce/pwa-kit-runtime'
})

logger.info('Server started')
logger.error('Failed to connect', {error: err})
```

<a name="module_@salesforce/pwa-kit-runtime/utils/middleware"></a>

## @salesforce/pwa-kit-runtime/utils/middleware
<a name="module_@salesforce/pwa-kit-runtime/utils/middleware.defaultPwaKitSecurityHeaders"></a>

### @salesforce/pwa-kit-runtime/utils/middleware.defaultPwaKitSecurityHeaders
This express middleware sets the Content-Security-Policy and Strict-Transport-Security headers to
default values that are required for PWA Kit to work. It also patches `res.setHeader` to allow
additional CSP directives to be added without removing the required directives, and it prevents
the Strict-Transport-Security header from being set on the local dev server.

**Kind**: static constant of [<code>@salesforce/pwa-kit-runtime/utils/middleware</code>](#module_@salesforce/pwa-kit-runtime/utils/middleware)

| Param | Type | Description |
| --- | --- | --- |
| req | <code>express.Request</code> | Express request object |
| res | <code>express.Response</code> | Express response object |
| next | <code>express.NextFunction</code> | Express next callback |

**Example**
```js
import {defaultPwaKitSecurityHeaders} from '@salesforce/pwa-kit-runtime/utils/middleware'

// Add security headers middleware to Express app
app.use(defaultPwaKitSecurityHeaders)
```

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/browser/main"></a>

## @salesforce/pwa-kit-react-sdk/ssr/browser/main

* [@salesforce/pwa-kit-react-sdk/ssr/browser/main](#module_@salesforce/pwa-kit-react-sdk/ssr/browser/main)
    * [.registerServiceWorker](#module_@salesforce/pwa-kit-react-sdk/ssr/browser/main.registerServiceWorker) ⇒ <code>Promise</code>
    * [.start](#module_@salesforce/pwa-kit-react-sdk/ssr/browser/main.start) ⇒ <code>Promise</code>

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/browser/main.registerServiceWorker"></a>

### @salesforce/pwa-kit-react-sdk/ssr/browser/main.registerServiceWorker ⇒ <code>Promise</code>
Register a service worker for the application. This function will wait for the page to load
before attempting to register the service worker.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/browser/main</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/browser/main)
**Returns**: <code>Promise</code> - A promise that resolves when registration is complete

| Param | Type | Description |
| --- | --- | --- |
| url | <code>string</code> | The URL of the service worker script to register |

**Example**
```js
import {registerServiceWorker} from '@salesforce/pwa-kit-react-sdk/ssr/browser/main'

// Register service worker
registerServiceWorker('/worker.js')
  .then(() => console.log('Service worker registered'))
  .catch(err => console.error('Service worker registration failed:', err))
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/browser/main.start"></a>

### @salesforce/pwa-kit-react-sdk/ssr/browser/main.start ⇒ <code>Promise</code>
Starts the PWA Kit application in the browser by hydrating the server-rendered content.
This function handles setting up the application state, and performing
the hydration process.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/browser/main</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/browser/main)
**Returns**: <code>Promise</code> - A promise that resolves when the application has been hydrated
**Example**
```js
import {start} from '@salesforce/pwa-kit-react-sdk/ssr/browser/main'

// Start the application
start().then(() => {
  console.log('Application started successfully')
})
```

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils"></a>

## @salesforce/pwa-kit-react-sdk/ssr/universal/utils

* [@salesforce/pwa-kit-react-sdk/ssr/universal/utils](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils)
    * _static_
        * [.getAssetUrl(path)](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils.getAssetUrl) ⇒ <code>string</code>
        * [.getProxyConfigs()](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils.getProxyConfigs) ⇒ <code>Array.&lt;ProxyConfig&gt;</code>
    * _inner_
        * [~ProxyConfig](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils..ProxyConfig) : <code>Object</code>

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils.getAssetUrl"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/utils.getAssetUrl(path) ⇒ <code>string</code>
Get the URL that should be used to load an asset from the bundle.

**Kind**: static method of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/utils</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils)

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | relative path from the build directory to the asset |

**Example**
```js
import {getAssetUrl} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

// Get URL for an image asset
const imageUrl = getAssetUrl('images/logo.png')
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils.getProxyConfigs"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/utils.getProxyConfigs() ⇒ <code>Array.&lt;ProxyConfig&gt;</code>
Return the set of proxies configured for the app.

The result is an array of objects, each of which has 'protocol'
(either 'http' or 'https'), 'host' (the hostname) and 'path' (the
path element that follows "/mobify/proxy/", defaulting to 'base' for
the first proxy, and 'base2' for the next).

**Kind**: static method of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/utils</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils)
**Example**
```js
import {getProxyConfigs} from '@salesforce/pwa-kit-react-sdk/ssr/universal/utils'

// Get configured proxies
const proxies = getProxyConfigs()
// Example output:
// [
//   {protocol: 'https', host: 'example.com', path: 'base'},
//   {protocol: 'https', host: 'api.example.com', path: 'base2'}
// ]
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils..ProxyConfig"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/utils~ProxyConfig : <code>Object</code>
**Kind**: inner typedef of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/utils</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/utils)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| protocol | <code>String</code> | http or https |
| host | <code>String</code> | the hostname |
| path | <code>String</code> | the path element that follows "mobify/proxy" |

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks"></a>

## @salesforce/pwa-kit-react-sdk/ssr/universal/hooks

* [@salesforce/pwa-kit-react-sdk/ssr/universal/hooks](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks)
    * _static_
        * [.useCorrelationId](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useCorrelationId) ⇒ <code>object</code>
        * [.useServerContext](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useServerContext) ⇒ <code>ServerContext</code>
        * [.useOrigin](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useOrigin) ⇒ <code>string</code>
    * _inner_
        * [~ServerContext](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks..ServerContext) : <code>Object</code>

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useCorrelationId"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useCorrelationId ⇒ <code>object</code>
Use this hook to get the correlation id value of the closest CorrelationIdProvider component.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/hooks</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks)
**Returns**: <code>object</code> - The correlation id
**Example**
```js
import {useCorrelationId} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'

// Get correlation id
const correlationId = useCorrelationId()
console.log(correlationId)
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useServerContext"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useServerContext ⇒ <code>ServerContext</code>
Get the server context

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/hooks</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks)
**Returns**: <code>ServerContext</code> - ServerContext object
**Example**
```js
import {useServerContext} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'

// Get server context
const {res} = useServerContext()
if (res && query.error) { res.status(404) }
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useOrigin"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/hooks.useOrigin ⇒ <code>string</code>
Returns the application's origin.

By default, it will return the ORIGIN under which we are serving the page.

If `fromXForwardedHeader` is true, it will use the value of `x-forwarded-proto` and `x-forwarded-host` headers in req
to build origin. (it is false by default)

NOTE: this is a React hook, so it has to be used in a React rendering pipeline.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/hooks</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks)
**Returns**: <code>string</code> - origin string
**Example**
```js
import {useOrigin} from '@salesforce/pwa-kit-react-sdk/ssr/universal/hooks'

// Get origin
const origin = useOrigin()
console.log(origin)
// https://example.com
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks..ServerContext"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/hooks~ServerContext : <code>Object</code>
Server context

**Kind**: inner typedef of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/hooks</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/hooks)
**Properties**

| Name | Type | Description |
| --- | --- | --- |
| req | <code>Object</code> | Request object |
| res | <code>Object</code> | Response object |

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors"></a>

## @salesforce/pwa-kit-react-sdk/ssr/universal/errors

* [@salesforce/pwa-kit-react-sdk/ssr/universal/errors](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors)
    * [~HTTPError](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPError) ⇐ <code>Error</code>
        * [new HTTPError(status, message)](#new_module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPError_new)
    * [~HTTPNotFound](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPNotFound) ⇐ <code>HTTPError</code>
        * [new HTTPNotFound(message)](#new_module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPNotFound_new)

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPError"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/errors~HTTPError ⇐ <code>Error</code>
**Kind**: inner class of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/errors</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors)
**Extends**: <code>Error</code>
<a name="new_module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPError_new"></a>

#### new HTTPError(status, message)

| Param | Type | Description |
| --- | --- | --- |
| status | <code>number</code> | The HTTP status code |
| message | <code>string</code> | The error message |

**Example**
```js
import {HTTPError} from '@salesforce/pwa-kit-react-sdk/ssr/universal/errors'

// Create an HTTPError
const error = new HTTPError(404, 'Not Found')
console.log(error.message)
// Not Found
```
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPNotFound"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/errors~HTTPNotFound ⇐ <code>HTTPError</code>
**Kind**: inner class of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/errors</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors)
**Extends**: <code>HTTPError</code>
<a name="new_module_@salesforce/pwa-kit-react-sdk/ssr/universal/errors..HTTPNotFound_new"></a>

#### new HTTPNotFound(message)

| Param | Type | Description |
| --- | --- | --- |
| message | <code>string</code> | The error message |

**Example**
```js
import {HTTPNotFound} from '@salesforce/pwa-kit-react-sdk/ssr/universal/errors'

// Create an HTTPNotFound error
const error = new HTTPNotFound('Not Found')
console.log(error.message)
// Not Found
```

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query"></a>

## @salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query.withReactQuery"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query.withReactQuery ⇒ <code>React.ReactElement</code>
A HoC for adding React Query support to your application. Wrap your AppConfig component with this HOC to enable React Query support.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query)

| Param | Type | Description |
| --- | --- | --- |
| Wrapped | <code>React.ReactElement</code> | The component to be wrapped |
| options | <code>Object</code> |  |
| options.queryClientConfig | <code>Object</code> | The react query client configuration object to be used. |
| options.beforeHydrate | <code>function</code> | A function that will be called before the component is hydrated. It will receive the preloaded state and return the state to be hydrated. |

**Example**
```js
import {withReactQuery} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'

// Wrap a component with React Query
const WrappedComponent = withReactQuery(AppConfig)
```

<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props"></a>

## @salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props
<a name="module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props.withLegacyGetProps"></a>

### @salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props.withLegacyGetProps ⇒ <code>React.ReactElement</code>
A HoC for adding legacy getProps support to your application. Wrap your AppConfig component with this HOC to enable legacy getProps support.

**Kind**: static constant of [<code>@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props</code>](#module_@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props)

| Param | Type | Description |
| --- | --- | --- |
| Wrapped | <code>React.ReactElement</code> | The component to be wrapped |

**Example**
```js
import {withLegacyGetProps} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-legacy-get-props'

// Wrap a component with legacy getProps
const WrappedComponent = withLegacyGetProps(AppConfig)
```