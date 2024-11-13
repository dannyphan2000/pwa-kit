import React from 'react'
import PropTypes from 'prop-types'
import {useForm} from 'react-hook-form'
import {useLocation} from 'react-router-dom'
import {FormattedMessage} from 'react-intl'
import {
    Button,
    Container,
    Stack,
    Text
} from '@salesforce/retail-react-app/app/components/shared/ui'
import {BrandLogo} from '@salesforce/retail-react-app/app/components/icons'
import Field from '@salesforce/retail-react-app/app/components/field'
import PasswordRequirements from '@salesforce/retail-react-app/app/components/forms/password-requirements'
import useUpdatePasswordFields from '@salesforce/retail-react-app/app/components/forms/useUpdatePasswordFields'

const ResetPasswordLanding = () => {
    const form = useForm()
    const {search} = useLocation()
    const queryParams = new URLSearchParams(search)
    const email = queryParams.get('email')
    const token = queryParams.get('token')
    const fields = useUpdatePasswordFields({form})
    const password = form.watch('password')

    const submit = async (values) => {
        try {
            form.clearErrors()
            updateCustomerMutation.mutate(
                {
                    parameters: {customerId},
                    body: {
                        firstName: values.firstName,
                        lastName: values.lastName,
                        phoneHome: values.phone,
                        // NOTE/ISSUE
                        // The sdk is allowing you to change your email to an already-existing email.
                        // I would expect an error. We also want to keep the email and login the same
                        // for the customer, but the sdk isn't changing the login when we submit an
                        // updated email. This will lead to issues where you change your email but end
                        // up not being able to login since 'login' will no longer match the email.
                        email: values.email,
                        login: values.email
                    }
                },
                {
                    onSuccess: () => {
                        setIsEditing(false)
                        toast({
                            title: formatMessage({
                                defaultMessage: 'Profile updated',
                                id: 'profile_card.info.profile_updated'
                            }),
                            status: 'success',
                            isClosable: true
                        })
                        headingRef?.current?.focus()
                    }
                }
            )
        } catch (error) {
            form.setError('global', {type: 'manual', message: error.message})
        }
    }

    return (
        <Stack justify="center" align="center" spacing={6}>
            <BrandLogo width="60px" height="auto" />
            <Stack spacing={2}>
                <Text align="center" fontSize="xl" fontWeight="semibold">
                    <FormattedMessage
                        defaultMessage="Reset Password"
                        id="reset_password_form.title.reset_password"
                    />
                </Text>
            </Stack>
            <Container variant="form">
                <form onSubmit={form.handleSubmit(submit)}>
                    <Stack spacing={6} paddingLeft={4} paddingRight={4}>
                        {form.formState.errors?.root?.global && (
                            <Alert data-testid="password-update-error" status="error">
                                <AlertIcon color="red.500" boxSize={4} />
                                <Text fontSize="sm" ml={3}>
                                    {form.formState.errors.root.global.message}
                                </Text>
                            </Alert>
                        )}
                        <Stack spacing={3} pb={2}>
                            <Field {...fields.password} />
                            <PasswordRequirements value={password} />
                        </Stack>
                        <Button
                            type="submit"
                            onClick={() => form.clearErrors('global')}
                            isLoading={form.formState.isSubmitting}
                        >
                            <FormattedMessage
                                defaultMessage="Reset Password"
                                id="reset_password_form.button.reset_password"
                            />
                        </Button>
                    </Stack>
                </form>
            </Container>
        </Stack>
    )
}


ResetPasswordLanding.getTemplateName = () => 'reset-password-landing'

ResetPasswordLanding.propTypes = {
    token: PropTypes.string
}

export default ResetPasswordLanding
