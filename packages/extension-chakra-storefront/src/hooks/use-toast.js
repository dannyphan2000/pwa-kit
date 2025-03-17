/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
'use client'

import React from 'react'
import {
    Alert,
    CloseButton,
    Spacer,
    Toaster as ChakraToaster,
    Portal,
    Spinner,
    Stack,
    Toast,
    createToaster
} from '@chakra-ui/react'

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
    return ({
        title,
        status,
        action,
        position = 'top-right',
        duration = 5000,
        variant = 'subtle',
        isClosable = true
    }) => {
        let toastConfig = {
            title,
            status,
            isClosable,
            position,
            duration,
            variant
        }

        if (action) {
            toastConfig = {
                ...toastConfig,

                render: ({onClose}) => (
                    <Alert.Root
                        status={status}
                        variant="subtle"
                        borderRadius="md"
                        py={3}
                        width="sm"
                    >
                        {/*<Alert.Indicator>*/}
                        {/*    <AlertIcon />*/}
                        {/*</Alert.Indicator>*/}
                        <Alert.Title> {title} </Alert.Title>
                        <Spacer />
                        {action}
                        <Spacer />
                        <CloseButton onClick={onClose} />
                    </Alert.Root>
                )
            }
        }
        // toast(toastConfig)
    }
}

export const toaster = createToaster({
    placement: 'bottom-end',
    pauseOnPageIdle: true
})

export const Toaster = () => {
    return (
        <Portal>
            <ChakraToaster toaster={toaster} insetInline={{mdDown: '4'}}>
                {(toast) => (
                    <Toast.Root width={{md: 'sm'}}>
                        {toast.type === 'loading' ? (
                            <Spinner size="sm" color="blue.solid" />
                        ) : (
                            <Toast.Indicator />
                        )}
                        <Stack gap="1" flex="1" maxWidth="100%">
                            {toast.title && <Toast.Title>{toast.title}</Toast.Title>}
                            {toast.description && (
                                <Toast.Description>{toast.description}</Toast.Description>
                            )}
                        </Stack>
                        {toast.action && (
                            <Toast.ActionTrigger>{toast.action.label}</Toast.ActionTrigger>
                        )}
                        {toast.meta?.closable && <Toast.CloseTrigger />}
                    </Toast.Root>
                )}
            </ChakraToaster>
        </Portal>
    )
}
