/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useBlock} from './index'
import React from 'react'
import {render} from '@testing-library/react'

// Mock the entire 'react-router-dom' module
const mockBlock = jest.fn()
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useHistory: () => ({
        block: mockBlock,
        push: jest.fn(),
        location: 'some location'
    })
}))

const mockFunc = jest.fn()
const mockSetIsBlocked = jest.fn()

const AComponent = () => {
    useBlock(mockFunc, mockSetIsBlocked)
    return <></>
}

describe('useBlock', () => {
    beforeEach(() => {
        mockFunc.mockReset()
        mockSetIsBlocked.mockReset()
    })

    it('should block when function returns true', async () => {
        mockFunc.mockResolvedValueOnce(true)
        render(<AComponent />)
        await Promise.resolve()

        expect(mockBlock).toHaveBeenCalled()
    })

    it('should not block when function returns false', async () => {
        mockFunc.mockResolvedValueOnce(false)
        render(<AComponent />)
        await Promise.resolve()

        expect(mockBlock).not.toHaveBeenCalled()
    })
})
