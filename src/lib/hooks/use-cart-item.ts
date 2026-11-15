"use client"

import { useCallback } from "react"
import { useCartContext } from "@lib/context/cart-context"

export function useCartItem(variantId?: string, productHandle?: string) {
  const { quantities, setQuantity } = useCartContext()

  const quantity =
    (variantId && quantities[variantId]) ||
    (productHandle && quantities[productHandle]) ||
    0

  const updateQuantity = useCallback(
    (newQty: number) => {
      if (variantId) setQuantity(variantId, newQty)
      if (productHandle) setQuantity(productHandle, newQty)
    },
    [variantId, productHandle, setQuantity]
  )

  return { quantity, setQuantity: updateQuantity }
}
