/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {useIntl} from 'react-intl'
import {render, screen} from '@testing-library/react'
import {renderWithChakraProvider, renderWithProviders} from '../../utils/test-utils'
import * as Icons from '../../components/icons/index'

// Mock the useIntl hook before importing components
jest.mock('react-intl', () => {
    const mockFormatMessage = jest.fn((message) => message.defaultMessage || 'translated-message')
    const mockUseIntl = jest.fn(() => ({
        formatMessage: mockFormatMessage
    }))

    return {
        ...jest.requireActual('react-intl'),
        useIntl: mockUseIntl
    }
})

beforeEach(() => {
    jest.clearAllMocks()
})

test('renders svg icons with Chakra Icon component', () => {
    renderWithProviders(<Icons.CheckIcon />)
    const svg = document.querySelector('.chakra-icon')

    // Use querySelector instead of getByRole since the SVG may not be properly accessible
    expect(svg).toBeInTheDocument()

    // Check for the use element directly
    const use = svg.querySelector('use')
    expect(use).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(use).toHaveAttribute('xlink:href', '#check')
})

test('renders icon with correct aria attributes (with localed message)', () => {
    renderWithProviders(<Icons.LockIcon />)
    const svg = document.querySelector('.chakra-icon')

    // Use querySelector instead of getByRole since the SVG may not be properly accessible
    expect(svg).toBeInTheDocument()
    expect(svg).toHaveAttribute('viewBox', '0 0 24 24')
    expect(svg).toHaveAttribute('aria-hidden', 'false')
    expect(svg).toHaveAttribute('aria-label', 'Secure')
})

// the icon component can exist outside the provider tree via the error component
// therefore we cannot use the useIntl hook because the <IntlProvider> component
// will not exist in the component tree, so we pass the intl object as a prop
test('uses intl from props when rendered outside provider tree', () => {
    const mockIntl = {
        formatMessage: jest.fn()
    }

    // render without providers
    renderWithChakraProvider(<Icons.LockIcon intl={mockIntl} />)

    expect(mockIntl.formatMessage).toHaveBeenCalled()
    expect(useIntl).not.toHaveBeenCalled()
})

test('throws error when rendered outside provider tree and no intl prop is passed', async () => {
    const errorMsg =
        'To localize messages, you must either have <IntlProvider> in the component ancestry or provide `intl` as a prop'
    // render without providers
    expect(() => renderWithChakraProvider(<Icons.LockIcon />)).toThrow(errorMsg)
})
