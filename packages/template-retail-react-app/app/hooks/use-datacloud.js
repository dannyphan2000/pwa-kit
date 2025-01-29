/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
/*global dw*/
import {useMemo} from 'react'
import logger from '@salesforce/retail-react-app/app/utils/logger-instance'
import {initDataCloudSdk} from '@salesforce/cc-datacloud-typescript'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {    
    useUsid,
    useCustomerId,
    useCustomerType,
    useDNT
} from '@salesforce/commerce-sdk-react'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'

const concatenateEvents = (...events) => ({ ...events.reduce((acc, obj) => ({ ...acc, ...obj }), {}) });

export class DataCloudApi {
    constructor({siteId, sdk}) {
        this.siteId = siteId
        this.sdk = sdk
    }
    _constructBaseEvent(args) {
        return {
            guestId: args.usid,
            customerId: args.customerId,
            siteId: this.siteId,
            sessionId: args.usid, //get dwsid from cookie?
            deviceId: args.usid, //get BrowserID from cookie?
            dateTime: new Date().toISOString(),
        }
    }
    
    _generateEventDetails(eventType, category) {
        return {
            eventId: crypto.randomUUID(),
            eventType: eventType,
            category: category,
        }
    }

    _constructDatacloudProduct(product) {
        if (product.type && (product.type.master || product.type.variant)) {
            // handle variants for PDP / viewProduct
            // Assumes product is a Product object from SCAPI Shopper-Products:
            // https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=type%3AProduct

            return {
                id: product.master.masterId,
            }
        } else if (
            product.productType &&
            (product.productType.master ||
                product.productType.variant ||
                product.productType.set ||
                product.productType.bundle ||
                product.productType.variationGroup ||
                product.productType.item)
        ) {
            // handle variants & sets for PLP / viewCategory & viewSearch
            // Assumes product is a ProductSearchHit from SCAPI Shopper-Search:
            // https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-search?meta=type%3AProductSearchHit
            return {
                id: product.productId,
            }
        } else {
            // handles non-variants
            return {
                id: product.id,
            }
        }
    }

    _constructBaseSearchResult(searchParams) {
        return {
            searchResultId: crypto.randomUUID(), // TODO: check if this should be the same for all searches
            searchResultTitle: searchParams.q,
            searchResultPosition: searchParams.offset,
            searchResultPageNumber: searchParams.limit != 0 ? (searchParams.offset / searchParams.limit) + 1 : 1,
        }
    }

    async sendViewPage(path, args) {
        const baseEvent = this._constructBaseEvent(args)

        const identityProfile = concatenateEvents(baseEvent, this._generateEventDetails("identity", "Profile"), {
            isAnonymous: args.isGuest,
            sourceUrl: path,
        })
        const userEngagement = concatenateEvents(baseEvent, this._generateEventDetails("userEngagement", "Engagement"), {
            interactionName: "page-view",
            sourceUrl: path,
        })
        const interaction = {
            events: [identityProfile, userEngagement]
        }

        logger.info(
            `Datacloud sendViewPage Event : ${JSON.stringify(interaction)}`,
            {namespace: 'datacloudEvents'}
        )
        this.sdk.webEventsAppSourceIdPost(interaction)
    }

    async sendViewProduct(product, args) {
        const baseEvent = this._constructBaseEvent(args)
        const baseProduct = this._constructDatacloudProduct(product)

        const identityProfile = concatenateEvents(baseEvent, this._generateEventDetails("identity", "Profile"), {
            isAnonymous: args.isGuest,
        })
        const catalog = concatenateEvents(baseEvent, this._generateEventDetails("productViewStart", "Engagement"), baseProduct, {
            type: "Product",
            webStoreId: "pwa",
            interactionName: "catalog-object-view-start"
        })
        const interaction = {
            events: [identityProfile, catalog]
        }

        logger.info(
            `Datacloud sendViewProduct (PDP) Event : ${JSON.stringify(interaction)}`,
            {namespace: 'datacloudEvents'}
        )
        this.sdk.webEventsAppSourceIdPost(interaction)
    }

    async sendViewCategory(category, searchResults, args) {
        const baseEvent = this._constructBaseEvent(args)
  
        const products = searchResults?.hits?.map((product) =>
            this._constructDatacloudProduct(product)
        )

        const catalogObjects = products.map(product => {
            return concatenateEvents(baseEvent, this._generateEventDetails("viewProductImpressions", "Engagement"), {
                id: product.id,
                type: "Product",
                webStoreId: "pwa",
                catalogId: category.id,
                interactionName: "catalog-object-impression"
            })
        })

        const identityProfile = concatenateEvents(baseEvent, this._generateEventDetails("identity", "Profile"), {
            isAnonymous: args.isGuest,
        })

        const interaction = {
            events: [identityProfile, ...catalogObjects]
        }

        logger.info(
            `Datacloud sendViewCategory (PLP) Event : ${JSON.stringify(interaction)}`,
            {namespace: 'datacloudEvents'}
        )
        this.sdk.webEventsAppSourceIdPost(interaction)
    }

