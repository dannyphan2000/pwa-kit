import {getUpdateBundleChildArray} from './product-utils'

/**
 * Returns a handler for adding products to the cart, encapsulating logic for single, set, and bundle products.
 * @param {Object} params - Dependencies and state from the UI.
 * @returns {Function} - The handler to be used in the UI.
 */
export function getAddToCartHandler({
    product,
    childProductSelection,
    addItemToNewOrExistingBasket,
    updateItemsInBasketMutation,
    einstein,
    showError
}) {
    return async function handleAddToCart({variant, quantity, selectedQuantity} = {}) {
        if (product?.type?.set) {
            // Set logic
            const productSelectionValues = Object.values(childProductSelection)
            return baseAddToCart(productSelectionValues)
        } else if (product?.type?.bundle) {
            // Bundle logic
            const childProductSelections = Object.values(childProductSelection)
            const productItems = [
                {
                    productId: product.id,
                    price: product.price,
                    quantity: selectedQuantity,
                    bundledProductItems: childProductSelections.map((child) => ({
                        productId: child.variant.productId,
                        quantity: child.quantity
                    }))
                }
            ]
            try {
                const res = await addItemToNewOrExistingBasket(productItems)
                // ...bundle update logic...
                const bundleChildMasterIds = childProductSelections.map((child) => child.product.id)
                const currentBundle = res.productItems.find((productItem) => {
                    if (!productItem.bundledProductItems?.length) return
                    const bundleChildIds = productItem.bundledProductItems?.map((item) => item.productId)
                    return bundleChildIds.every((id) => bundleChildMasterIds.includes(id))
                })
                const itemsToBeUpdated = getUpdateBundleChildArray(currentBundle, childProductSelections)
                if (itemsToBeUpdated.length) {
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
            // Single product logic
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