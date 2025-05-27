/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React from 'react'
import {Alert, createToaster, AlertIndicator, AlertTitle, Button, Spacer} from '@chakra-ui/react'

// In Chakra UI v3, we need to create a toaster instance
const toaster = createToaster({
    defaultOptions: {
        duration: 5000,
        position: 'top-right'
    }
})

/**
 * Display a toast message on the screen.
 * This is a custom hook to handle showing toasts in the app, preventing duplicate toasts and to add action elements
 * to toasts when required. It supports all props supported by Chakra toast.
 *
 * @param {string} title Message text to be displayed in toast
 * @param {string} id - id provided to the toast to avoid duplicate toast ids, use it if multiple toasts are needed
 * @param {string} status Semantic state of the toast - success | error | info | warning
 * @param {node} action Optional component to be displayed in the toast (eg. Button to allow user to perform action)
 * @param {string} position The placement of the toast on screen
 * @param {number} duration The delay before the toast hides (in milliseconds)
 */
export function useToast() {
    // Return a function that matches the signature of the old useToast
    return ({
        title,
        status,
        action,
        position = 'top-right',
        duration = 5000,
        variant = 'subtle',
        isClosable = true,
        description
    }) => {
        let toastConfig = {
            title,
            description,
            status,
            colorScheme: status, // In v3, colorScheme is used instead of status for styling
            duration,
            position,
            variant,
            isClosable
        }

        if (action) {
            toastConfig = {
                ...toastConfig,
                render: (props) => (
                    <Alert
                        status={status}
                        variant="subtle"
                        borderRadius="md"
                        padding={3}
                        width="sm"
                        display="flex"
                        alignItems="center"
                    >
                        {/* In Chakra UI v3, we use the status directly without a separate icon */}
                        <AlertTitle marginRight={2}>{title}</AlertTitle>
                        {description && <div>{description}</div>}
                        <Spacer />
                        {action}
                        <Spacer />
                        <Button variant="ghost" size="sm" onClick={props.onClose}>
                            ✕
                        </Button>
                    </Alert>
                )
            }
        }

        // Use the new toaster API
        toaster.show(toastConfig)
    }
}
