/*
 * Copyright (c) 2023, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/*global dw*/
import {ACTIVE_DATA_ENABLED} from '@salesforce/retail-react-app/app/constants'
import {proxyBasePath} from '@salesforce/pwa-kit-runtime/utils/ssr-namespace-paths'
import logger from '@salesforce/retail-react-app/app/utils/logger-instance'
import {initDataCloudSdk} from '@salesforce/cc-datacloud-typescript'
import {DataCloudApi} from '@salesforce/cc-datacloud-typescript/lib'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {AddToCartBuilder, Cart, CartItem, Identity, PartyIdentification} from '@salesforce/cc-datacloud-typescript/models'
import {    
    useCommerceApi,
    useAccessToken,
    useUsid,
    useCustomerId,
    useCustomerType
} from '@salesforce/commerce-sdk-react'

const {
    app: {dataCloudAPI: config, defaultSite: siteId}
} = getConfig()

const {appSourceId, tenantId} = config
const sdk = initDataCloudSdk(tenantId, appSourceId)

export class DataCloudApi {
    
    /**
     * Tells the Einstein engine when a user views a page.
     * Use this only for pages where another activity does not fit. (ie. on the PDP, use viewProduct rather than this)
     **/
    async sendViewPage(path, args) {
        const identity = {
            isAnonymous: args.isAnonymous,
            guestId: args.usid,
            customerId: args.customerId,// OR encoded user id?
            eventId: crypto.randomUUID(),
            dateTime: new Date().toISOString(),
            eventType: "identity",
            category: "Profile",
            siteId: siteId, //is there a better way to get siteId
        }

        const userEngagement = {
            sourcePageUrl: path,
        }

        const interaction = new ViewPageBuilder()
            .withIdentity(identity)
            .withUserEngagement(userEngagement)
            .build()

        logger.info(
            `Datacloud Event : ${interaction}`,
            {namespace: 'datacloudEvents'}
        )

        sdk.webEventsAppSourceIdPost(interaction)
    }
}

const useDataCloud = () => {
    // Returns true when the feature flag is enabled and the tracking scripts have been executed
    // This MUST be called before using the `dw` variable, otherwise a ReferenceError will be thrown
    const canTrack = () => DATACLOUD_ENGAGEMENT_EVENT_ENABLED && typeof dw !== 'undefined'

    const {getUsidWhenReady} = useUsid()
    const {getEncUserIdWhenReady} = useEncUserId()
    const {isRegistered} = useCustomerType()

    const dataCloud = useMemo(
            () =>
                new DataCloudApi()
        )

    const getEventUserParameters = async () => {
        return {
            isGuest: isRegistered.isGuest,
            usid: await getUsidWhenReady(),
            userId: isRegistered ? await getEncUserIdWhenReady() : undefined,
        }
    }
    
    return {
        async sendViewPage(...args) {
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewPage(...args.concat(userParameters))
        }
        /*
        async sendViewProduct(category, product, type) {
            // if (!canTrack()) return
            try {
                const catalog = {
                    eventId: crypto.randomUUID(),
                    dateTime: new Date().toISOString(),
                    eventType: 'catalog',
                    category: 'engagement',
                    deviceId: '0cd4c80e7dc0f7e0',
                    sessionId: '0cd4c80e7dc0f7e0',
                    siteId: 'RefArch',
                    personalizationContentId: 'personalizationContentId',
                    catalogObjectId: product.productId,
                    catalogObjectType: type,
                    lineItemId: 'line-item-id',
                    interactionName: 'startViewProduct',
                    searchResultId: '',
                    id: '',
                    categoryId: '',
                    webStoreId: '',
                    eventStatus: 'Success',
                    type: 'product'
                }
                const interaction = new ProductViewStartBuilder().withCatalog(catalog).build()
                await sdk.webEventsAppSourceIdPost(interaction)
            } catch (err) {
                logger.error('DataCloud sendViewProduct error', {
                    namespace: 'useDataCloud.sendViewProduct',
                    additionalProperties: {error: err}
                })
            }
        } */

    }
}

export default useDataCloud