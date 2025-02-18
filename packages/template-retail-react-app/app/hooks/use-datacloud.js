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
    _constructBaseEvent(args) {
        return {
            guestId: args.usid,
            siteId: this.site,
            sessionId: args.usid, //get dwsid from cookie?
            deviceId: args.usid, //get BrowserID from cookie?
            dateTime: new Date().toISOString(),
            ...(args.customerId && {customerId: args.customerId}) // Can remove the conditionality after the hook -> Promise is changed in future PWA release
        }
    }

    _generateEventDetails(eventType, category) {
        return {
            eventId: crypto.randomUUID(),
            eventType: eventType,
            category: category
        }
    }

    _constructDatacloudProduct(product) {
        if (product.type && (product.type.master || product.type.variant)) {
            // handle variants for PDP / viewProduct
            // Assumes product is a Product object from SCAPI Shopper-Products:
            // https://developer.salesforce.com/docs/commerce/commerce-api/references/shopper-products?meta=type%3AProduct

            return {
                id: product.master.masterId
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
                id: product.productId
            }
        } else {
            // handles non-variants
            return {
                id: product.id
            }
        }
    }

    _constructBaseSearchResult(searchParams) {
        return {
            searchResultTitle: searchParams.q,
            searchResultPosition: searchParams.offset,
            searchResultPageNumber:
                searchParams.limit != 0 ? searchParams.offset / searchParams.limit + 1 : 1
        }
    }

    _concatenateEvents = (...events) => ({...events.reduce((acc, obj) => ({...acc, ...obj}), {})})

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
