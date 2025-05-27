/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import React, {useRef, useState} from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import {
    Box,
    Button,
    ButtonGroup,
    Container,
    Flex,
    HStack,
    IconButton,
    Popover,
    PopoverBody,
    PopoverContent,
    PopoverTrigger,
    Spacer,
    useBreakpointValue,
    useDisclosure
} from '@chakra-ui/react'
import {AuthHelpers, useAuthHelper, useCustomerType} from '@salesforce/commerce-sdk-react'
import {
    useApplicationExtension,
    useApplicationExtensionsStore
} from '@salesforce/pwa-kit-extension-sdk/react'

import {useCurrentBasket} from '../../hooks/use-current-basket'
import {useCurrentCustomer} from '../../hooks/use-current-customer'
import {useNavigation} from '../../hooks/use-navigation'
import {useSearchSuggestions} from '../../hooks/use-search-suggestions'

import Link from '../../components/link'
import Search from '../../components/search'
import withRegistration from '../../components/with-registration'
import {
    AccountIcon,
    BrandLogo,
    BasketIcon,
    HamburgerIcon,
    ChevronDownIcon,
    HeartIcon,
    SignoutIcon,
    StoreIcon,
    UserIcon
} from '../../components/icons'

import {navLinks, messages} from '../../pages/account/constant'
import LoadingSpinner from '../../components/loading-spinner'
import {HideOnDesktop, HideOnMobile} from '../../components/responsive'
import {isHydrated, noop} from '../../utils/utils'

import {AuthModal, useAuthModal} from '../../hooks/use-auth-modal'

import DrawerMenu from '../drawer-menu'
import ListMenu from '../list-menu'
import LocaleSelector from '../locale-selector'

const IconButtonWithRegistration = withRegistration(IconButton)

/**
 * Search bar for the header.
 *
 * The search bar is a simple input field with a search icon.
 * It can be used to search for products or navigate to a
 * specific page.
 *
 * @param props {object} the component props
 * @returns {Element} the search bar element
 */
const SearchBar = (props) => {
    const intl = useIntl()
    const placeholder = intl.formatMessage({
        id: 'header.field.placeholder.search_for_products',
        defaultMessage: 'Search for products...'
    })
    return (
        <Box>
            <Search aria-label={placeholder} placeholder={placeholder} {...props} />
        </Box>
    )
}

/**
 * The header is the main source for accessing
 * navigation, search, basket, and other
 * important information and actions. It persists
 * on the top of your application and will
 * respond to changes in device size.
 *
 * To customize the styles, update the themes
 * in theme/components/project/header.js
 * @param  props
 * @param   {func} props.onMenuClick click event handler for menu button
 * @param   {func} props.onLogoClick click event handler for menu button
 * @param   {object} props.searchInputRef reference of the search input
 * @param   {func} props.onMyAccountClick click event handler for my account button
 * @param   {func} props.onMyCartClick click event handler for my cart button
 * @return  {React.ReactElement} - Header component
 */
