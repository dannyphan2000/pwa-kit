/*
 * Copyright (c) 2025, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {useMemo} from 'react'
import logger from '@salesforce/retail-react-app/app/utils/logger-instance'
import {initDataCloudSdk} from '@salesforce/cc-datacloud-typescript'
import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {useUsid, useCustomerId, useCustomerType, useDNT} from '@salesforce/commerce-sdk-react'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'
import {useCurrentCustomer} from '@salesforce/retail-react-app/app/hooks/use-current-customer'

export class DataCloudApi {
    constructor({site, sdk}) {
        this.site = site
        this.sdk = sdk
    }

    /**
     * Constructs the base event object with the necessary data required
     * for every event sent to Data Cloud.
     * 
     * @param {object} args - The arguments containing event-specific details
     * @returns {object} - The base event object
     */
    _constructBaseEvent(args) {
        return {
            guestId: args.usid,
            siteId: this.site,
            sessionId: args.usid, //get dwsid from cookie?
            deviceId: args.usid, //get BrowserID from cookie?
            dateTime: new Date().toISOString(),
            ...(args.customerId && {customerId: args.customerId}), // Can remove the conditionality after the hook -> Promise is changed in future PWA release
            customerNo: args.customerNo
        }
    }

    /**
     * Generates the event details object required for sending an
     * event to Data Cloud.
     * 
     * @param {string} eventType - The type of event being recorded (e.g 
     * "identity", "userEngagement", "contactPointEmail")
     * @param {string} category - The category of the event, representing 
     * its broader grouping (e.g. "Profile", "Engagement")
     * @returns {object} - The event details object
     */
    _generateEventDetails(eventType, category) {
        return {
            eventId: crypto.randomUUID(),
            eventType: eventType,
            category: category
        }
    }

    /**
     * Constructs an object containing the product Id.
     * 
     * This method extracts and returns the appropriate product Id based on 
     * the product type.
     * 
     * @param {object} product - The product object 
     * @returns {object} - An object containing the resolved product Id
     */
    _constructDatacloudProduct(product) {
        // Return the product SKU in the following priority order:
        // 1. id if available - SKU of the Variant Product
        // 2. productId if available - SKU of product hits within a category
        // 3. masterId - SKU of the Master Product
        return {
            id: product?.id ?? product?.productId ?? product?.master?.masterId
        }
    }
    /**
     * Constructs the base search result object with relevant search 
     * metadata.
     * 
     * @param {object} searchParams - The searchParams object
     * @returns {object} - The base search result object
     */
    _constructBaseSearchResult(searchParams) {
        return {
            searchResultTitle: searchParams.q,
            searchResultPosition: searchParams.offset,
            searchResultPageNumber:
                searchParams.limit != 0 ? searchParams.offset / searchParams.limit + 1 : 1
        }
    }

    _concatenateEvents = (...events) => ({...events.reduce((acc, obj) => ({...acc, ...obj}), {})})

    /**
     * Sends a `page-view` event to Data Cloud.
     * 
     * This method records an `userEnagement` event type to track which page the shopper has viewed.
     * 
     * @param {string} path - The URL path of the page that was viewed
     * @param {object} args - Additional metadata for the event
     */
    async sendViewPage(path, args) {
        const baseEvent = this._constructBaseEvent(args)

        const identityProfile = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('identity', 'Profile'),
            {
                isAnonymous: args.isGuest,
                firstName: args.firstName,
                lastName: args.lastName,
                sourceUrl: path
            }
        )

        const userEngagement = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('userEngagement', 'Engagement'),
            {
                interactionName: 'page-view',
                sourceUrl: path
            }
        )

        let contactPointEmail = null
        if (args.email) {
            contactPointEmail = this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('contactPointEmail', 'Profile'),
                {
                    email: args.email
                }
            )
        }

        const interaction = {
            events: [
                identityProfile,
                ...(contactPointEmail ? [contactPointEmail] : []),
                userEngagement
            ]
        }

        try {
            this.sdk.webEventsAppSourceIdPost(interaction)
        } catch (err) {
            logger.error('Error sending DataCloud event')
        }
    }

    /**
     * Sends a `catalog-object-view-start` event to Data Cloud.
     * 
     * This method records a `catalog` event type to track when a shopper 
     * views the details of a product (e.g. a Product Detail Page).
     * 
     * @param {object} product - The product being viewed
     * @param {object} args - Additional metadata for the event
     */
    async sendViewProduct(product, args) {
        const baseEvent = this._constructBaseEvent(args)
        const baseProduct = this._constructDatacloudProduct(product)

        const identityProfile = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('identity', 'Profile'),
            {
                isAnonymous: args.isGuest,
                firstName: args.firstName,
                lastName: args.lastName
            }
        )

        let contactPointEmail = null
        if (args.email) {
            contactPointEmail = this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('contactPointEmail', 'Profile'),
                {
                    email: args.email
                }
            )
        }

        const catalog = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('catalog', 'Engagement'),
            baseProduct,
            {
                type: 'Product',
                webStoreId: 'pwa',
                interactionName: 'catalog-object-view-start'
            }
        )

        const interaction = {
            events: [identityProfile, ...(contactPointEmail ? [contactPointEmail] : []), catalog]
        }

        try {
            this.sdk.webEventsAppSourceIdPost(interaction)
        } catch (err) {
            logger.error('Error sending DataCloud event')
        }
    }

    /**
     * Sends a `catalog-object-impression` event to Data Cloud.
     * 
     * This method records a `catalog` event type and represents a single 
     * page of product impressions (e.g. a Product List Page).
     * 
     * One event is sent for each product on the page.
     * 
     * @param {object} searchParams - The searchParams object
     * @param {object} category - The category object
     * @param {object} searchResults - The searchResults object
     * @param {object} args - Additional metadata for the event
     */
    async sendViewCategory(searchParams, category, searchResults, args) {
        const baseEvent = this._constructBaseEvent(args)

        const products = searchResults?.hits?.map((product) =>
            this._constructDatacloudProduct(product)
        )

        const catalogObjects = products.map((product) => {
            return this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('catalog', 'Engagement'),
                this._constructBaseSearchResult(searchParams),
                {
                    id: product.id,
                    type: 'Product',
                    webStoreId: 'pwa',
                    categoryId: category.id,
                    interactionName: 'catalog-object-impression'
                }
            )
        })

        const identityProfile = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('identity', 'Profile'),
            {
                isAnonymous: args.isGuest,
                firstName: args.firstName,
                lastName: args.lastName
            }
        )

        let contactPointEmail = null
        if (args.email) {
            contactPointEmail = this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('contactPointEmail', 'Profile'),
                {
                    email: args.email
                }
            )
        }

        const interaction = {
            events: [
                identityProfile,
                ...(contactPointEmail ? [contactPointEmail] : []),
                ...catalogObjects
            ]
        }

        try {
            this.sdk.webEventsAppSourceIdPost(interaction)
        } catch (err) {
            logger.error('Error sending DataCloud event')
        }
    }

    /**
     * Sends a `catalog-object-impression` event to Data Cloud with 
     * additional search result data.
     * 
     * This method records a `catalog` event type when a shopper completes a 
     * search, logging an impression of the products displayed in the search 
     * results.
     * 
     * @param {object} searchParams - The searchParams object
     * @param {object} searchResults - The searchResults object containing an 
     * array of product impressions
     * @param {object} args - Additional metadata for the event
     */
    async sendViewSearchResults(searchParams, searchResults, args) {
        const baseEvent = this._constructBaseEvent(args)

        const products = searchResults?.hits?.map((product) =>
            this._constructDatacloudProduct(product)
        )

        const catalogObjects = products.map((product) => {
            return this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('catalog', 'Engagement'),
                this._constructBaseSearchResult(searchParams),
                {
                    searchResultId: crypto.randomUUID(),
                    id: product.id,
                    type: 'Product',
                    webStoreId: 'pwa',
                    interactionName: 'catalog-object-impression'
                }
            )
        })

        const identityProfile = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('identity', 'Profile'),
            {
                isAnonymous: args.isGuest,
                firstName: args.firstName,
                lastName: args.lastName
            }
        )

        let contactPointEmail = null
        if (args.email) {
            contactPointEmail = this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('contactPointEmail', 'Profile'),
                {
                    email: args.email
                }
            )
        }

        const interaction = {
            events: [
                identityProfile,
                ...(contactPointEmail ? [contactPointEmail] : []),
                ...catalogObjects
            ]
        }

        try {
            this.sdk.webEventsAppSourceIdPost(interaction)
        } catch (err) {
            logger.error('Error sending DataCloud event')
        }
    }

    /**
     * Sends a `catalog-object-impression` event to Data Cloud with 
     * additional recommendation data.
     * 
     * This method records a `catalog` event type when a shopper views a recommendation, 
     * logging an impression of the products displayed in the recommendation.
     * 
     * @param {object} recommenderDetails - Metadata about the recommendation source
     * @param {array} products - List of recommended products
     * @param {object} args - Additional metadata for the event
     */
    async sendViewRecommendations(recommenderDetails, products, args) {
        const baseEvent = this._constructBaseEvent(args)

        const catalogObjects = products.map((product) => {
            return this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('catalog', 'Engagement'),
                {
                    id: product.id,
                    type: 'Product',
                    webStoreId: 'pwa',
                    interactionName: 'catalog-object-impression',
                    personalizationId: recommenderDetails.recommenderName, //* The identifier of the personalization (e.g., recommendation), provided by the personalization service provider, that led to the event.
                    personalizationContextId: recommenderDetails.__recoUUID //* The identifier, provided by the personalization service provider, of the specific content (e.g., product) associated with this event.
                }
            )
        })

        const identityProfile = this._concatenateEvents(
            baseEvent,
            this._generateEventDetails('identity', 'Profile'),
            {
                isAnonymous: args.isGuest,
                firstName: args.firstName,
                lastName: args.lastName
            }
        )

        let contactPointEmail = null
        if (args.email) {
            contactPointEmail = this._concatenateEvents(
                baseEvent,
                this._generateEventDetails('contactPointEmail', 'Profile'),
                {
                    email: args.email
                }
            )
        }

        const interaction = {
            events: [
                identityProfile,
                ...(contactPointEmail ? [contactPointEmail] : []),
                ...catalogObjects
            ]
        }

        try {
            this.sdk.webEventsAppSourceIdPost(interaction)
        } catch (err) {
            logger.error('Error sending DataCloud event')
        }
    }
}

/**
 * Custom hook for sending PWA Kit events to Data Cloud.
 * 
 * This hook provides methods to track various user interactions, such as 
 * page views, product views, category views, search impressions, and recommendations.
 * 
 * @returns {object} An object containing methods for sending different Data Cloud events
 */
const useDataCloud = () => {
    const {getUsidWhenReady} = useUsid()
    const {isRegistered} = useCustomerType()
    const customerId = useCustomerId() // Bug PWA -> Needs converted to Promise
    const {data: customer} = useCurrentCustomer()
    const {site} = useMultiSite()
    let {effectiveDnt} = useDNT()
    effectiveDnt = false // Remove after demo

    const getEventUserParameters = async () => {
        return {
            isGuest: isRegistered ? 0 : 1,
            usid: await getUsidWhenReady(),
            customerId: customerId,
            customerNo: customer?.customerNo,
            firstName: customer?.firstName,
            lastName: customer?.lastName,
            email: customer?.email
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
                site: site.id,
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
        }
    }
}

export default useDataCloud
