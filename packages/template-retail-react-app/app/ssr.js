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

import crypto from 'crypto'
import express from 'express'
import https from 'https'

/*
 Make a POST request using native https module, wrapped in a Promise with JSON
 encode and decode
*/
function asyncJsonHttpsPost(options, postObject) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (response) => {
            let data = '';

            response.on('data', (chunk) => {
                data += chunk;
            });

            response.on('end', () => {
                resolve(JSON.parse(data));
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        req.write(JSON.stringify(postObject));

        req.end();
    });
}

async function emailLink(emailId, templateId, magicLink) {

      function generateUniqueId() {
        return crypto.randomBytes(16).toString('hex');
      }

      const tokenOptions = {
        method: 'POST',
        host: `${process.env.MARKETING_CLOUD_SUBDOMAIN}.auth.marketingcloudapis.com`,
        path: '/v2/token',
        headers: {
          'Content-Type': 'application/json',
        },
      };

      const tokenBody = {
        grant_type: 'client_credentials',
        client_id: process.env.MARKETING_CLOUD_CLIENT_ID,
        client_secret: process.env.MARKETING_CLOUD_CLIENT_SECRET
      }

      const token = (await asyncJsonHttpsPost(tokenOptions, tokenBody)).access_token

      const emailOptions = {
        method: 'POST',
        host: `${process.env.MARKETING_CLOUD_SUBDOMAIN}.rest.marketingcloudapis.com`,
        path: `/messaging/v1/email/messages/${generateUniqueId()}`,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      };

      const emailBody = {
        definitionKey: templateId,
        recipient: {
          contactKey: emailId,
          to: emailId,
          attributes: { 'magic-link': magicLink },
        },
      }
        
      const emailResponse = await asyncJsonHttpsPost(emailOptions, emailBody)

      return emailResponse
}

const options = {
    // The build directory (an absolute path)
    buildDir: path.resolve(process.cwd(), 'build'),

    // The cache time for SSR'd pages (defaults to 600 seconds)
    defaultCacheTimeSeconds: 600,

    // The contents of the config file for the current environment
    mobify: getConfig(),

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

    // If this is enabled, any HTTP header that has a non ASCII value will be URI encoded
    // If there any HTTP headers that have been encoded, an additional header will be
    // passed, `x-encoded-headers`, containing a comma separated list
    // of the keys of headers that have been encoded
    // There may be a slight performance loss with requests/responses with large number
    // of headers as we loop through all the headers to verify ASCII vs non ASCII
    encodeNonAsciiHttpHeaders: true
}

const runtime = getRuntime()

const {handler} = runtime.createHandler(options, (app) => {
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
    app.use(express.json())

    // Handle the redirect from SLAS as to avoid error
    app.get('/callback?*', (req, res) => {
        // This endpoint does nothing and is not expected to change
        // Thus we cache it for a year to maximize performance
        res.set('Cache-Control', `max-age=31536000`)
        res.send()
    })

    app.post('/passwordless-login-callback', async (req, res) => {
        const base = req.protocol + '://' + req.get('host')
        const {
            email_id,
            token
        } = req.body
        const magicLink = `${base}/passwordless-login?email=${email_id}&token=${token}`
        const emailLinkResponse = await emailLink(email_id, process.env.MARKETING_CLOUD_PASSWORDLESS_LOGIN_TEMPLATE, magicLink)
        res.send(emailLinkResponse)
    })

    app.post('/reset-password-callback', async (req, res) => {
        const base = req.protocol + '://' + req.get('host')
        const {
            email_id,
            token
        } = req.body
        const magicLink = `${base}/reset-password?email=${email_id}&token=${token}`
        res.send(magicLink)
        //const emailLinkResponse = await emailLink(email_id, process.env.MARKETING_CLOUD_RESET_PASSWORD_TEMPLATE, magicLink)
        //res.send(emailLinkResponse)
    })

    app.get('/robots.txt', runtime.serveStaticFile('static/robots.txt'))
    app.get('/favicon.ico', runtime.serveStaticFile('static/ico/favicon.ico'))

    app.get('/worker.js(.map)?', runtime.serveServiceWorker)
    app.get('*', runtime.render)
})
// SSR requires that we export a single handler function called 'get', that
// supports AWS use of the server that we created above.
export const get = handler
