/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/BSD-3-Clause
 */
import {
    useCustomerId,
    useCustomerBaskets,
    useShopperBasketsMutation,
    useCustomerType
} from '@salesforce/commerce-sdk-react'
import {isServer} from '@salesforce/retail-react-app/app/utils/utils'
import {useEffect, useRef} from 'react'
import {usePrevious} from '@chakra-ui/react'

/**
 * This hook combine some commerce-react-sdk hooks to provide more derived data for Retail App baskets
 * @param id - basket id to get the current used basket among baskets returned, use first basket in the array if not defined
 * @param shouldFetchProductDetail - boolean to indicate if the baskets should fetch product details based on basket items
 */
export const useCurrentBasket = ({id = '', setShouldMergeBasket, shouldMergeBasket} = {}) => {
    const customerId = useCustomerId()
    const basketMerged = useRef(false)
    const {customerType, isRegistered} = useCustomerType()
    const prevAuthType = usePrevious(customerType)
    const prevCustomerId = usePrevious(customerId)

    const mergeBasket = useShopperBasketsMutation('mergeBasket')
    const {data: basketsData, ...restOfQuery} = useCustomerBaskets(
        {parameters: {customerId}},
        {
            enabled: !!customerId && !isServer,
            onSuccess: async () => {
                console.log('onSuccess useCustomerBaskets')
                if (shouldMergeBasket) {
                    console.log('shouldMerge', shouldMergeBasket)
                    console.log('-----calling merge basket------------------')
                    await mergeBasket.mutateAsync({
                        headers: {
                            // This is not required since the request has no body
                            // but CommerceAPI throws a '419 - Unsupported Media Type' error if this header is removed.
                            'Content-Type': 'application/json'
                        },
                        parameters: {
                            createDestinationBasket: true
                        }
                    })
                    setShouldMergeBasket(false)
                }
            }
        }
    )

    const currentBasket =
        basketsData?.baskets?.find((basket) => basket?.basketId === id) || basketsData?.baskets?.[0]

    return {
        ...restOfQuery,
        data: currentBasket,
        derivedData: {
            hasBasket: basketsData?.total > 0,
            totalItems:
                currentBasket?.productItems?.reduce((acc, item) => acc + item.quantity, 0) || 0
        }
    }
}
