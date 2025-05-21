/*
 * Copyright (c) 2022, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */

import React from 'react'
import PropTypes from 'prop-types'
import {Helmet} from 'react-helmet'

import {
    SimpleGrid,
} from '@chakra-ui/react'

import Pagination from '../../components/pagination'
import ProductTile, {Skeleton as ProductTileSkeleton} from '../../components/product-tile'
import Refinements from '../../pages/product-list/partials/refinements'
import CategoryLinks from '../../pages/product-list/partials/category-links'
import SelectedRefinements from '../../pages/product-list/partials/selected-refinements'
import PageHeader from '../../pages/product-list/partials/page-header'
import Sort from './partials/sort'
import {isHydrated} from '../../utils/utils'

import Layout from './layout'
import usePLP from './usePLP'

/*
 * This is a simple product listing page. It displays a paginated list
 * of product hit objects. Allowing for sorting and filtering based on the
 * allowable filters and sort refinements.
 */
const ProductList = (props) => {
    const {
        isLoading,
        isFetched,
        isRefetching,
        data: productSearchResult,
        category,
        addItemToWishlist,
        removeItemFromWishlist,
        toggleFilter,
        resetFilters,
        basePath,
        showNoResults,
        total,
        sortingOptions,
        selectedSortingOptionLabel,
        pageUrls,
        sortUrls,
        limitUrls,
        wishlist,
        sortOpen,
        setSortOpen,
        filtersLoading,
        searchQuery,
        searchParams,
        productListConfig,
        searchConfig,
        isOpen,
        onClose,
        formatMessage
    } = usePLP()

    return (
        <>
            <Helmet>
                <title>{category?.pageTitle ?? searchQuery}</title>
                <meta name="description" content={category?.pageDescription ?? searchQuery} />
                <meta name="keywords" content={category?.pageKeywords} />
                {productSearchResult?.pageMetaTags?.map(({id, value}) => {
                    return <meta name={id} content={value} key={id} />
                })}
            </Helmet>
            <Layout
                components={{
                    pageHeader: (
                        <PageHeader
                            searchQuery={searchQuery}
                            category={category}
                            productSearchResult={productSearchResult}
                            isLoading={isLoading}
                        />
                    ),
                    selectedRefinements: (
                        <SelectedRefinements
                            filters={productSearchResult?.refinements}
                            toggleFilter={toggleFilter}
                            handleReset={resetFilters}
                            selectedFilterValues={productSearchResult?.selectedRefinements}
                        />
                    ),
                    sort: (
                        <Sort
                            sortUrls={sortUrls}
                            productSearchResult={productSearchResult}
                            basePath={basePath}
                        />
                    ),
                    productGrid: (
                        <SimpleGrid
                            columns={[2, 2, 3, 3]}
                            spacingX={4}
                            spacingY={{base: 12, lg: 16}}
                        >
                            {isHydrated() && ((isRefetching && !isFetched) || !productSearchResult)
                                ? new Array(searchParams.limit)
                                      .fill(0)
                                      .map((value, index) => <ProductTileSkeleton key={index} />)
                                : productSearchResult?.hits?.map((productSearchItem) => {
                                      const productId = productSearchItem.productId
                                      const isInWishlist =
                                          !!wishlist?.customerProductListItems?.find(
                                              (item) => item.productId === productId
                                          )

                                      return (
                                          <ProductTile
                                              data-testid={`sf-product-tile-${productSearchItem.productId}`}
                                              key={productSearchItem.productId}
                                              product={productSearchItem}
                                              enableFavourite={true}
                                              isFavourite={isInWishlist}
                                              isRefreshingData={isRefetching && isFetched}
                                              imageViewType={productListConfig.imageViewType}
                                              selectableAttributeId={
                                                  productListConfig.selectableAttributeId
                                              }
                                              onClick={() => {
                                                  if (searchQuery) {
                                                      einstein.sendClickSearch(
                                                          searchQuery,
                                                          productSearchItem
                                                      )
                                                  } else if (category) {
                                                      einstein.sendClickCategory(
                                                          category,
                                                          productSearchItem
                                                      )
                                                  }
                                              }}
                                              onFavouriteToggle={(toBeFavourite) => {
                                                  const action = toBeFavourite
                                                      ? addItemToWishlist
                                                      : removeItemFromWishlist
                                                  return action(productSearchItem)
                                              }}
                                              dynamicImageProps={{
                                                  widths: ['50vw', '50vw', '20vw', '20vw', '25vw']
                                              }}
                                          />
                                      )
                                  })}
                        </SimpleGrid>
                    ),
                    refinements: (
                        <Refinements
                            itemsBefore={
                                category?.categories
                                    ? [<CategoryLinks key="itemsBefore" category={category} />]
                                    : undefined
                            }
                            isLoading={filtersLoading}
                            toggleFilter={toggleFilter}
                            filters={productSearchResult?.refinements}
                            excludedFilters={['cgid']}
                            selectedFilters={searchParams.refine}
                        />
                    ),
                    paginator: <Pagination currentURL={basePath} urls={pageUrls} />
                }}
            />
        </>
    )
}

ProductList.getTemplateName = () => 'product-list'

ProductList.propTypes = {
    onAddToWishlistClick: PropTypes.func,
    onRemoveWishlistClick: PropTypes.func,
    category: PropTypes.object
}

export default ProductList