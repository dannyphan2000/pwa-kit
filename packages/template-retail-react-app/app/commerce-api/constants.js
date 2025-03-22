/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

export const usidStorageKey = 'usid'
export const cidStorageKey = 'cid'
export const encUserIdStorageKey = 'enc-user-id'
export const tokenStorageKey = 'token'
export const refreshTokenRegisteredStorageKey = 'cc-nx'
export const refreshTokenGuestStorageKey = 'cc-nx-g'
export const refreshTokenExpiresInStorageKey = 'refresh_token_expires_in'
export const customerTypeStorageKey = 'customer_type'
export const accessTokenSfraStorageKey = 'cc-at'
export const idTokenStorageKey = 'id_token'
export const idpAccessTokenStorageKey = 'idp_access_token'
export const tokenTypeStorageKey = 'token_type'
export const oidStorageKey = 'oid'
export const codeVerifierStorageKey = 'code_verifier'
export const uidoStorageKey = 'uido'
export const EXPIRED_TOKEN = 'EXPIRED_TOKEN'
export const INVALID_TOKEN = 'invalid refresh_token'
export const STORAGE_TYPES = {
    COOKIE: 'cookie',
    LOCAL: 'local',
    MEMORY: 'memory'
}

export const DWSID_COOKIE_NAME = 'dwsid'
// commerce-api namespaces cookies with siteID as suffixes to allow multisite setups.
// However some cookies are set and used outside of PWA Kit and must not be modified with suffixes.
export const EXCLUDE_COOKIE_SUFFIX = [DWSID_COOKIE_NAME]

/**
 * For Hybrid Setups only!
 * Unlike SCAPI/OCAPI, ECOM creates baskets in app-server cache initially and move the basket object
 * to the db later based on basket state. In a hybrid storefront, storefront requests might be
 * routed to different appservers, if the basket object is still in appserver cache, you will start
 * seeing inconsistencies in basket state. To avoid this, if you have a dwsid cookie, you must send
 * the value of the dwsid cookie with each SCAPI/OCAPI request in a hybrid storefront to maintain appserver affinity.
 *
 * Use the header key below to send dwsid value with SCAPI/OCAPI requests.
 */
export const DWSID_HEADER_KEY = 'sfdc_dwsid'

export const DEFAULT_SLAS_REFRESH_TOKEN_REGISTERED_TTL = 90 * 24 * 60 * 60
export const DEFAULT_SLAS_REFRESH_TOKEN_GUEST_TTL = 30 * 24 * 60 * 60

/**
 * A map of the data that this auth module stores. This maps the name of the property to
 * the storage type and the key when stored in that storage. You can also pass in a "callback"
 * function to do extra operation after a property is set.
 */
export const DATA_MAP = {
    access_token: {
        storageType: 'local',
        key: tokenStorageKey
    },
    customer_id: {
        storageType: 'local',
        key: cidStorageKey
    },
    usid: {
        storageType: 'cookie',
        key: usidStorageKey
    },
    enc_user_id: {
        storageType: 'local',
        key: encUserIdStorageKey
    },
    refresh_token_expires_in: {
        storageType: 'local',
        key: refreshTokenExpiresInStorageKey
    },
    id_token: {
        storageType: 'local',
        key: idTokenStorageKey
    },
    idp_access_token: {
        storageType: 'local',
        key: idpAccessTokenStorageKey
    },
    token_type: {
        storageType: 'local',
        key: tokenTypeStorageKey
    },
    refresh_token_guest: {
        storageType: 'cookie',
        key: refreshTokenGuestStorageKey,
        callback: (store) => {
            store.delete(refreshTokenRegisteredStorageKey)
        }
    },
    refresh_token_registered: {
        storageType: 'cookie',
        key: refreshTokenRegisteredStorageKey,
        callback: (store) => {
            store.delete(refreshTokenGuestStorageKey)
        }
    },
    customer_type: {
        storageType: 'local',
        key: customerTypeStorageKey
    },
    /*
     * For Hybrid setups, we need a mechanism to inform PWA Kit whenever customer login state changes on SFRA.
     * We do this by having SFRA store the access token in cookies. If these cookies are present, PWA
     * compares the access token from the cookie with the one in local store. If the tokens are different,
     * discard the access token in local store and replace it with the access token from the cookie.
     *
     * ECOM has a 1200 character limit on the values of cookies. The access token easily exceeds this amount
     * so it sends the access token in chunks across several cookies.
     *
     * The JWT tends to come in at around 2250 characters so there's usually
     * both a cc-at and cc-at_2.
     */
    access_token_sfra: {
        storageType: 'cookie',
        key: accessTokenSfraStorageKey
    },
    [DWSID_COOKIE_NAME]: {
        storageType: 'cookie',
        key: DWSID_COOKIE_NAME
    },
    code_verifier: {
        storageType: 'local',
        key: codeVerifierStorageKey
    },
    uido: {
        storageType: 'local',
        key: uidoStorageKey
    },
    oid: {
        storageType: 'local',
        key: oidStorageKey
    }
}
