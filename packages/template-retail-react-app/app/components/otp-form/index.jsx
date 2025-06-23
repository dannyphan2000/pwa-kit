/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React, {useState, useRef, useEffect} from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage} from 'react-intl'
import {Button, Divider, Input, SimpleGrid, Stack, Text} from '../shared/ui'

const OtpForm = ({form, setShowOtpView, handleSendEmailOtp}) => {
    const [otpValues, setOtpValues] = useState(['', '', '', '', '', '', '', ''])
    const [resendTimer, setResendTimer] = useState(0)
    const inputRefs = useRef([])

    // Initialize refs array
    useEffect(() => {
        inputRefs.current = inputRefs.current.slice(0, 8)
    }, [])

    // Handle resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
            return () => clearTimeout(timer)
        }
    }, [resendTimer])

    const handleOtpChange = (index, value) => {
        // Only allow digits
        if (!/^\d*$/.test(value)) return

        const newOtpValues = [...otpValues]
        newOtpValues[index] = value
        setOtpValues(newOtpValues)

        // Update form value
        const otpString = newOtpValues.join('')
        form.setValue('otp', otpString)

        // Auto-focus next input
        if (value && index < 7) {
            inputRefs.current[index + 1]?.focus()
        }
    }

    const handleKeyDown = (index, e) => {
        // Handle backspace
        if (e.key === 'Backspace' && !otpValues[index] && index > 0) {
            inputRefs.current[index - 1]?.focus()
        }
    }

    const handlePaste = (e) => {
        e.preventDefault()
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 8)
        if (pastedData.length === 8) {
            const newOtpValues = pastedData.split('')
            setOtpValues(newOtpValues)
            form.setValue('otp', pastedData)
            inputRefs.current[7]?.focus()
        }
    }

    const handleResendCode = async () => {
        try {
            const email = form.getValues('email')
            console.log('Resending code, email: ', email)
            await handleSendEmailOtp(email)
            setResendTimer(60) // Start 60 second countdown
        } catch (error) {
            console.error('Error resending code:', error)
        }
    }

    return (
        <Stack spacing={8} paddingLeft={4} paddingRight={4}>
            <Stack spacing={4}>
                <Text align="center" fontSize="lg" fontWeight="semibold">
                    <FormattedMessage
                        defaultMessage="Enter Verification Code"
                        id="otp.title.enter_verification_code"
                    />
                </Text>
                <Text align="center" fontSize="sm" color="gray.600">
                    <FormattedMessage
                        defaultMessage="We've sent an 8-digit code to your email {email}"
                        values={{email: form.getValues('email')}}
                        id="otp.message.code_sent"
                    />
                </Text>
            </Stack>

            <Stack spacing={4}>
                <SimpleGrid columns={8} spacing={2}>
                    {otpValues.map((value, index) => (
                        <Input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            value={value}
                            onChange={(e) => handleOtpChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            textAlign="center"
                            fontSize="md"
                            fontWeight="bold"
                            size="sm"
                            width="36px"
                            height="42px"
                            borderRadius="md"
                            borderColor="gray.300"
                            _focus={{
                                borderColor: 'blue.500',
                                boxShadow: '0 0 0 1px var(--chakra-colors-blue-500)'
                            }}
                            _hover={{
                                borderColor: 'gray.400'
                            }}
                        />
                    ))}
                </SimpleGrid>
            </Stack>

            <Stack spacing={2}>
                <Button
                    type="submit"
                    onClick={() => {
                        form.clearErrors('global')
                    }}
                    isLoading={form.formState.isSubmitting}
                    isDisabled={otpValues.join('').length !== 8}
                >
                    <FormattedMessage
                        defaultMessage="Verify & Sign In"
                        id="otp.button.verify_sign_in"
                    />
                </Button>

                <Button
                    onClick={handleResendCode}
                    variant="ghost"
                    size="sm"
                    isDisabled={resendTimer > 0}
                    color="blue.600"
                >
                    {resendTimer > 0 ? (
                        <FormattedMessage
                            defaultMessage="Resend code in {seconds}s"
                            id="otp.button.resend_timer"
                            values={{seconds: resendTimer}}
                        />
                    ) : (
                        <FormattedMessage
                            defaultMessage="Resend Code"
                            id="otp.button.resend_code"
                        />
                    )}
                </Button>
            </Stack>

            <Divider />

            <Button
                onClick={() => setShowOtpView(false)}
                borderColor="gray.500"
                color="blue.600"
                variant="outline"
            >
                <FormattedMessage
                    defaultMessage="Back to Sign In Options"
                    id="login_form.button.back"
                />
            </Button>
        </Stack>
    )
}

OtpForm.propTypes = {
    form: PropTypes.object.isRequired,
    setShowOtpView: PropTypes.func.isRequired,
    handleSendEmailOtp: PropTypes.func.isRequired
}

export default OtpForm 