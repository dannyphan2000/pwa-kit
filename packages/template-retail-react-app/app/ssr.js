/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Developer note! When updating this file, make sure to also update the
 * ssr.js template files in pwa-kit-create-app.
 *
 * In the pwa-kit-create-app, the templates are found under:
 * - assets/bootstrap/js/overrides/app/ssr.js.hbs
 * - assets/templates/@salesforce/retail-react-app/app/ssr.js.hbs
 */

'use strict'

import path from 'path'
import {getRuntime} from '@salesforce/pwa-kit-runtime/ssr/server/express'
import {defaultPwaKitSecurityHeaders} from '@salesforce/pwa-kit-runtime/utils/middleware'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import helmet from 'helmet'
import fetch from 'node-fetch'
import express from 'express'
import {emailLink} from './utils/marketing-cloud/marketing-cloud-email-link'
import {
    PASSWORDLESS_LOGIN_LANDING_PATH,
    RESET_PASSWORD_LANDING_PATH
} from './constants'
import {verifySlasCallbackToken} from './utils/jwt-utils'

const config = getConfig()

const options = {
    // The build directory (an absolute path)
    buildDir: path.resolve(process.cwd(), 'build'),

    // The cache time for SSR'd pages (defaults to 600 seconds)
    defaultCacheTimeSeconds: 600,

    // The contents of the config file for the current environment
    mobify: config,

    // The port that the local dev server listens on
    port: 3000,

    // The protocol on which the development Express app listens.
    // Note that http://localhost is treated as a secure context for development,
    // except by Safari.
    protocol: 'http',

    // Option for whether to set up a special endpoint for handling
    // private SLAS clients
    // Set this to false if using a SLAS public client
    // When setting this to true, make sure to also set the PWA_KIT_SLAS_CLIENT_SECRET
    // environment variable as this endpoint will return HTTP 501 if it is not set
    useSLASPrivateClient: false,
    applySLASPrivateClientToEndpoints:
        /oauth2\/(token|passwordless|password\/(login|token|reset|action))/,

    // If this is enabled, any HTTP header that has a non ASCII value will be URI encoded
    // If there any HTTP headers that have been encoded, an additional header will be
    // passed, `x-encoded-headers`, containing a comma separated list
    // of the keys of headers that have been encoded
    // There may be a slight performance loss with requests/responses with large number
    // of headers as we loop through all the headers to verify ASCII vs non ASCII
    encodeNonAsciiHttpHeaders: true
}

const tenantIdRegExp = /^[a-zA-Z]{4}_([0-9]{3}|s[0-9]{2}|stg|dev|prd)$/
const shortCodeRegExp = /^[a-zA-Z0-9-]+$/

/**
 *  Handles JWKS (JSON Web Key Set) caching the JWKS response for 2 weeks.
 *
 * @param {object} req Express request object.
 * @param {object} res Express response object.
 * @param {object} options Options for fetching B2C Commerce API JWKS.
 * @param {string} options.shortCode - The Short Code assigned to the realm.
 * @param {string} options.tenantId - The Tenant ID for the ECOM instance.
 * @returns {Promise<*>} Promise with the JWKS data.
 */
async function jwksCaching(req, res, options) {
    const {shortCode, tenantId} = options

    const isValidRequest = tenantIdRegExp.test(tenantId) && shortCodeRegExp.test(shortCode)
    if (!isValidRequest)
        return res
            .status(400)
            .json({error: 'Bad request parameters: Tenant ID or short code is invalid.'})
    try {
        const JWKS_URI = `https://${shortCode}.api.commercecloud.salesforce.com/shopper/auth/v1/organizations/f_ecom_${tenantId}/oauth2/jwks`
        const response = await fetch(JWKS_URI)

        if (!response.ok) {
            throw new Error('Request failed with status: ' + response.status)
        }

        // JWKS rotate every 30 days. For now, cache response for 14 days so that
        // fetches only need to happen twice a month
        res.set('Cache-Control', 'public, max-age=1209600')

        return res.json(await response.json())
    } catch (error) {
        res.status(400).json({error: `Error while fetching data: ${error.message}`})
    }
}

const runtime = getRuntime()

const resetPasswordCallback =
    config.app.login?.resetPassword?.callbackURI || '/reset-password-callback'
const passwordlessLoginCallback =
    config.app.login?.passwordless?.callbackURI || '/passwordless-login-callback'

const {handler} = runtime.createHandler(options, (app) => {
    app.use(express.json())
    // Set default HTTP security headers required by PWA Kit
    app.use(defaultPwaKitSecurityHeaders)
    // Set custom HTTP security headers
    app.use(
        helmet({
            contentSecurityPolicy: {
                useDefaults: true,
                directives: {
                    'img-src': [
                        // Default source for product images - replace with your CDN
                        '*.commercecloud.salesforce.com'
                    ],
                    'script-src': [
                        // Used by the service worker in /worker/main.js
                        'storage.googleapis.com'
                    ],
                    'connect-src': [
                        // Connect to Einstein APIs
                        'api.cquotient.com'
                    ]
                }
            }
        })
    )

    // Handle the redirect from SLAS as to avoid error
    app.get('/callback?*', (req, res) => {
        // This endpoint does nothing and is not expected to change
        // Thus we cache it for a year to maximize performance
        res.set('Cache-Control', `max-age=31536000`)
        res.send()
    })

    app.get('/:shortCode/:tenantId/oauth2/jwks', (req, res) => {
        jwksCaching(req, res, {shortCode: req.params.shortCode, tenantId: req.params.tenantId})
    })

    app.post(passwordlessLoginCallback, async (req, res) => {
        const slasCallbackToken = req.headers.get('x-slas-callback-token')
        verifySlasCallbackToken(slasCallbackToken)
            .then(async() => {
                const base = req.protocol + '://' + req.get('host')
                const {email_id, token} = req.body
                const magicLink = `${base}${PASSWORDLESS_LOGIN_LANDING_PATH}?token=${token}`
                const emailLinkResponse = await emailLink(
                    email_id,
                    process.env.MARKETING_CLOUD_PASSWORDLESS_LOGIN_TEMPLATE,
                    magicLink
                )
                res.send(emailLinkResponse)
            })
    })

    app.post(resetPasswordCallback, async (req, res) => {
        const slasCallbackToken = req.headers.get('x-slas-callback-token')
        verifySlasCallbackToken(slasCallbackToken)
            .then(async() => {
                const base = req.protocol + '://' + req.get('host')
                const {email_id, token} = req.body
                const magicLink = `${base}${RESET_PASSWORD_LANDING_PATH}?token=${token}&email=${email_id}`
                const emailLinkResponse = await emailLink(
                    email_id,
                    process.env.MARKETING_CLOUD_RESET_PASSWORD_TEMPLATE,
                    magicLink
                )
                res.send(emailLinkResponse)
            })
    })

    app.get('/robots.txt', runtime.serveStaticFile('static/robots.txt'))
    app.get('/favicon.ico', runtime.serveStaticFile('static/ico/favicon.ico'))

    app.get('/worker.js(.map)?', runtime.serveServiceWorker)
    app.get('*', runtime.render)
})
// SSR requires that we export a single handler function called 'get', that
// supports AWS use of the server that we created above.
export const get = handler
