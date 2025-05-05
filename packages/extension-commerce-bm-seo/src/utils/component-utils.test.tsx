/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {render, screen} from '@testing-library/react'
import {
    createPlaceholderComponent,
    getComponentForUrlMapping,
    PlaceholderComponent,
    withPropsWrapper
} from './component-utils'

describe('withPropsWrapper', () => {
    it('should inject props into the wrapped component', () => {
        const TestComponent = ({message}: {message: string}) => <div>{message}</div>
        const props = {message: 'injected'}
        const Wrapped = withPropsWrapper(TestComponent, props)

        render(<Wrapped />)
        expect(screen.getByText('injected')).toBeTruthy()
    })

    it('should preserve the display name of the wrapped component', () => {
        const NamedComponent = () => null
        NamedComponent.displayName = 'MyComponent'
        const Wrapped = withPropsWrapper(NamedComponent, {})
        expect(Wrapped.displayName).toBe('withPropsWrapper(MyComponent)')
    })

    it('should preserve non-react statics of the wrapped component', () => {
        const TestComponent = () => null
        TestComponent.staticMethod = () => 'static value'
        const Wrapped = withPropsWrapper(TestComponent, {})
        expect(Wrapped.staticMethod()).toBe('static value')
    })
})

describe('getComponentForUrlMapping', () => {
    const resourceTypeToComponentMap = {
        category: 'ProductList',
        product: 'ProductDetail'
    }

    it('should return a redirect component when resourceType is missing in the URL mapping', () => {
        const urlMapping = {destinationUrl: '/somewhere'}
        const {component, props} = getComponentForUrlMapping(urlMapping, resourceTypeToComponentMap)
        expect(component.displayName).toBe('Redirect')
        expect(props).toEqual({to: '/somewhere'})
    })

    it.each([
        [
            'product',
            {resourceType: 'product', resourceId: '123'},
            'ProductDetail',
            {productId: '123'}
        ],
        [
            'category',
            {resourceType: 'category', resourceId: '123'},
            'ProductList',
            {categoryId: '123'}
        ]
    ])(
        'should return a placeholder component for URL mapping with resourceType: %s',
        (_, urlMapping, expectedComponent, expectedProps) => {
            const {component, props} = getComponentForUrlMapping(
                urlMapping,
                resourceTypeToComponentMap
            )

            expect(component.displayName).toBe(expectedComponent)
            expect((component as PlaceholderComponent).isPlaceholder).toBe(true)
            expect(props).toEqual(expectedProps)
        }
    )
})

describe('createPlaceholderComponent', () => {
    it('should return a component with isPlaceholder: true', () => {
        const Component = createPlaceholderComponent()
        expect(Component.isPlaceholder).toBe(true)
    })

    it('should throw an error when rendered', () => {
        const Component = createPlaceholderComponent()
        expect(() => Component({})).toThrow('Placeholder component cannot be rendered')
    })
})
