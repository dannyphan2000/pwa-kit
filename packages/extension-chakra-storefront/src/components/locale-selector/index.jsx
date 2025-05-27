/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'

// Components
import {Box, Button, Menu, MenuButton, MenuList, MenuItem, Text} from '@chakra-ui/react'

// Hooks
import {useLocale} from '../../hooks'

// Icons
import {ChevronDownIcon} from '../icons'

// Utils
import {getUrlWithLocale} from '../../utils/url'

/**
 * The LocaleSelector component renders a menu for selecting a locale.
 */
const LocaleSelector = ({variant = 'menu', ...rest}) => {
    const intl = useIntl()
    const {locale, buildLocalizedHref} = useLocale()

    const supportedLocales = intl.messages?.['global']?.['locales'] || {}

    return (
        <Box {...rest}>
            {variant === 'menu' && (
                <Menu>
                    <MenuButton
                        as={Button}
                        variant="ghost"
                        rightIcon={<ChevronDownIcon />}
                        fontSize="sm"
                    >
                        {supportedLocales[locale] || locale}
                    </MenuButton>
                    <MenuList>
                        {Object.keys(supportedLocales).map((localeKey) => (
                            <MenuItem key={localeKey} as="a" href={buildLocalizedHref(localeKey)}>
                                {supportedLocales[localeKey]}
                            </MenuItem>
                        ))}
                    </MenuList>
                </Menu>
            )}
            {variant === 'radio' && (
                <Box>
                    {Object.keys(supportedLocales).map((localeKey) => (
                        <Box key={localeKey} mb={2}>
                            <Text
                                as="a"
                                href={buildLocalizedHref(localeKey)}
                                fontWeight={locale === localeKey ? 'bold' : 'normal'}
                            >
                                {supportedLocales[localeKey]}
                            </Text>
                        </Box>
                    ))}
                </Box>
            )}
        </Box>
    )
}

LocaleSelector.displayName = 'LocaleSelector'

LocaleSelector.propTypes = {
    /**
     * The variant of the locale selector
     */
    variant: PropTypes.oneOf(['menu', 'radio'])
}

export default LocaleSelector
