/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {Button, HStack, Input, useNumberInput} from '@chakra-ui/react'
import {FormattedMessage, useIntl} from 'react-intl'
import PropTypes from 'prop-types'

/**
 * This is the mobile implementation of the Chakra NumberInput. This simple component essentially
 * is a helper so we don't have to reuse the hooks every time we need a number input since design dictates
 * we use the mobile variation on all screens.
 *
 * NOTE: We can optionally put global logic we see if in here, and various styling decisions in this single
 * component.
 *
 * @param {*} props
 * @returns
 */
const QuantityPicker = (props) => {
    const intl = useIntl()
    const productName = props.productName
    const {getInputProps, getIncrementTriggerProps, getDecrementTriggerProps} = useNumberInput({
        ...props,
        // Defaults
        focusInputOnChange: false,
        onFocus: (e) => {
            // eslint-disable-next-line react/prop-types
            const {onFocus} = props

            // This is useful for mobile devices, this allows the user to pop open the keyboard and set the
            // new quantity with one click.
            e.target.select()

            // If there is a `onFocus` property define, call it with the event captured.
            // eslint-disable-next-line react/prop-types
            onFocus?.call(this, e)
        }
    })

    const inc = getIncrementTriggerProps()
    const dec = getDecrementTriggerProps()
    const input = getInputProps()

    // Accessibility improvements:
    // 1. Allow keyboard focus on the buttons - Chakra overrides values passed to get*ButtonProps()
    inc.tabIndex = ''
    dec.tabIndex = ''
    // 2. Allow Space or Enter key to trigger buttons
    // Hitting space/enter triggers a "click" event, but the component listens for "mousedown".
    // We can't reuse the buttons' onMouseDown handler, so instead we hijack the input's onKeyDown.
    // @ref https://github.com/chakra-ui/chakra-ui/blob/%40chakra-ui/react%402.7.0/packages/components/number-input/src/use-number-input.ts#L333-L334
    inc.onKeyDown = (evt) => {
        if (evt.key === ' ' || evt.key === 'Enter') {
            evt.key = 'ArrowUp'
            input.onKeyDown(evt)
        }
    }
    dec.onKeyDown = (evt) => {
        if (evt.key === ' ' || evt.key === 'Enter') {
            evt.key = 'ArrowDown'
            input.onKeyDown(evt)
        }
    }

    return (
        <HStack>
            <Button
                data-testid="quantity-decrement"
                {...dec}
                variant="outline"
                ariaLabel={intl.formatMessage(
                    {
                        defaultMessage: 'Decrement Quantity for {productName}',
                        id: 'product_view.label.assistive_msg.quantity_decrement'
                    },
                    {productName}
                )}
            >
                <FormattedMessage
                    id="product_view.label.quantity_decrement"
                    defaultMessage={'\u2212'} // HTML &minus;
                />
            </Button>
            <Input
                {...input}
                ariaLabel={intl.formatMessage({
                    defaultMessage: 'Quantity',
                    id: 'product_view.label.quantity'
                })}
                maxWidth={'44px'}
                textAlign="center"
            />
            <Button
                data-testid="quantity-increment"
                {...inc}
                variant="outline"
                ariaLabel={intl.formatMessage(
                    {
                        defaultMessage: 'Increment Quantity for {productName}',
                        id: 'product_view.label.assistive_msg.quantity_increment'
                    },
                    {productName}
                )}
            >
                <FormattedMessage id="product_view.label.quantity_increment" defaultMessage="+" />
            </Button>
        </HStack>
    )
}

QuantityPicker.propTypes = {
    productName: PropTypes.string
}

export default QuantityPicker
