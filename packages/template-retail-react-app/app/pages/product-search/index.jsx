import React from 'react'
import {useProductSearch} from '@salesforce/commerce-sdk-react'
import {useState} from 'react'

import Search from '@salesforce/retail-react-app/app/components/search/modified'

const ProductSearch = () => {
    // const {isLoading, data: productSearchResult} = useProductSearch({
    //     parameters: {
    //         q: ''
    //     }
    // })


    const [searchQuery, setSearchQuery] = useState('')
    const {
        isLoading,
        isFetched,
        isRefetching,
        data: productSearchResult
    } = useProductSearch(
        {
            parameters: {
                q: searchQuery
            }
        },
        {
            keepPreviousData: true
        }
    )

    return (
        <div>
            <Search onSearch={(searchText) => {
                setSearchQuery(searchText)
            }} />
            <br />
            <br />
            {isLoading ? 'Loading...' : productSearchResult?.hits?.map(
                product => {
                    console.log(product)
                    return (
                    <div key={product.id}>
                        <div><strong>Product Name:</strong>{product.productName}</div>
                        <div><strong>Product ID:</strong>{product.productId}</div>
                        <br />
                        <br />
                        <hr />
                    </div>
                )}
            )}
        </div>
    )
}

export default ProductSearch
