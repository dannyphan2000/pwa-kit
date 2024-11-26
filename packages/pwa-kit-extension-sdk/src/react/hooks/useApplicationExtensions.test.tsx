/**
 * @jest-environment jsdom
 */
/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
// The @jest-environment comment block *MUST* be the first line of the file for the tests to pass.
// That conflicts with the monorepo header rule, so we must disable the rule!
/* eslint-disable header/header */
import React, {ReactNode} from 'react'
import {renderHook} from '@testing-library/react'
import {useApplicationExtensions, useApplicationExtension} from './useApplicationExtensions'
import {ApplicationExtensionsContext} from '../contexts'
import {ApplicationExtension} from '../classes/ApplicationExtension'

class TestExtension1 extends ApplicationExtension<any> {
    static id = 'test-extension-1'
}

class TestExtension2 extends ApplicationExtension<any> {
    static id = 'test-extension-2'
}

const createWrapper = (extensions: ApplicationExtension<any>[]) => {
    // eslint-disable-next-line react/display-name
    return ({children}: {children: ReactNode}) => (
        <ApplicationExtensionsContext.Provider value={extensions}>
            {children}
        </ApplicationExtensionsContext.Provider>
    )
}

describe('useApplicationExtensions', () => {
    it('returns all extensions from context', () => {
        const mockExtensions = [new TestExtension1({}), new TestExtension2({})]
        const wrapper = createWrapper(mockExtensions)
        const {result} = renderHook(() => useApplicationExtensions(), {wrapper})

        expect(result.current).toEqual(mockExtensions)
    })
})

describe('useApplicationExtension', () => {
    it('returns undefined when extension is not found', () => {
        const mockExtensions = [new TestExtension1({})]
        const wrapper = createWrapper(mockExtensions)
        const {result} = renderHook(() => useApplicationExtension('non-existent-id'), {wrapper})

        expect(result.current).toBeUndefined()
    })

    it('returns the correct extension when found by id', () => {
        const extension1 = new TestExtension1({})
        const extension2 = new TestExtension2({})
        const mockExtensions = [extension1, extension2]
        const wrapper = createWrapper(mockExtensions)
        const {result} = renderHook(() => useApplicationExtension('test-extension-1'), {wrapper})

        expect(result.current).toBe(extension1)
    })
})
