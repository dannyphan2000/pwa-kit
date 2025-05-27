/*
 * Copyright (c) 2021, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {useIntl} from 'react-intl'
import {Link as RouteLink, useHistory} from 'react-router-dom'

// Components
import {
    Button,
    Flex,
    Text
    // Note: Select component needs to be migrated to v3 compound pattern
    // For now, we'll use a simple approach without Select
} from '@chakra-ui/react'

// Icons
import {ChevronLeftIcon, ChevronRightIcon} from '../../components/icons'

// Constants
const SELECT_ID = 'pagination'

/**
 * The pagination component is a simple component allowing you to navigate
 * from one page  to the next by means of previous or next buttons, or directly
 * using a select drop down.
 */
const Pagination = (props) => {
    const intl = useIntl()
    const history = useHistory()
    const {urls, currentURL, ...rest} = props

    const currentIndex = urls.indexOf(currentURL) > 0 ? urls.indexOf(currentURL) : 0
    const prev = urls[currentIndex - 1]
    const next = urls[currentIndex + 1]

    // Determine the current page index.
    return (
        <Flex
            data-testid="sf-pagination"
            className="sf-pagination"
            justifyContent="center"
            alignItems="center"
            {...rest}
        >
            {/* Previous Button */}
            <Button
                fontSize="sm"
                as={RouteLink}
                // Because we are using a button component as a link, the isDisabled flag isn't working
                // as intended, the workaround is to use the current url when its disabled.
                href={prev || currentURL}
                to={prev || currentURL}
                aria-label={intl.formatMessage({
                    id: 'pagination.link.prev.assistive_msg',
                    defaultMessage: 'Previous Page'
                })}
                aria-disabled={!prev}
                variant="link"
                isDisabled={!prev}
            >
                <ChevronLeftIcon />
                <Text>
                    {intl.formatMessage({
                        id: 'pagination.link.prev',
                        defaultMessage: 'Prev'
                    })}
                </Text>
            </Button>

            {/* Direct Page Selection - Simplified for Chakra UI v3 compatibility */}
            <Flex paddingLeft={4} paddingRight={4} alignItems="center">
                {/* TODO: Migrate to Chakra UI v3 Select compound component pattern in separate PR */}
                {/* For now, showing simple page indicator */}
                <Text fontSize="sm" fontWeight="normal">
                    {intl.formatMessage(
                        {
                            id: 'pagination.current_page_info',
                            defaultMessage: 'Page {currentPage} of {totalPages}'
                        },
                        {
                            currentPage: currentIndex + 1,
                            totalPages: urls.length
                        }
                    )}
                </Text>
            </Flex>

            {/* Next Button */}
            <Button
                fontSize="sm"
                as={RouteLink}
                // Because we are using a button component as a link, the isDisabled flag isn't working
                // as intended, the workaround is to use the current url when its disabled.
                href={next || currentURL}
                to={next || currentURL}
                aria-label={intl.formatMessage({
                    id: 'pagination.link.next.assistive_msg',
                    defaultMessage: 'Next Page'
                })}
                aria-disabled={!next}
                variant="link"
                isDisabled={!next}
            >
                <Text>
                    {intl.formatMessage({
                        id: 'pagination.link.next',
                        defaultMessage: 'Next'
                    })}
                </Text>
                <ChevronRightIcon />
            </Button>
        </Flex>
    )
}

Pagination.displayName = 'Pagination'

Pagination.propTypes = {
    /**
     * A list of URL's representing the pages that can be navigated to.
     */
    urls: PropTypes.array.isRequired,
    /**
     * The URL representing the current page
     */
    currentURL: PropTypes.string
}

export default Pagination
