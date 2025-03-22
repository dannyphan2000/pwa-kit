/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/* eslint-disable no-unused-vars */
import {getAppOrigin} from 'pwa-kit-react-sdk/utils/url'
import {HTTPError} from 'pwa-kit-react-sdk/ssr/universal/errors'
import {createCodeVerifier, generateCodeChallenge} from './pkce'
import {
    isTokenExpired,
    createGetTokenBody,
    onClient,
    parseSlasJWT,
    convertSecondsToDate
} from './utils'
import {
    refreshTokenRegisteredStorageKey,
    refreshTokenGuestStorageKey,
    oidStorageKey,
    EXPIRED_TOKEN,
    INVALID_TOKEN,
    DEFAULT_SLAS_REFRESH_TOKEN_GUEST_TTL,
    DEFAULT_SLAS_REFRESH_TOKEN_REGISTERED_TTL,
    DATA_MAP
} from './constants'
import {LocalStorage, CookieStorage, MemoryStorage} from './storage'
import fetch from 'cross-fetch'

/**
 * An object containing the customer's login credentials.
 * @typedef {Object} CustomerCredentials
 * @property {string} credentials.email
 * @property {string} credentials.password
 */

/**
 * Salesforce Customer object.
 * {@link https://salesforcecommercecloud.github.io/commerce-sdk-isomorphic/modules/shoppercustomers.html#customer}}
 * @typedef {Object} Customer
 */

/**
 * A  class that provides auth functionality for the retail react app.
 */
const slasCallbackEndpoint = '/callback'
class Auth {
    constructor(api) {
        this._api = api
        this._config = api._config
        const options = {
            keySuffix: this._config.parameters.siteId,
            // Setting this to true on the server allows us to reuse guest auth tokens across lambda runs
            sharedContext: !onClient()
        }

        this.stores = {
            cookie: onClient() ? new CookieStorage(options) : new MemoryStorage(options),
            local: onClient() ? new LocalStorage(options) : new MemoryStorage(options),
            memory: new MemoryStorage(options)
        }

        const configOid = api._config.parameters.organizationId
        if (!this.get(oidStorageKey)) {
            this.set(oidStorageKey, configOid)
        }

        if (this.get(oidStorageKey) !== configOid) {
            this._clearAuth()
            this.set(oidStorageKey, configOid)
        }

        this.login = this.login.bind(this)
        this.logout = this.logout.bind(this)
    }

    get(name) {
        const {key, storageType} = DATA_MAP[name]
        const storage = this.stores[storageType]
        return storage.get(key)
    }

    set(name, value, options) {
        const {key, storageType} = DATA_MAP[name]
        const storage = this.stores[storageType]
        storage.set(key, value, options)
        DATA_MAP[name].callback?.(storage)
    }

    delete(name) {
        const {key, storageType} = DATA_MAP[name]
        const storage = this.stores[storageType]
        storage.delete(key)
    }

    get data() {
        return {
            access_token: this.get('access_token'),
            customer_id: this.get('customer_id'),
            enc_user_id: this.get('enc_user_id'),
            expires_in: parseInt(this.get('refresh_token_expires_in')),
            id_token: this.get('id_token'),
            idp_access_token: this.get('idp_access_token'),
            refresh_token: this.get('refresh_token_registered') || this.get('refresh_token_guest'),
            token_type: this.get('token_type'),
            usid: this.get('usid'),
            customer_type: this.get('customer_type'),
            refresh_token_expires_in: this.get('refresh_token_expires_in')
        }
    }

    /**
     * Enum for user types
     * @enum {string}
     */
    static USER_TYPE = {
        REGISTERED: 'registered',
        GUEST: 'guest'
    }

    /**
     * Returns the api client configuration
     * @returns {boolean}
     */
    get pendingLogin() {
        return this._pendingLogin
    }

