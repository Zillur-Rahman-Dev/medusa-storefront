"use client"

import { useState, useEffect } from "react"

export function useCartItem(variantId?: string, productHandle?: string) {
  const [quantity, setQuantity] = useState<number>(() => {
    if (typeof window === "undefined") return 0
    try {
      const winMap = (window as any).__CART_MAP__
      if (winMap) {
        if (variantId && winMap[variantId]) return winMap[variantId].quantity
        if (productHandle && winMap[productHandle]) return winMap[productHandle].quantity
      }
      const raw = sessionStorage.getItem("medusa_cart_map")
      if (raw) {
        const parsed = JSON.parse(raw)
        if (variantId && parsed[variantId]) return parsed[variantId].quantity
        if (productHandle && parsed[productHandle]) return parsed[productHandle].quantity
      }
    } catch (e) {}
    return 0
  })

  // Listen to sync events from CartDropdown, Cart Page, and other product cards
  useEffect(() => {
    const handleSync = (e: Event) => {
      const map = (e as CustomEvent).detail || {}
      let foundQty = 0
      if (variantId && map[variantId]) {
        foundQty = map[variantId].quantity
      } else if (productHandle && map[productHandle]) {
        foundQty = map[productHandle].quantity
      }
      setQuantity(foundQty)
    }

    const handleAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (
        (variantId && detail.variantId === variantId) ||
        (productHandle && detail.handle === productHandle)
      ) {
        setQuantity((prev) => prev + (detail.quantity || 1))
      }
    }

    const handleDecremented = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (
        (variantId && detail.variantId === variantId) ||
        (productHandle && detail.handle === productHandle)
      ) {
        setQuantity((prev) => Math.max(0, prev - 1))
      }
    }

    const handleDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (
        (variantId && detail.variantId === variantId) ||
        (productHandle && detail.handle === productHandle)
      ) {
        setQuantity(0)
      }
    }

    const handleQtyUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (
        (variantId && detail.variantId === variantId) ||
        (productHandle && detail.handle === productHandle)
      ) {
        if (typeof detail.quantity === "number") {
          setQuantity(detail.quantity)
        }
      }
    }

    window.addEventListener("cart:sync-state", handleSync)
    window.addEventListener("cart:item-added", handleAdded)
    window.addEventListener("cart:item-decremented", handleDecremented)
    window.addEventListener("cart:item-deleted", handleDeleted)
    window.addEventListener("cart:quantity-updated", handleQtyUpdated)

    return () => {
      window.removeEventListener("cart:sync-state", handleSync)
      window.removeEventListener("cart:item-added", handleAdded)
      window.removeEventListener("cart:item-decremented", handleDecremented)
      window.removeEventListener("cart:item-deleted", handleDeleted)
      window.removeEventListener("cart:quantity-updated", handleQtyUpdated)
    }
  }, [variantId, productHandle])

  return { quantity, setQuantity }
}
