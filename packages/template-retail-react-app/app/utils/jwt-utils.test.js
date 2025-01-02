const jose = require('jose')
const assert = require('assert')
const JwtMinter = require('./jwt-minter')
const SlasTokenValidator = require('./slas-token-validator')

const AUTH_ERROR_NAME = 'AuthError'

const issueTimestamp = Math.round(Date.now() / 1000) - 60
const JWT_SAMPLE_PAYLOAD = {
    aut: 'GUID',
    scp:
    // eslint-disable-next-line
        'sfcc.shopper-myaccount.baskets sfcc.shopper-myaccount.addresses sfcc.ts_int_on_behalf_of, sfcc.shopper-myaccount.rw openid sfcc.shopper-customers.login sfcc.shopper-customers.register sfcc.shopper-myaccount.addresses.rw offline offline_access sfcc.ts_ext_on_behalf_of email sfcc.shopper-categories sfcc.shopper-myaccount sfcc.pwdless_login',
    sub:
        'cc-slas::bcgl_stg::scid:726bde86-7b99-415d-98ec-9290bad18904::usid:b92318ea-8b0b-40e1-9ad1-2b673b61bf03',
    ctx: 'slas',
    iss: 'slas/dev/bcgl_stg',
    ist: 1,
    aud: 'commercecloud/dev/bcgl_stg',
    nbf: issueTimestamp,
    sty: 'User',
    isb:
        'uido:ecom::upn:mikew::uidn:Mike Wazowski::gcid:abwHIWkXc2xucRmegUwGYYkesV::rcid:bcTMaLNWamdrJu03XHk51s8kcO::chid:TestChid',
    exp: issueTimestamp + 60 * 30,
    iat: issueTimestamp,
    jti: 'C2C8694720750-1008298052332081994449379'
}
const SLAS_JWT_HEADER_JKU = 'slas/dev/bcgl_stg'

const assertAuthError = (error, expectedCode, expectedMessage) => {
    assert.strictEqual(error.name, AUTH_ERROR_NAME)
    assert.strictEqual(error.code, expectedCode)
    assert.strictEqual(error.message, expectedMessage)
    return true
}

describe('createRemoteJWKSet', () => {
})

describe('SLAS Token Validator', () => {
    const jwtMinter = new JwtMinter()

    beforeAll(async() => {
        const JWKS = (await jwtMinter.getKeyPair()).cert

        // For testing, we mock the remote JWKS with the local mocks
        // to avoid making network calls during testing.
        jest.spyOn(SlasTokenValidator.prototype, 'createRemoteJWKSet').mockImplementation(
            (protectedHeader, token) => {
                return jose.createLocalJWKSet(JWKS)(protectedHeader, token)
            }
        )
    })

    it('verify() Verify JWT - Verification passes for test JWT.', async() => {
        // Arrange.
        const jwt = await jwtMinter.mint(JWT_SAMPLE_PAYLOAD, SLAS_JWT_HEADER_JKU)
        const slasTokenValidator = new SlasTokenValidator(jwt)

        // Act.
        const tokenValidationResult = await slasTokenValidator.verify()

        // Assert
        assert.strictEqual(tokenValidationResult.expiration, issueTimestamp + 60 * 30)
    })


    it('verify() Verify JWT - Verification fails if JWT has no issuer claim.', async() => {
        // Arrange
        const invalidPayload = {...JWT_SAMPLE_PAYLOAD}
        delete invalidPayload.iss
        const jwt = await jwtMinter.mint(invalidPayload, SLAS_JWT_HEADER_JKU)
        const slasTokenValidator = new SlasTokenValidator(jwt)
        // Act
        await assert.rejects(
            () => slasTokenValidator.verify(),
            // Assert
            (error) =>
                assertAuthError(
                    error,
                    403,
                    'SLAS Token Validation Error: Invalid SLAS \'iss\' claim.'
                )
        )
    })

    it('verify() Verify JWT - Verification fails if JWT header JKU fields does not contain a SLAS issuer.', async() => {
        // Arrange
        const jwt = await jwtMinter.mint(JWT_SAMPLE_PAYLOAD, 'fooo/dev/bcgl_stg')
        const slasTokenValidator = new SlasTokenValidator(jwt)
        // Act
        await assert.rejects(
            () => slasTokenValidator.verify(),
            // Assert
            (error) =>
                assertAuthError(
                    error,
                    401,
                    'SLAS Token Validation Error: Invalid jku header. Expected a SLAS tenant.'
                )
        )
    })

    it('verify() Verify JWT - Verification fails if JWT has not a SLAS issuer claim.', async() => {
        // Arrange
        const invalidPayload = {...JWT_SAMPLE_PAYLOAD, iss: 'fooo/dev/bcgl_stg'}
        const jwt = await jwtMinter.mint(invalidPayload, SLAS_JWT_HEADER_JKU)
        const slasTokenValidator = new SlasTokenValidator(jwt)
        // Act
        await assert.rejects(
            () => slasTokenValidator.verify(),
            // Assert
            (error) =>
                assertAuthError(
                    error,
                    403,
                    'SLAS Token Validation Error: Invalid SLAS \'iss\' claim. Expected a SLAS tenant.'
                )
        )
    })

    it('verify() Verify JWT - Verification fails if JWT was signed with a different key.', async() => {
        // Arrange
        const foreignMinter = new JwtMinter()
        const jwt = await foreignMinter.mint(JWT_SAMPLE_PAYLOAD, SLAS_JWT_HEADER_JKU)
        const slasTokenValidator = new SlasTokenValidator(jwt)
        // Act
        await assert.rejects(
            () => {
                return slasTokenValidator.verify()
            },
            // Assert
            (error) =>
                assertAuthError(
                    error,
                    401,
                    'SLAS Token Validation Error: signature verification failed'
                )
        )
    })
})