    /**
     * Returns the SLAS access token or an empty string if the access token
     * is not found in local store or if SFRA wants PWA to trigger refresh token login.
     *
     * On PWA-only sites, this returns the access token from local storage.
     * On Hybrid sites, this checks whether SFRA has sent an auth token via cookies.
     * Returns an access token from SFRA if it exist.
     * If not, the access token from local store is returned.
     *
     * This is only used within this Auth module since other modules consider the access
     * token from this.get('access_token') to be the source of truth.
     *
     * @returns {string} access token
     */
    get authToken() {
        let accessToken = this.get('access_token')
        const sfraAuthToken = this.get('access_token_sfra')

        if (sfraAuthToken) {
            /*
             * If SFRA sends 'refresh', we return an empty token here so PWA can trigger a login refresh
             * This key is used when logout is triggered in SFRA but the redirect after logout
             * sends the user to PWA.
             */
            if (sfraAuthToken === 'refresh') {
                this.set('access_token', '')
                this.delete('access_token_sfra')
                return ''
            }
            const {isGuest, customerId, usid} = parseSlasJWT(sfraAuthToken)
            this.authToken = `Bearer ${sfraAuthToken}`
            this.set('customer_id', customerId)
            this.set('usid', usid)
            this.set('customer_type', isGuest ? Auth.USER_TYPE.GUEST : Auth.USER_TYPE.REGISTERED)

            accessToken = sfraAuthToken
            // SFRA -> PWA access token cookie handoff is succesful so we clear the SFRA made cookies.
            // We don't want these cookies to persist and continue overriding what is in local store.
            this.delete('access_token_sfra')
        }

        return accessToken
    }

    set authToken(token) {
        this.set('access_token', token)
    }

    /**
     * For Hybrid storefronts ONLY!!!
     * This method clears the dwsid cookie from the browser.
     * In a hybrid setup, dwsid points to an ECOM session and is passed between PWA Kit and SFRA/SG sites via "dwsid" cookie.
     *
     * Whenever a registered shopper logs in on PWA Kit, we must clear the dwsid cookie if one exists. When shopper navigates
     * to SFRA as a logged-in shopper, ECOM notices a missing DWSID, generates a new DWSID and triggers the onSession hook which uses
     * registered shopper refresh-token and restores session and basket on SFRA.
     */
    clearECOMSession() {
        const {key, storageType} = DATA_MAP[DWSID_COOKIE_NAME]
        const store = this.stores[storageType]
        store.delete(key)
    }

    get userType() {
        return this.get('refresh_token_registered')
            ? Auth.USER_TYPE.REGISTERED
            : Auth.USER_TYPE.GUEST
    }

    get refreshToken() {
        const refreshTokenKey =
            this.userType === Auth.USER_TYPE.REGISTERED
                ? 'refresh_token_registered'
                : 'refresh_token_guest'
        return this.get(refreshTokenKey)
    }

    get usid() {
        return this.get('usid')
    }

    set usid(usid) {
        this.set('usid', usid)
    }

    get cid() {
        return this.get('customer_id')
    }

    set cid(cid) {
        this.set('customer_id', cid)
    }

    get encUserId() {
        return this.get('enc_user_id')
    }

    set encUserId(encUserId) {
        this.set('enc_user_id', encUserId)
    }

    get idToken() {
        return this.get('id_token')
    }

    set idToken(idToken) {
        this.set('id_token', idToken)
    }

    get oid() {
        return this.get('oid')
    }

    set oid(oid) {
        this.set('oid', oid)
    }

    /**
     * Called with the details from the redirect page that _loginWithCredentials returns
     * I think it's best we leave it to developers on how and where to call from
     * @param {{grantType, code, usid, codeVerifier, redirectUri}} requestDetails - The cutomerId of customer to get.
     */
    async getLoggedInToken(requestDetails) {
        const data = new URLSearchParams()
        const {grantType, code, usid, codeVerifier, redirectUri} = requestDetails
        data.append('code', code)
        data.append('grant_type', grantType)
        data.append('usid', usid)
        data.append('code_verifier', codeVerifier)
        data.append('client_id', this._config.parameters.clientId)
        data.append('redirect_uri', redirectUri)
        data.append('channel_id', this._config.parameters.siteId)

        const options = {
            headers: {
                'Content-Type': `application/x-www-form-urlencoded`
            },
            body: data
        }

        const response = await this._api.shopperLogin.getAccessToken(options)
        // Check for error response before handling the token
        if (response.status_code) {
            throw new HTTPError(response.status_code, response.message)
        }
        this._handleShopperLoginTokenResponse(response)
        return response
    }

