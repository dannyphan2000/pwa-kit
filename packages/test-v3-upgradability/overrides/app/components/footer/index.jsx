/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useState} from 'react'
import PropTypes from 'prop-types'
import {
    Box,
    Text,
    Divider,
    SimpleGrid,
    useMultiStyleConfig,
    Select as ChakraSelect,
    Heading,
    Input,
    InputGroup,
    InputRightElement,
    createStylesContext,
    Button,
    FormControl
} from '@chakra-ui/react'
import {useIntl} from 'react-intl'

import LinksList from '@salesforce/retail-react-app/app/components/links-list'
import SocialIcons from '@salesforce/retail-react-app/app/components/social-icons'
import {HideOnDesktop, HideOnMobile} from '@salesforce/retail-react-app/app/components/responsive'
import {getPathWithLocale} from '@salesforce/retail-react-app/app/utils/url'
import LocaleText from '@salesforce/retail-react-app/app/components/locale-text'
import useMultiSite from '@salesforce/retail-react-app/app/hooks/use-multi-site'
import styled from '@emotion/styled'
import {STORE_LOCATOR_IS_ENABLED} from '@salesforce/retail-react-app/app/constants'

const [StylesProvider, useStyles] = createStylesContext('Footer')
const Footer = ({...otherProps}) => {
    const styles = useMultiStyleConfig('Footer')
    const intl = useIntl()
    const [locale, setLocale] = useState(intl.locale)
    const {site, buildUrl} = useMultiSite()
    const {l10n} = site
    const supportedLocaleIds = l10n?.supportedLocales.map((locale) => locale.id)
    const showLocaleSelector = supportedLocaleIds?.length > 1

    // NOTE: this is a workaround to fix hydration error, by making sure that the `option.selected` property is set.
    // For some reason, adding some styles prop (to the option element) prevented `selected` from being set.
    // So now we add the styling to the parent element instead.
    const Select = styled(ChakraSelect)({
        // Targeting the child element
        option: styles.localeDropdownOption
    })
    const makeOurCompanyLinks = () => {
        const links = []
        if (STORE_LOCATOR_IS_ENABLED)
            links.push({
                href: '/store-locator',
                text: intl.formatMessage({
                    id: 'footer.link.store_locator',
                    defaultMessage: 'Store Locator'
                })
            })
        links.push({
            href: '/',
            text: intl.formatMessage({
                id: 'footer.link.about_us',
                defaultMessage: 'About Us'
            })
        })
        return links
    }

    return (
        <Box>
            Footer is overriden
        </Box>
    )
}

export default Footer
