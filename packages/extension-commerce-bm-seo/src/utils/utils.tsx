/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {Redirect, RedirectProps} from 'react-router-dom'
import hoistNonReactStatics from 'hoist-non-react-statics'

// Platform Imports
import Auth from '@salesforce/commerce-sdk-react/auth'
import {ShopperSeo} from 'commerce-sdk-isomorphic'

// Local Imports
import {Config} from '../types'

export const getShopperSeoClient = async (locals: Record<string, any>, config: Config) => {
    const {
        commerceAPI,
        commerceAPIAuth: {propertyNameInLocals: authProperty}
    } = config

    const appOrigin = getAppOrigin(locals)

    // Saving/reusing the commerce api auth (so all extensions have access to it)
    locals[authProperty] =
        locals[authProperty] ??
        new Auth({
            ...commerceAPI.parameters,
            proxy: `${appOrigin}${commerceAPI.proxyPath}`,
            redirectURI: `${appOrigin}/callback`,
            logger: console // TODO: proper logger
        })

    const auth: Auth = locals[authProperty]
    const {access_token} = await auth.ready()

    const clientConfig = {
        ...commerceAPI,
        proxy: `${appOrigin}${commerceAPI.proxyPath}`
    }

    return new ShopperSeo({
        ...clientConfig,
        headers: {authorization: `Bearer ${access_token}`},
        throwOnBadResponse: true
    })
}

// getAppOrigin is going to be deprecated in PWA Kit v4. Currently we have a replacement (useOrigin) but it's a React hook. So we still need a non-hook version.
// TODO: move to somewhere in SDK
export const getAppOrigin = (
    locals: Record<string, any> = {},
    fromXForwardedHeader = false
): string => {
    if (typeof window !== 'undefined') {
        return window.location.origin
    }

    const xForwardedOrigin = locals.xForwardedOrigin
    if (fromXForwardedHeader && xForwardedOrigin) {
        return xForwardedOrigin
    }

    const {APP_ORIGIN = ''} = process.env
    return APP_ORIGIN
}

// TODO: fix typing
export const withPropsWrapper: any = (
    WrappedComponent: React.ComponentType<any>,
    injectedProps: Record<string, any>
) => {
    const withPropsWrapper = (props: Record<string, any>) => (
        <WrappedComponent {...injectedProps} {...props} />
    )

    // Set a display name for easier debugging in React DevTools
    withPropsWrapper.displayName = `withPropsWrapper(${
        WrappedComponent.displayName || WrappedComponent.name || 'Component'
    })`

    return hoistNonReactStatics(withPropsWrapper, WrappedComponent)
}

export const getComponentForUrlMapping = (
    urlMapping: any, // TODO: fix the type for urlMapping
    resourceTypeToComponentMap: Config['resourceTypeToComponentMap']
): React.ComponentType<any> => {
    let component: React.ComponentType<any>

    const isRedirect = !urlMapping.resourceType
    if (isRedirect && urlMapping.destinationUrl) {
        const props: RedirectProps = {to: urlMapping.destinationUrl}
        component = () => <Redirect {...props} />
        // TODO: Needs a display name for serialization. Double-check that serialization/deserialization works without component map
        component.displayName = 'Redirect'
    } else {
        const componentName =
            resourceTypeToComponentMap[
                urlMapping.resourceType as keyof typeof resourceTypeToComponentMap
            ]
        const props = {
            [`${urlMapping.resourceType as string}Id`]: urlMapping.resourceId
        }

        // Create a placeholder component since the component is defined in another extension.
        // Deserialization will be handled in beforeRouteMatch, where all routes from other extensions are accessible.
        component = createPlaceholderComponent(componentName, props)
    }
    return component
}

interface PlaceholderMeta {
    isPlaceholder: true
    displayName: string
    props: Record<string, any>
}

type PlaceholderComponent = React.ComponentType<any> & PlaceholderMeta

const createPlaceholderComponent = (
    displayName: string,
    props: Record<string, any>
): PlaceholderComponent => {
    const Placeholder: PlaceholderComponent = () => {
        throw new Error(`Placeholder component "${displayName}" should never be rendered directly.`)
    }

    Placeholder.displayName = displayName
    Placeholder.isPlaceholder = true
    Placeholder.props = props

    return Placeholder
}