    /**
     * Authorizes the customer as a registered or guest user.
     * @param {CustomerCredentials} [credentials]
     * @returns {Promise}
     */
    async login(credentials) {
        // Calling login while its already pending will return a reference
        // to the existing promise.
        if (this._pendingLogin) {
            return this._pendingLogin
        }
        let retries = 0
        const startLoginFlow = () => {
            let authorizationMethod = '_loginAsGuest'
            if (credentials) {
                authorizationMethod = '_loginWithCredentials'
            } else if (!isTokenExpired(this.authToken)) {
                authorizationMethod = '_reuseCurrentLogin'
            } else if (this.refreshToken) {
                authorizationMethod = '_refreshAccessToken'
            }
            return this[authorizationMethod](credentials)
                .then((result) => {
                    return result
                })
                .catch((error) => {
                    const retryErrors = [INVALID_TOKEN, EXPIRED_TOKEN]
                    if (retries === 0 && retryErrors.includes(error.message)) {
                        retries = 1 // we only retry once
                        this._clearAuth()
                        return startLoginFlow()
                    }
                    throw error
                })
        }

        this._pendingLogin = startLoginFlow().finally(() => {
            // When the promise is resolved, we need to remove the reference so
            // that subsequent calls to `login` can proceed.
            this._pendingLogin = undefined
        })

        return this._pendingLogin
    }

    /**
     * Clears the stored auth token and optionally logs back in as guest.
     * @param {boolean} [shouldLoginAsGuest=true] - Indicates if we should automatically log back in as a guest
     * @returns {(Promise<Customer>|undefined)}
     */
    async logout(shouldLoginAsGuest = true) {
        const options = {
            parameters: {
                refresh_token: this.refreshToken,
                client_id: this._config.parameters.clientId,
                channel_id: this._config.parameters.siteId
            }
        }
        await this._api.shopperLogin.logoutCustomer(options, true)
        await this._clearAuth()
        if (shouldLoginAsGuest) {
            return this.login()
        }
    }

    /**
     * Handles Response from ShopperLogin GetAccessToken, calls the getCustomer method and removes the PCKE code verifier from session storage
     * @private
     * @param {object} tokenResponse - access_token,id_token,refresh_token, expires_in,token_type, usid, customer_id, enc_user_id, idp_access_token
     */
    _handleShopperLoginTokenResponse(tokenResponse) {
        const {
            access_token,
            refresh_token,
            customer_id,
            usid,
            enc_user_id,
            id_token,
            refresh_token_expires_in
        } = tokenResponse
        this.authToken = `Bearer ${access_token}`
        this.usid = usid
        this.cid = customer_id
        this.encUserId = enc_user_id
        this.idToken = id_token

        const {isGuest} = parseSlasJWT(access_token)

        const refreshTokenKey = isGuest ? 'refresh_token_guest' : 'refresh_token_registered'
        const responseValue = refresh_token_expires_in
            ? parseInt(refresh_token_expires_in)
            : undefined
        const defaultValue = isGuest
            ? DEFAULT_SLAS_REFRESH_TOKEN_GUEST_TTL
            : DEFAULT_SLAS_REFRESH_TOKEN_REGISTERED_TTL
        const refreshTokenTTLValue = responseValue || defaultValue
        const expiresDate = convertSecondsToDate(refreshTokenTTLValue)
        this.set('refresh_token_expires_in', refreshTokenTTLValue.toString())
        this.set(refreshTokenKey, refresh_token, {
            expires: expiresDate
        })

        if (onClient()) {
            this.delete('code_verifier')
        }
    }

    async _reuseCurrentLogin() {
        // we're reusing the same token so we just need to return the customer object already associated with the token
        const customer = {
            authType: this.userType,
            customerId: this.cid
        }

        return customer
    }