const Header = ({
    children,
    onMenuClick = noop,
    onLogoClick = noop,
    onMyAccountClick = noop,
    onMyCartClick = noop,
    onWishlistClick = noop,
    ...props
}) => {
    const intl = useIntl()
    const popoverTriggerRef = useRef(null)
    const {
        derivedData: {totalItems},
        data: basket
    } = useCurrentBasket()
    const {isRegistered} = useCustomerType()
    const logout = useAuthHelper(AuthHelpers.Logout)
    const navigate = useNavigation()
    const {
        getButtonProps: getAccountMenuButtonProps,
        getDisclosureProps: getAccountMenuDisclosureProps,
        isOpen: isAccountMenuOpen,
        onClose: onAccountMenuClose,
        onOpen: onAccountMenuOpen
    } = useDisclosure()
    const {data: customer} = useCurrentCustomer()
    const authModal = useAuthModal()
    const {
        suggestions,
        searchInputRef,
        isLoading: isSuggestionsLoading,
        clearSuggestions
    } = useSearchSuggestions()
    const [showLoading, setShowLoading] = useState(false)
    // tracking if users enter the popover Content,
    // so we can decide whether to close the menu when users leave account icons
    const hasEnterPopoverContent = useRef()

    const keyMap = useBreakpointValue({
        base: 'mobile',
        md: 'desktop'
    })

    const storeLocatorExtension = useApplicationExtension(
        '@salesforce/extension-chakra-store-locator'
    )
    const isStoreLocatorEnabled = !!storeLocatorExtension && storeLocatorExtension.isEnabled
    const openModal = useApplicationExtensionsStore((state) => {
        return state.state['@salesforce/extension-chakra-store-locator']?.openModal || noop
    })

    const onSignoutClick = async () => {
        setShowLoading(true)
        await logout.mutateAsync()
        navigate('/login')
        setShowLoading(false)
    }

    const handleIconsMouseLeave = () => {
        // don't close the menu if users enter the popover content
        setTimeout(() => {
            if (!hasEnterPopoverContent.current) onAccountMenuClose()
        }, 100)
    }

    const handleKeyDown = (event) => {
        if (event.key === 'Tab' && event.shiftKey && isAccountMenuOpen) {
            // Prevent default behavior to keep focus on the popup trigger
            event.preventDefault()
            popoverTriggerRef.current.focus()
        }
    }

    return (
        <Box as="header" width="full" borderBottom="1px" borderColor="gray.100" {...props}>
            <Container maxWidth="container.xxxl" paddingInlineStart={4} paddingInlineEnd={4}>
                <Flex align="center" wrap="wrap">
                    {/* Logo */}
                    <IconButton
                        aria-label={intl.formatMessage({
                            id: 'header.button.assistive_msg.logo',
                            defaultMessage: 'Logo'
                        })}
                        icon={<BrandLogo />}
                        variant="unstyled"
                        colorScheme="black"
                        onClick={() => navigate('/')}
                    />

                    <HideOnMobile>
                        <Box paddingLeft={8}>
                            <ListMenu />
                        </Box>
                    </HideOnMobile>

                    <Spacer />

                    <Flex align="center">
                        <HideOnMobile>
                            <Search
                                ref={searchInputRef}
                                suggestions={suggestions}
                                isLoading={isSuggestionsLoading}
                                onClear={clearSuggestions}
                                placeholder={intl.formatMessage({
                                    id: 'header.field.placeholder.search_for_products',
                                    defaultMessage: 'Search for products...'
                                })}
                            />
                        </HideOnMobile>

                        <HStack spacing={1}>
                            <HideOnDesktop>
                                <IconButton
                                    aria-label={intl.formatMessage({
                                        id: 'header.button.assistive_msg.menu',
                                        defaultMessage: 'Menu'
                                    })}
                                    icon={<HamburgerIcon />}
                                    variant="ghost"
                                    onClick={onMenuClick}
                                />
                            </HideOnDesktop>

                            {/* Account Menu */}
                            <Box>
                                {customer.isRegistered ? (
                                    <Popover placement="bottom-end">
                                        <PopoverTrigger>
                                            <Button
                                                aria-label={intl.formatMessage({
                                                    id: 'header.button.assistive_msg.my_account_menu',
                                                    defaultMessage: 'Open account menu'
                                                })}
                                                variant="ghost"
                                                colorScheme="black"
                                                rightIcon={<ChevronDownIcon />}
                                            >
                                                <UserIcon />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent>
                                            <PopoverBody>
                                                <ButtonGroup
                                                    variant="ghost"
                                                    colorScheme="black"
                                                    spacing={0}
                                                    flexDirection="column"
                                                    alignItems="flex-start"
                                                >
                                                    <Button
                                                        width="full"
                                                        onClick={() => navigate('/account')}
                                                        justifyContent="flex-start"
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'header.popover.title.my_account',
                                                            defaultMessage: 'My Account'
                                                        })}
                                                    </Button>
                                                    <Button
                                                        width="full"
                                                        onClick={() => authModal.onSignOut()}
                                                        justifyContent="flex-start"
                                                    >
                                                        {intl.formatMessage({
                                                            id: 'header.popover.action.log_out',
                                                            defaultMessage: 'Log out'
                                                        })}
                                                    </Button>
                                                </ButtonGroup>
                                            </PopoverBody>
                                        </PopoverContent>
                                    </Popover>
                                ) : (
                                    <Button
                                        aria-label={intl.formatMessage({
                                            id: 'header.button.assistive_msg.my_account',
                                            defaultMessage: 'My account'
                                        })}
                                        variant="ghost"
                                        colorScheme="black"
                                        onClick={authModal.onOpen}
                                    >
                                        <UserIcon />
                                    </Button>
                                )}
                            </Box>

                            {/* Wishlist */}
                            <IconButton
                                aria-label={intl.formatMessage({
                                    id: 'header.button.assistive_msg.wishlist',
                                    defaultMessage: 'Wishlist'
                                })}
                                icon={<UserIcon />}
                                variant="ghost"
                                onClick={() => navigate('/account/wishlist')}
                            />

                            {/* Cart */}
                            <Button
                                aria-label={intl.formatMessage(
                                    {
                                        id: 'header.button.assistive_msg.my_cart_with_num_items',
                                        defaultMessage: 'My cart, number of items: {numItems}'
                                    },
                                    {numItems: basket?.itemAccumulatedCount || 0}
                                )}
                                variant="ghost"
                                colorScheme="black"
                                onClick={() => navigate('/cart')}
                                position="relative"
                            >
                                <BasketIcon />
                                {basket?.itemAccumulatedCount > 0 && (
                                    <Box
                                        position="absolute"
                                        top="-2px"
                                        right="-2px"
                                        minWidth="20px"
                                        height="20px"
                                        borderRadius="full"
                                        backgroundColor="red.500"
                                        color="white"
                                        fontSize="xs"
                                        display="flex"
                                        alignItems="center"
                                        justifyContent="center"
                                    >
                                        {basket.itemAccumulatedCount}
                                    </Box>
                                )}
                            </Button>

                            <HideOnMobile>
                                <LocaleSelector />
                            </HideOnMobile>
                        </HStack>
                    </Flex>
                </Flex>

                <HideOnMobile>
                    <Search
                        ref={searchInputRef}
                        suggestions={suggestions}
                        isLoading={isSuggestionsLoading}
                        onClear={clearSuggestions}
                        placeholder={intl.formatMessage({
                            id: 'header.field.placeholder.search_for_products',
                            defaultMessage: 'Search for products...'
                        })}
                        marginTop={4}
                    />
                </HideOnMobile>
            </Container>

            <DrawerMenu isOpen={isAccountMenuOpen} onClose={onAccountMenuClose} />
            <AuthModal {...authModal} />
        </Box>
    )
}

Header.propTypes = {
    children: PropTypes.node,
    onMenuClick: PropTypes.func,
    onLogoClick: PropTypes.func,
    onMyAccountClick: PropTypes.func,
    onWishlistClick: PropTypes.func,
    onMyCartClick: PropTypes.func,
    searchInputRef: PropTypes.oneOfType([
        PropTypes.func,
        PropTypes.shape({current: PropTypes.elementType})
    ])
}

export default withRegistration(Header)
