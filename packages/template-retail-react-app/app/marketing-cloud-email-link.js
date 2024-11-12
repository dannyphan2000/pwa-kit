import crypto from 'crypto'
import https from 'https'

let marketingCloudToken = ''
let marketingCloudTokenExpiration = new Date()

/*
 Make a POST request using native https module, wrapped in a Promise with JSON
 encode and decode
*/
function asyncJsonHttpsPost(options, postObject) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (response) => {
            let data = ''

            response.on('data', (chunk) => {
                data += chunk
            })

            response.on('end', () => {
                resolve(JSON.parse(data))
            })
        })

        req.on('error', (error) => {
            reject(error)
        })

        req.write(JSON.stringify(postObject))

        req.end()
    })
}

async function emailLink(emailId, templateId, magicLink) {
    function generateUniqueId() {
        return crypto.randomBytes(16).toString('hex')
    }

    if (new Date() > marketingCloudTokenExpiration) {
        const tokenOptions = {
            method: 'POST',
            host: `${process.env.MARKETING_CLOUD_SUBDOMAIN}.auth.marketingcloudapis.com`,
            path: '/v2/token',
            headers: {
                'Content-Type': 'application/json'
            }
        }

        const tokenBody = {
            grant_type: 'client_credentials',
            client_id: process.env.MARKETING_CLOUD_CLIENT_ID,
            client_secret: process.env.MARKETING_CLOUD_CLIENT_SECRET
        }

        marketingCloudToken = (await asyncJsonHttpsPost(tokenOptions, tokenBody)).access_token

        marketingCloudTokenExpiration = new Date()
        marketingCloudTokenExpiration.setTime(
            marketingCloudTokenExpiration.getTime() + 15 * 60 * 1000
        )
    }

    const emailOptions = {
        method: 'POST',
        host: `${process.env.MARKETING_CLOUD_SUBDOMAIN}.rest.marketingcloudapis.com`,
        path: `/messaging/v1/email/messages/${generateUniqueId()}`,
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${marketingCloudToken}`
        }
    }

    const emailBody = {
        definitionKey: templateId,
        recipient: {
            contactKey: emailId,
            to: emailId,
            attributes: {'magic-link': magicLink}
        }
    }

    const emailResponse = await asyncJsonHttpsPost(emailOptions, emailBody)

    return emailResponse
}

module.exports = {
    emailLink
}
