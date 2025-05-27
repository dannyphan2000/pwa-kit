/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {FormattedMessage, useIntl} from 'react-intl'
import {
    Box,
    Button,
    Divider,
    Flex,
    HStack,
    Link,
    List,
    ListItem,
    Spinner,
    Stack,
    Text,
    VStack,
    useBreakpointValue,
    // Migrating to new Drawer API for Chakra UI v3
    Drawer,
    Portal
} from '@chakra-ui/react'
import {Link as RouteLink} from 'react-router-dom'

// Project Components
import {HideOnDesktop, HideOnMobile} from '../responsive'
import LocaleText from '../locale-text'
import SocialIcons from '../social-icons'

// Hooks
import {AuthHelpers, useAuthHelper, useCustomer} from '@salesforce/commerce-sdk-react'
import {useCategories} from '../../hooks/use-categories'
import {useCurrentCustomer} from '../../hooks/use-current-customer'

// Others
import {getPathWithLocale} from '../../utils/url'
import {categoryUrlBuilder} from '../../utils/url'

const PHONE_DRAWER_SIZE = 'xs'
const TABLET_DRAWER_SIZE = 'lg'

const DrawerSeparator = () => (
    <Box paddingTop={6} paddingBottom={6}>
        <Divider />
    </Box>
)

/**
 * Drawer Menu component for mobile navigation (migrated to Chakra UI v3 Drawer API)
 */
