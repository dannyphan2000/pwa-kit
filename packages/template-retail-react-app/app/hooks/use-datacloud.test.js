/*
 * Copyright (c) 2025, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import {renderHook, waitFor} from '@testing-library/react'
import useDataCloud from '@salesforce/retail-react-app/app/hooks/use-datacloud'

/* eslint-disable react-hooks/rules-of-hooks */
const dataCloudConfig = {
    app: {
        dataCloudAPI: {
            appSourceId: '6ebc532a-2247-48e9-8300-d8c2b84eb463',
            tenantId: 'mvst0mlfmrsd8zbwg8zgmytbg1'
        },
        defaultSite: 'test-site'
    }
}

jest.mock('@salesforce/pwa-kit-runtime/utils/ssr-config', () => {
    return {
        getConfig: jest.fn(() => dataCloudConfig)
    }
})

jest.mock('@salesforce/commerce-sdk-react', () => {
    const originalModule = jest.requireActual('@salesforce/commerce-sdk-react')
    return {
        ...originalModule,
        useUsid: () => {
            return {
                getUsidWhenReady: jest.fn(() => {
                    return 'guest-usid'
                })
            }
        },
        useCustomerId: jest.fn(() => {
            return 1234567890
        }),
        useCustomerType: jest.fn(() => {
            return {isRegistered: true}
        }),
        useDNT: jest.fn(() => {
            return {effectiveDnt: false}
        })
    }
})

jest.mock('@salesforce/retail-react-app/app/hooks/use-current-customer', () => ({
    useCurrentCustomer: jest.fn(() => {
        return {
            data: {
                firstName: 'John',
                lastName: 'Smith',
                email: 'johnsmith@salesforce.com'
            }
        }
    })
}))
const mockWebEventsAppSourceIdPost = jest.fn()
jest.mock('@salesforce/cc-datacloud-typescript', () => {
        return {
            initDataCloudSdk: () => {
                return {
                    webEventsAppSourceIdPost: mockWebEventsAppSourceIdPost
                };
            }
        };
})

const mockUseContext = jest.fn().mockImplementation(() => ({site: {id: 'RefArch'}}))
React.useContext = mockUseContext
describe('useDataCloud', function () {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    test('sendViewPage', async () => {
        const {result} = renderHook(() => useDataCloud())
        expect(result.current).toBeDefined()
        result.current.sendViewPage('/login')
        await waitFor(() => {
            expect(mockWebEventsAppSourceIdPost).toHaveBeenCalledWith()
        })
    })

    test('sendViewProduct', async () => {})

    test('sendViewCategory', async () => {})

    test('sendViewSearchResults', async () => {})

    test('sendViewRecommendations', async () => {})
})
