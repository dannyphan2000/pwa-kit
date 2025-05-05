/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

// Third-Party
import React from 'react'
import {Redirect} from 'react-router-dom'
import hoistNonReactStatics from 'hoist-non-react-statics'
import {ShopperSeo} from 'commerce-sdk-isomorphic'

// Local Imports
import {Config, CommerceAPIConfig} from '../types'

export const withPropsWrapper = (
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
    urlMapping: Awaited<ReturnType<ShopperSeo<CommerceAPIConfig['parameters']>['getUrlMapping']>>,
    resourceTypeToComponentMap: Config['resourceTypeToComponentMap']
): {component: React.ComponentType<any>; props: Record<string, any>} => {
    let component: React.ComponentType<any>
    let props: Record<string, any>

    if ('resourceType' in urlMapping) {
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
    } else if ('destinationUrl' in urlMapping) {
        props = {to: urlMapping.destinationUrl}
        component = () => <Redirect to={urlMapping.destinationUrl as string} />
        component.displayName = 'Redirect'
    } else {
        throw new Error(
            `Cannot map urlMapping to a component: expected either resourceType or destinationUrl. Received: ${JSON.stringify(
                urlMapping
            )}`
        )
    }
    return {component, props}
}

interface PlaceholderMeta {
    isPlaceholder: true
}

export type PlaceholderComponent = React.FC<any> & PlaceholderMeta

export const createPlaceholderComponent = (): PlaceholderComponent => {
    const Placeholder: React.FC<any> = () => {
        throw new Error('Placeholder component cannot be rendered')
    }

    const component = Placeholder as PlaceholderComponent
    component.isPlaceholder = true

    return component
}