const DrawerMenu = ({root, isOpen, onClose, onLogoClick, ...props}) => {
    const intl = useIntl()
    const {data: customer} = useCurrentCustomer()
    const logout = useAuthHelper(AuthHelpers.Logout)
    const {categories, isLoading} = useCategories({root})
    const drawerSize = useBreakpointValue({sm: PHONE_DRAWER_SIZE, md: TABLET_DRAWER_SIZE})

    return (
        <Drawer.Root
            open={isOpen}
            onOpenChange={() => onClose()}
            placement="start"
            size={drawerSize}
            {...props}
        >
            <Portal>
                <Drawer.Backdrop />
                <Drawer.Positioner>
                    <Drawer.Content>
                        <Drawer.Header
                            aria-label={intl.formatMessage({
                                id: 'drawer_menu.header.assistive_msg.title',
                                defaultMessage: 'Menu Drawer'
                            })}
                            borderBottomWidth={1}
                            paddingTop={6}
                            paddingBottom={6}
                            paddingLeft={6}
                            paddingRight={6}
                        >
                            <Drawer.CloseTrigger />
                        </Drawer.Header>

                        <Drawer.Body>
                            {isLoading && (
                                <Flex justify="center" py={8}>
                                    <Spinner />
                                </Flex>
                            )}

                            {!isLoading && (
                                <VStack align="stretch" spacing={0}>
                                    {/* Categories */}
                                    {categories?.map((category, index) => {
                                        const href = categoryUrlBuilder(category)
                                        return (
                                            <Box key={index}>
                                                <Link
                                                    as={RouteLink}
                                                    to={href}
                                                    onClick={onClose}
                                                    display="block"
                                                    py={3}
                                                    px={4}
                                                    _hover={{bg: 'gray.50'}}
                                                >
                                                    <Text fontWeight="bold">
                                                        <LocaleText shortCode={category.name} />
                                                    </Text>
                                                </Link>
                                            </Box>
                                        )
                                    })}

                                    <Link
                                        as={RouteLink}
                                        to={getPathWithLocale('/category/newarrivals')}
                                        onClick={onClose}
                                        display="block"
                                        py={3}
                                        px={4}
                                        _hover={{bg: 'gray.50'}}
                                    >
                                        <Text fontWeight="bold">
                                            <FormattedMessage
                                                id="drawer_menu.link.shop_all"
                                                defaultMessage="Shop All"
                                            />
                                        </Text>
                                    </Link>

                                    <DrawerSeparator />

                                    {/* Account Section */}
                                    {customer.isRegistered ? (
                                        <VStack align="stretch" spacing={4}>
                                            <Button
                                                variant="ghost"
                                                justifyContent="flex-start"
                                                onClick={() => {
                                                    logout.mutate()
                                                    onClose()
                                                }}
                                            >
                                                <FormattedMessage
                                                    id="drawer_menu.button.log_out"
                                                    defaultMessage="Log Out"
                                                />
                                            </Button>

                                            <Link
                                                as={RouteLink}
                                                to={getPathWithLocale('/account')}
                                                onClick={onClose}
                                                display="block"
                                                py={3}
                                                px={4}
                                                _hover={{bg: 'gray.50'}}
                                            >
                                                <FormattedMessage
                                                    id="drawer_menu.button.my_account"
                                                    defaultMessage="My Account"
                                                />
                                            </Link>

                                            <Link
                                                as={RouteLink}
                                                to={getPathWithLocale('/account/profile')}
                                                onClick={onClose}
                                                display="block"
                                                py={3}
                                                px={4}
                                                _hover={{bg: 'gray.50'}}
                                            >
                                                <FormattedMessage
                                                    id="drawer_menu.button.account_details"
                                                    defaultMessage="Account Details"
                                                />
                                            </Link>

                                            <Link
                                                as={RouteLink}
                                                to={getPathWithLocale('/account/orders')}
                                                onClick={onClose}
                                                display="block"
                                                py={3}
                                                px={4}
                                                _hover={{bg: 'gray.50'}}
                                            >
                                                <FormattedMessage
                                                    id="drawer_menu.button.order_history"
                                                    defaultMessage="Order History"
                                                />
                                            </Link>

                                            <Link
                                                as={RouteLink}
                                                to={getPathWithLocale('/account/addresses')}
                                                onClick={onClose}
                                                display="block"
                                                py={3}
                                                px={4}
                                                _hover={{bg: 'gray.50'}}
                                            >
                                                <FormattedMessage
                                                    id="drawer_menu.button.addresses"
                                                    defaultMessage="Addresses"
                                                />
                                            </Link>
                                        </VStack>
                                    ) : (
                                        <Link
                                            as={RouteLink}
                                            to={getPathWithLocale('/login')}
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.sign_in"
                                                defaultMessage="Sign In"
                                            />
                                        </Link>
                                    )}

                                    <DrawerSeparator />

                                    {/* Support Links */}
                                    <VStack align="stretch" spacing={4}>
                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.customer_support.contact_us"
                                                defaultMessage="Contact Us"
                                            />
                                        </Link>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.customer_support.shipping_and_returns"
                                                defaultMessage="Shipping & Returns"
                                            />
                                        </Link>

                                        <Text display="block" py={3} px={4}>
                                            <FormattedMessage
                                                id="drawer_menu.link.customer_support"
                                                defaultMessage="Customer Support"
                                            />
                                        </Text>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.about_us"
                                                defaultMessage="About Us"
                                            />
                                        </Link>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.our_company"
                                                defaultMessage="Our Company"
                                            />
                                        </Link>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.terms_and_conditions"
                                                defaultMessage="Terms & Conditions"
                                            />
                                        </Link>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.privacy_policy"
                                                defaultMessage="Privacy Policy"
                                            />
                                        </Link>

                                        <Link
                                            href="/"
                                            onClick={onClose}
                                            display="block"
                                            py={3}
                                            px={4}
                                            _hover={{bg: 'gray.50'}}
                                        >
                                            <FormattedMessage
                                                id="drawer_menu.link.site_map"
                                                defaultMessage="Site Map"
                                            />
                                        </Link>

                                        <Text display="block" py={3} px={4}>
                                            <FormattedMessage
                                                id="drawer_menu.link.privacy_and_security"
                                                defaultMessage="Privacy & Security"
                                            />
                                        </Text>
                                    </VStack>

                                    <DrawerSeparator />
                                </VStack>
                            )}
                        </Drawer.Body>

                        <Drawer.Footer>
                            <SocialIcons />
                        </Drawer.Footer>
                    </Drawer.Content>
                </Drawer.Positioner>
            </Portal>
        </Drawer.Root>
    )
}

DrawerMenu.displayName = 'DrawerMenu'

DrawerMenu.propTypes = {
    /**
     * The opened state of the drawer.
     */
    isOpen: PropTypes.bool,
    /**
     * Function called when the drawer is dismissed.
     */
    onClose: PropTypes.func,
    /**
     * Function called when the drawer logo is clicked.
     */
    onLogoClick: PropTypes.func,
    /**
     * The root category in your commerce cloud back-end.
     */
    root: PropTypes.object
}

export {DrawerMenu}
