"use client"

import { useCallback } from "react"
import { useCartContext } from "@lib/context/cart-context"

export function useCartItem(variantId?: string, productHandle?: string) {
  const { quantities, setQuantity } = useCartContext()

  // Strict Variant Matching: If variantId is provided, check ONLY that variantId!
  // Do NOT fall back to productHandle which would pollute other variants of the same product.
  const quantity = variantId
    ? (quantities[variantId] || 0)
    : (productHandle ? (quantities[productHandle] || 0) : 0)

  const updateQuantity = useCallback(
    (newQty: number) => {
      if (variantId) {
        setQuantity(variantId, newQty)
      } else if (productHandle) {
        setQuantity(productHandle, newQty)
      }
    },
    [variantId, productHandle, setQuantity]
  )

  return { quantity, setQuantity: updateQuantity }
}
