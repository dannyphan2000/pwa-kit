/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
jest.mock('https', () => {
    return {
        request: jest.fn((url, options, callback) => {
            const response = {
                on: jest.fn((event, callback) => {
                    if (event === 'data') {
                        callback(response.data)
                    } else if (event === 'end') {
                        callback()
                    } else if (event === 'on') {
                        callback()
                    }
                }),
                statusCode: 200,
                headers: {},
                data: '{ "data": "test" }'
            }

            callback(response)
        })
    }
})
import {emailLink} from '@salesforce/retail-react-app/../../app/utils/marketing-cloud/marketing-cloud-email-link'

describe('emailLink()', () => {
    it('should send an email with a magic link', async () => {
        const result = await emailLink('test@example.com', '123', 'https://magic-link.example.com')

        expect(result).toEqual({data: 'test'})
    })
})
