import {createRemoteJWKSet as joseCreateRemoteJWKSet, jwtVerify} from 'jose'
import {createRemoteJWKSet, validateSlasCallbackToken} from './jwt-utils'
import {getAppOrigin} from '@salesforce/pwa-kit-react-sdk/utils/url'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'

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

const MOCK_JWKS = {
    "keys": [
        {
            "kty": "EC",
            "crv": "P-256",
            "use": "sig",
            "kid": "8edb82b1-f6d5-49c1-bab2-c0d152ee3d0b",
            "x": "i8e53csluQiqwP6Af8KsKgnUceXUE8_goFcvLuSzG3I",
            "y": "yIH500tLKJtPhIl7MlMBOGvxQ_3U-VcrrXusr8bVr_0"
        },
        {
            "kty": "EC",
            "crv": "P-256",
            "use": "sig",
            "kid": "da9effc5-58cb-4a9c-9c9c-2919fb7d5e5e",
            "x": "_tAU1QSvcEkslcrbNBwx5V20-sN87z0zR7gcSdBETDQ",
            "y": "ZJ7bgy7WrwJUGUtzcqm3MNyIfawI8F7fVawu5UwsN8E"
        },
        {
            "kty": "EC",
            "crv": "P-256",
            "use": "sig",
            "kid": "5ccbbc6e-b234-4508-90f3-3b9b17efec16",
            "x": "9ULO2Atj5XToeWWAT6e6OhSHQftta4A3-djgOzcg4-Q",
            "y": "JNuQSLMhakhLWN-c6Qi99tA5w-D7IFKf_apxVbVsK-g"
        }
    ]
}

jest.mock('@salesforce/pwa-kit-react-sdk/utils/url', () => ({
    getAppOrigin: jest.fn()
}))

jest.mock('@salesforce/pwa-kit-runtime/utils/ssr-config', () => ({
    getConfig: jest.fn()
}))

jest.mock('jose', () => ({
    createRemoteJWKSet: jest.fn(),
    jwtVerify: jest.fn()
}))

describe('createRemoteJWKSet', () => {

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it('constructs the correct JWKS URI and call joseCreateRemoteJWKSet', () => {
        const mockAppOrigin = 'https://test-storefront.com'
        getAppOrigin.mockReturnValue(mockAppOrigin)
        getConfig.mockReturnValue({
            app: {
                commerceAPI: {
                    parameters: {
                        shortCode: 'abc123',
                        organizationId: 'f_ecom_aaaa_001'
                    }
                }
            }
        })
        joseCreateRemoteJWKSet.mockReturnValue('mockJWKSet')

        const expectedJWKS_URI = new URL(`${mockAppOrigin}/abc123/aaaa_001/oauth2/jwks`)

        const res = createRemoteJWKSet()

        expect(getAppOrigin).toHaveBeenCalled()
        expect(getConfig).toHaveBeenCalled()
        expect(joseCreateRemoteJWKSet).toHaveBeenCalledWith(expectedJWKS_URI)
        expect(res).toBe('mockJWKSet')
    })

})

describe('validateSlasCallbackToken', () => {

    beforeEach(() => {
        jest.resetAllMocks()
        const mockAppOrigin = 'https://test-storefront.com'
        getAppOrigin.mockReturnValue(mockAppOrigin)
        getConfig.mockReturnValue({
            app: {
                commerceAPI: {
                    parameters: {
                        shortCode: 'abc123',
                        organizationId: 'f_ecom_aaaa_001'
                    }
                }
            }
        })
        joseCreateRemoteJWKSet.mockReturnValue(MOCK_JWKS)
    })

    it('returns payload when callback token is valid', async() => {
        const mockPayload = { sub: '123', role: 'admin' }
        jwtVerify.mockResolvedValue({payload: mockPayload})

        const res = await validateSlasCallbackToken('mock.slas.token')

        expect(jwtVerify).toHaveBeenCalledWith('mock.slas.token', MOCK_JWKS, {})
        expect(res).toEqual(mockPayload)
    })

    it('throws validation error when the token is invalid', async() => {
        const mockError = new Error('Invalid token')
        jwtVerify.mockRejectedValue(mockError)

        await expect(validateSlasCallbackToken('mock.slas.token')).rejects.toThrow(mockError.message)
        expect(jwtVerify).toHaveBeenCalledWith('mock.slas.token', MOCK_JWKS, {})
    })
})
