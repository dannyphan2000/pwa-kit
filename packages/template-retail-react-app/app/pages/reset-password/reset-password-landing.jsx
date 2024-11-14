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
import usePasswordReset from '@salesforce/retail-react-app/app/hooks/use-password-reset'

const ResetPasswordLanding = () => {
    const form = useForm()
    const {search} = useLocation()
    const queryParams = new URLSearchParams(search)
    const email = queryParams.get('email')
    const token = queryParams.get('token')
    const fields = useUpdatePasswordFields({form})
    const password = form.watch('password')
    const {resetPassword} = usePasswordReset()

    const submit = async (values) => {
        form.clearErrors()
        try{
            await resetPassword({email, token, newPassword: values.password})
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
