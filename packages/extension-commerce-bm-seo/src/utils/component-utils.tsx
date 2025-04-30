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

// Local Imports
import {Config} from '../types'

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

// TODO: fix the type for urlMapping
export const getComponentForUrlMapping = (
    urlMapping: any,
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