    /**
     * Begins oAuth PCKE Flow
     * @param {{email, password}}} credentials - User Credentials.
     * @returns {object} - a skeleton registered customer object that can be used to retrieve a complete customer object
     */
    async _loginWithCredentials(credentials) {
        const codeVerifier = createCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        this.set('code_verifier', codeVerifier)

        const authorization = `Basic ${btoa(`${credentials.email}:${credentials.password}`)}`
        const options = {
            headers: {
                Authorization: authorization,
                'Content-Type': `application/x-www-form-urlencoded`
            },
            body: {
                redirect_uri: `${getAppOrigin()}${slasCallbackEndpoint}`,
                client_id: this._config.parameters.clientId,
                code_challenge: codeChallenge,
                channel_id: this._config.parameters.siteId,
                usid: this.usid // mergeBasket API requires guest usid to be sent in the authToken
            }
        }

        const response = await this._api.shopperLogin.authenticateCustomer(options, true)
        if (response.status >= 400) {
            const json = await response.json()
            throw new HTTPError(response.status, json.message)
        }

        const tokenBody = createGetTokenBody(
            response.url,
            `${getAppOrigin()}${slasCallbackEndpoint}`,
            onClient() ? this.get('code_verifier') : codeVerifier
        )

        const {customer_id} = await this.getLoggedInToken(tokenBody)
        const customer = {
            customerId: customer_id,
            authType: Auth.USER_TYPE.REGISTERED
        }

        return customer
    }

    /**
     * Begins oAuth PCKE Flow for guest
     * @returns {object} - a guest customer object
     */
    async _loginAsGuest() {
        const codeVerifier = createCodeVerifier()
        const codeChallenge = await generateCodeChallenge(codeVerifier)

        if (onClient()) {
            this.set('code_verifier', codeVerifier)
        }

        const options = {
            headers: {
                Authorization: '',
                'Content-Type': `application/x-www-form-urlencoded`
            },
            parameters: {
                redirect_uri: `${getAppOrigin()}${slasCallbackEndpoint}`,
                client_id: this._config.parameters.clientId,
                channel_id: this._config.parameters.siteId,
                code_challenge: codeChallenge,
                response_type: 'code',
                hint: 'guest'
            }
        }

        const response = await this._api.shopperLogin.authorizeCustomer(options, true)
        if (response.status >= 400) {
            let text = await response.text()
            let errorMessage = text
            try {
                const data = JSON.parse(text)
                if (data.message) {
                    errorMessage = data.message
                }
            } catch {} // eslint-disable-line no-empty
            throw new HTTPError(response.status, errorMessage)
        }

        const tokenBody = createGetTokenBody(
            response.url,
            `${getAppOrigin()}${slasCallbackEndpoint}`,
            onClient() ? this.get('code_verifier') : codeVerifier
        )

        const {customer_id} = await this.getLoggedInToken(tokenBody)

        // A guest customerId will never return a customer from the customer endpoint
        const customer = {
            authType: Auth.USER_TYPE.GUEST,
            customerId: customer_id
        }

        return customer
    }

    /**
     * Creates a guest session
     * @private
     * @returns {*} - The response to be passed back to original caller.
     */
    async _createGuestSession() {
        const loginType = 'guest'
        const options = {
            body: {
                type: loginType
            }
        }

        const rawResponse = await this._api.shopperCustomers.authorizeCustomer(options, true)
        return rawResponse
    }

    /**
     * Refreshes Logged In Token
     * @private
     * @returns {<Promise>} - Handle Shopper Login Promise
     */
    async _refreshAccessToken() {
        const data = new URLSearchParams()
        data.append('grant_type', 'refresh_token')
        data.append('refresh_token', this.refreshToken)
        data.append('client_id', this._config.parameters.clientId)

        const options = {
            headers: {
                'Content-Type': `application/x-www-form-urlencoded`
            },
            body: data
        }
        const response = await this._api.shopperLogin.getAccessToken(options)
        // Check for error response before handling the token
        if (response.status_code) {
            throw new HTTPError(response.status_code, response.message)
        }
        this._handleShopperLoginTokenResponse(response)

        const {customer_id, access_token} = response
        const {isGuest} = parseSlasJWT(access_token)
        let customer = {
            authType: isGuest ? Auth.USER_TYPE.GUEST : Auth.USER_TYPE.REGISTERED,
            customerId: customer_id
        }

        return customer
    }

    /**
     * Removes the stored auth token.
     * @private
     */
    _clearAuth() {
        const keys = Object.keys(DATA_MAP)
        keys.forEach((keyName) => {
            const {key, storageType} = DATA_MAP[keyName]
            const store = this.stores[storageType]
            store.delete(key)
        })
    }
}

export default Auth
