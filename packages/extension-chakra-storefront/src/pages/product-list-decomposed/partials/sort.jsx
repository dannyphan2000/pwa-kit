import React from 'react'
import {FormControl, Select} from '@chakra-ui/react'
import {useIntl} from 'react-intl'
import {useHistory} from 'react-router-dom'
import PropTypes from 'prop-types'

const Sort = ({sortUrls, productSearchResult, basePath, ...otherProps}) => {
    const intl = useIntl()
    const history = useHistory()

    return (
        <FormControl
            aria-label={intl.formatMessage({
                id: 'product_list.drawer.title.sort_by',
                defaultMessage: 'Sort By'
            })}
            data-testid="sf-product-list-sort"
            id="page_sort"
            width="auto"
            {...otherProps}
        >
            <Select
                id="sf-product-list-sort-select"
                aria-label={intl.formatMessage({
                    id: 'product_list.sort_by.label.assistive_msg',
                    defaultMessage: 'Sort products by'
                })}
                value={basePath.replace(/(offset)=(\d+)/i, '$1=0')}
                onChange={({target}) => {
                    history.push(target.value)
                }}
                height={11}
                width="240px"
            >
                {sortUrls.map((href, index) => (
                    <option key={href} value={href}>
                        {intl.formatMessage(
                            {
                                id: 'product_list.select.sort_by',
                                defaultMessage: 'Sort By: {sortOption}'
                            },
                            {
                                sortOption: productSearchResult?.sortingOptions[index]?.label
                            }
                        )}
                    </option>
                ))}
            </Select>
        </FormControl>
    )
}

Sort.propTypes = {
    sortUrls: PropTypes.array,
    productSearchResult: PropTypes.object,
    basePath: PropTypes.string
}

export default Sort