import {getUpdateBundleChildArray} from './product-utils'
import {useShopperBasketsMutationHelper} from '@salesforce/commerce-sdk-react'
/**
 * Returns a handler for adding products to the cart, encapsulating logic for single, set, and bundle products.
 * @param {Object} params - Dependencies and state from the UI.
 * @returns {Function} - The handler to be used in the UI.
 */
export function getAddToCartHandler({
    product,
    childProductSelection,
    updateItemsInBasketMutation,
    einstein,
    showError
}) {
    const {addItemToNewOrExistingBasket} = useShopperBasketsMutationHelper()
    return async function handleAddToCart({variant, quantity} = {}) {
        if (product?.type?.set) {
            // Get all the selected products, and pass them to the addToCart handler which
            // accepts an array.
            const productSelectionValues = Object.values(childProductSelection)
            return baseAddToCart(productSelectionValues)
        } else if (product?.type?.bundle) {
            const childProductSelections = Object.values(childProductSelection)
            const productItems = [
                {
                    productId: product.id,
                    price: product.price,
                    quantity: quantity,
                    // The add item endpoint in the shopper baskets API does not respect variant selections
                    // for bundle children, so we have to make a follow up call to update the basket
                    // with the chosen variant selections
                    bundledProductItems: childProductSelections.map((child) => ({
                        productId: child.variant.productId,
                        quantity: child.quantity
                    }))
                }
            ]
            try {
                const res = await addItemToNewOrExistingBasket(productItems)
                const bundleChildMasterIds = childProductSelections.map((child) => child.product.id)
                // since the returned data includes all products in basket
                // here we compare list of productIds in bundleProductItems of each productItem to filter out the
                // current bundle that was last added into cart

                const currentBundle = res.productItems.find((productItem) => {
                    if (!productItem.bundledProductItems?.length) return
                    const bundleChildIds = productItem.bundledProductItems?.map((item) =>
                         // seek out the bundle child that still uses masterId as product id
                        item.productId
                    )
                    return bundleChildIds.every((id) => bundleChildMasterIds.includes(id))
                })
                const itemsToBeUpdated = getUpdateBundleChildArray(currentBundle, childProductSelections)
                if (itemsToBeUpdated.length) {
                    // make a follow up call to update child variant selection for product bundle
                    // since add item endpoint doesn't currently consider product bundle child variants
                    await updateItemsInBasketMutation.mutateAsync({
                        method: 'PATCH',
                        parameters: {basketId: res.basketId},
                        body: itemsToBeUpdated
                    })
                }
                einstein.sendAddToCart(productItems)
                return childProductSelections
            } catch (error) {
                showError(error)
            }
        } else {
            // Single product
            const productSelectionValues = [{product, variant, quantity}]
            return baseAddToCart(productSelectionValues)
        }

        async function baseAddToCart(productSelectionValues) {
            try {
                const productItems = productSelectionValues.map(({variant, quantity}) => ({
                    productId: variant.productId,
                    price: variant.price,
                    quantity
                }))
                await addItemToNewOrExistingBasket(productItems)
                einstein.sendAddToCart(productItems)
                return productSelectionValues
            } catch (error) {
                showError(error)
            }
        }
    }
} 