    async sendViewSearchResults(searchParams, searchResults, args) {
        const baseEvent = this._constructBaseEvent(args)
  
        const products = searchResults?.hits?.map((product) =>
            this._constructDatacloudProduct(product)
        )

        const catalogObjects = products.map(product => {
            return concatenateEvents(baseEvent, this._generateEventDetails("viewProductImpressions", "Engagement"), this._constructBaseSearchResult(searchParams), {
                id: product.id,
                type: "Product",
                webStoreId: "pwa",
                interactionName: "catalog-object-impression",
            })
        })

        const identityProfile = concatenateEvents(baseEvent, this._generateEventDetails("identity", "Profile"), {
            isAnonymous: args.isGuest,
        })

        const interaction = {
            events: [identityProfile, ...catalogObjects]
        }

        logger.info(
            `Datacloud sendViewSearchResults Event : ${JSON.stringify(interaction)}`,
            {namespace: 'datacloudEvents'}
        )
        this.sdk.webEventsAppSourceIdPost(interaction)
    }

    async sendViewRecommendations(recommenderDetails, products, args) {
        const baseEvent = this._constructBaseEvent(args)

        const catalogObjects = products.map(product => {
            return concatenateEvents(baseEvent, this._generateEventDetails("viewProductImpressions", "Engagement"), {
                id: product.id,
                type: "Product",
                webStoreId: "pwa",
                interactionName: "catalog-object-impression",
                personalizationId: recommenderDetails.recommenderName, //* The identifier of the personalization (e.g., recommendation), provided by the personalization service provider, that led to the event.
                personalizationContextId: recommenderDetails.__recoUUID, //* The identifier, provided by the personalization service provider, of the specific content (e.g., product) associated with this event.
            })
        })

        const identityProfile = concatenateEvents(baseEvent, this._generateEventDetails("identity", "Profile"), {
            isAnonymous: args.isGuest,
        })

        const interaction = {
            events: [identityProfile, ...catalogObjects]
        }

        logger.info(
            `Datacloud sendViewRecommendations Event : ${JSON.stringify(interaction)}`,
            {namespace: 'datacloudEvents'}
        )
        this.sdk.webEventsAppSourceIdPost(interaction)
    }
}

const useDataCloud = () => {
    const {getUsidWhenReady} = useUsid()
    const {isRegistered} = useCustomerType()
    const customerId = useCustomerId() // Bug PWA -> Needs converted to Promise
    const {site} = useMultiSite()
    let {effectiveDnt} = useDNT()
    effectiveDnt = false // Remove after demo

    const getEventUserParameters = async () => {
        return {
            isGuest: isRegistered ? 0 : 1,
            usid: await getUsidWhenReady(),
            customerId: customerId,
        }
    }

    const {
        app: {dataCloudAPI: config, defaultSite: siteId}
    } = getConfig()
    
    const {appSourceId, tenantId} = config
    let sdk = null
    let isDatacloudInitiated = true

    if (!appSourceId || !tenantId) {
        isDatacloudInitiated = false
    } else {
        sdk = initDataCloudSdk(tenantId, appSourceId)
    }

    const dataCloud = useMemo(
        () =>
            new DataCloudApi({
                site:site.id,
                sdk
            }),
        [site, sdk]
    )
    
    return {
        async sendViewPage(...args) {
            if (!isDatacloudInitiated || effectiveDnt) return
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewPage(...args.concat(userParameters))
        },
        async sendViewProduct(...args) {
            if (!isDatacloudInitiated || effectiveDnt) return
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewProduct(...args.concat(userParameters))
        },
        async sendViewCategory(...args) {
            if (!isDatacloudInitiated || effectiveDnt) return
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewCategory(...args.concat(userParameters))
        },
        async sendViewSearchResults(...args) {
            if (!isDatacloudInitiated || effectiveDnt) return
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewSearchResults(...args.concat(userParameters))
        },
        async sendViewRecommendations(...args) {
            if (!isDatacloudInitiated || effectiveDnt) return
            const userParameters = await getEventUserParameters()
            return dataCloud.sendViewRecommendations(...args.concat(userParameters))
        },
    }
}

export default useDataCloud