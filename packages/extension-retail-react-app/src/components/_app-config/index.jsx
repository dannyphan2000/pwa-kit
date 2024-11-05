/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

/*
 * Developer note! When updating this file, make sure to also update the
 * _app-config template files in pwa-kit-create-app.
 *
 * In the pwa-kit-create-app, the templates are found under:
 * - assets/bootstrap/js/overrides/app/components/_app-config
 * - assets/templates/../../components/_app-config
 */
import React from 'react'
import PropTypes from 'prop-types'

// Removes focus for non-keyboard interactions for the whole application
import 'focus-visible/dist/focus-visible'

import {resolveSiteFromUrl, resolveLocaleFromUrl} from '../../utils/site-utils'
// import {getConfig} from '@salesforce/pwa-kit-runtime/utils/ssr-config'
import {getExtensionConfig as getConfig} from '../../utils/get-extension-config'
import {createUrlTemplate} from '../../utils/url'
import {withReactQuery} from '@salesforce/pwa-kit-react-sdk/ssr/universal/components/with-react-query'

AppConfig.restore = (locals = {}) => {
    const path =
        typeof window === 'undefined'
            ? locals.originalUrl
            : `${window.location.pathname}${window.location.search}`
    const site = resolveSiteFromUrl(path)
    const locale = resolveLocaleFromUrl(path)

    const {app: appConfig} = getConfig()
    const apiConfig = {
        ...appConfig.commerceAPI,
        einsteinConfig: appConfig.einsteinAPI
    }

    apiConfig.parameters.siteId = site.id

    locals.buildUrl = createUrlTemplate(appConfig, site.alias || site.id, locale.id)
    locals.site = site
    locals.locale = locale
    locals.appConfig = appConfig
}

AppConfig.freeze = () => undefined

AppConfig.extraGetPropsArgs = (locals = {}) => {
    return {
        buildUrl: locals.buildUrl,
        site: locals.site,
        locale: locals.locale
    }
}

AppConfig.propTypes = {
    children: PropTypes.node,
    locals: PropTypes.object
}

const isServerSide = typeof window === 'undefined'

// Recommended settings for PWA-Kit usages.
// NOTE: they will be applied on both server and client side.
// retry is always disabled on server side regardless of the value from the options
const options = {
    queryClientConfig: {
        defaultOptions: {
            queries: {
                retry: false,
                refetchOnWindowFocus: false,
                staleTime: 10 * 1000,
                ...(isServerSide ? {retryOnMount: false} : {})
            },
            mutations: {
                retry: false
            }
        }
    },
    beforeHydrate: (data) => {
        const now = Date.now()

        // Helper to reset the data timestamp to time of app load.
        const updateQueryTimeStamp = ({state}) => {
            state.dataUpdatedAt = now
        }

        // Update serialized mutations and queries to ensure that the cached data is
        // considered fresh on first load.
        data?.mutations?.forEach(updateQueryTimeStamp)
        data?.queries?.forEach(updateQueryTimeStamp)

        return data
    }
}

export default withReactQuery(AppConfig, options)
