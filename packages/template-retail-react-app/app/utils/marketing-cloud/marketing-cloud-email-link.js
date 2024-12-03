/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import crypto from 'crypto'
import https from 'https'

/**
 * Tokens are valid for 20 minutes. We store it at the top level scope to reuse
 * it during the lambda invocation. We'll refresh it after 15 minutes.
 */
let marketingCloudToken = ''
let marketingCloudTokenExpiration = new Date()

/*
 Make a POST request using native https module, wrapped in a Promise with JSON
 encode and decode
*/
export function asyncJsonHttpsPost(url, postObject, headers = {}) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            headers: {
                ...headers,
                'Content-Type': 'application/json'
            }
        }
        const req = https.request(url, options, (response) => {
            let data = ''

            response.on('data', (chunk) => {
                data += chunk
            })

            response.on('end', () => {
                if (response.statusCode >= 200 && response.statusCode < 300) {
                    resolve(JSON.parse(data))
                } else {
                    reject(
                        new Error(`Request failed with status code ${response.statusCode}: ${data}`)
                    )
                }
            })
        })

        req.on('error', (error) => {
            reject(error)
        })

        req.write(JSON.stringify(postObject))

        req.end()
    })
}

function generateUniqueId() {
    return crypto.randomBytes(16).toString('hex')
}

async function sendMarketingCloudEmail(emailId, marketingCloudConfig) {
    if (new Date() > marketingCloudTokenExpiration) {
        const tokenUrl = `https://${marketingCloudConfig.subdomain}.auth.marketingcloudapis.com/v2/token`

        const tokenBody = {
            grant_type: 'client_credentials',
            client_id: marketingCloudConfig.clientId,
            client_secret: marketingCloudConfig.clientSecret
        }

        marketingCloudToken = (await asyncJsonHttpsPost(tokenUrl, tokenBody)).access_token

        marketingCloudTokenExpiration = new Date()
        marketingCloudTokenExpiration.setTime(
            marketingCloudTokenExpiration.getTime() + 15 * 60 * 1000
        )
    }

    const emailUrl = `https://${
        marketingCloudConfig.subdomain
    }.rest.marketingcloudapis.com/messaging/v1/email/messages/${generateUniqueId()}`

    const emailHeaders = {Authorization: `Bearer ${marketingCloudToken}`}

    const emailBody = {
        definitionKey: marketingCloudConfig.templateId,
        recipient: {
            contactKey: emailId,
            to: emailId,
            attributes: {'magic-link': marketingCloudConfig.magicLink}
        }
    }

    const emailResponse = await asyncJsonHttpsPost(emailUrl, emailBody, emailHeaders)

    return emailResponse
}

export async function emailLink(emailId, templateId, magicLink) {
    const marketingCloudConfig = {
        clientId: process.env.MARKETING_CLOUD_CLIENT_ID,
        clientSecret: process.env.MARKETING_CLOUD_CLIENT_SECRET,
        magicLink: magicLink,
        subdomain: process.env.MARKETING_CLOUD_SUBDOMAIN,
        templateId: templateId
    }
    return await sendMarketingCloudEmail(emailId, marketingCloudConfig)
}
