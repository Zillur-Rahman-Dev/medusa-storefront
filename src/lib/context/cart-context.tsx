"use client"

import React, { createContext, useContext, useState, useEffect, useCallback } from "react"

type CartContextType = {
  quantities: Record<string, number>
  setQuantity: (key: string, qty: number) => void
}

const CartContext = createContext<CartContextType>({
  quantities: {},
  setQuantity: () => {},
})

export function CartProvider({
  children,
  initialItems = {},
}: {
  children: React.ReactNode
  initialItems?: Record<string, number>
}) {
  const [quantities, setQuantities] = useState<Record<string, number>>(initialItems)

  // Listen to global cart events from CartDropdown and other cards
  useEffect(() => {
    const handleSync = (e: Event) => {
      const map = (e as CustomEvent).detail || {}
      const next: Record<string, number> = {}
      for (const [k, v] of Object.entries(map)) {
        next[k] = (v as any).quantity ?? 0
      }
      setQuantities(next)
    }

    const handleAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const key = detail.variantId || detail.handle
      if (key) {
        setQuantities((prev) => ({
          ...prev,
          [key]: (prev[key] || 0) + (detail.quantity || 1),
        }))
      }
    }

    const handleDecremented = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const key = detail.variantId || detail.handle
      if (key) {
        setQuantities((prev) => ({
          ...prev,
          [key]: Math.max(0, (prev[key] || 0) - 1),
        }))
      }
    }

    const handleDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const key = detail.variantId || detail.handle
      if (key) {
        setQuantities((prev) => ({
          ...prev,
          [key]: 0,
        }))
      }
    }

    window.addEventListener("cart:sync-state", handleSync)
    window.addEventListener("cart:item-added", handleAdded)
    window.addEventListener("cart:item-decremented", handleDecremented)
    window.addEventListener("cart:item-deleted", handleDeleted)

    return () => {
      window.removeEventListener("cart:sync-state", handleSync)
      window.removeEventListener("cart:item-added", handleAdded)
      window.removeEventListener("cart:item-decremented", handleDecremented)
      window.removeEventListener("cart:item-deleted", handleDeleted)
    }
  }, [])

  const setItemQuantity = useCallback((key: string, qty: number) => {
    setQuantities((prev) => ({ ...prev, [key]: qty }))
  }, [])

  return (
    <CartContext.Provider value={{ quantities, setQuantity: setItemQuantity }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCartContext() {
  return useContext(CartContext)
}
