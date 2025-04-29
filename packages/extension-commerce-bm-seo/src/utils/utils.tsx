/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {Redirect, RouteProps} from 'react-router-dom'
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

export const getComponentName = (displayName: string) => displayName.split('.').pop()

export const findComponentByName = (
    name: string,
    routes: RouteProps[]
): React.ComponentType<any> | undefined =>
    routes.find((r) => r.component?.displayName?.includes(name))?.component

export const getComponentForUrlMapping = (
    urlMapping: any, // TODO: fix the type for urlMapping
    resourceTypeToComponentMap: Config['resourceTypeToComponentMap']
): {component: React.ComponentType<any>; props: Record<string, any>} => {
    let component: React.ComponentType<any>
    let props: Record<string, any>

    const isRedirect = !urlMapping.resourceType
    if (isRedirect && urlMapping.destinationUrl) {
        props = {to: urlMapping.destinationUrl}
        component = () => <Redirect {...props} />
        component.displayName = 'Redirect'
    } else {
        const componentName =
            resourceTypeToComponentMap[
                urlMapping.resourceType as keyof typeof resourceTypeToComponentMap
            ]
        props = {
            [`${urlMapping.resourceType as string}Id`]: urlMapping.resourceId
        }

        // Create a placeholder component since the component is defined in another extension.
        // Deserialization will be handled in beforeRouteMatch, where all routes from other extensions are accessible.
        component = createPlaceholderComponent()
        component.displayName = componentName
    }
    return {component, props}
}

interface PlaceholderMeta {
    isPlaceholder: true
}

type PlaceholderComponent = React.FC<any> & PlaceholderMeta

export const createPlaceholderComponent = (): PlaceholderComponent => {
    const Placeholder: React.FC<any> = () => {
        throw new Error('Placeholder component cannot be rendered')
    }

    const component = Placeholder as PlaceholderComponent
    component.isPlaceholder = true

    return component
}
