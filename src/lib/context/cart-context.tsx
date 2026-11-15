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
      const keys = [detail.variantId, detail.handle].filter(Boolean)
      if (keys.length > 0) {
        setQuantities((prev) => {
          const next = { ...prev }
          for (const k of keys) {
            next[k] = (next[k] || 0) + (detail.quantity || 1)
          }
          return next
        })
      }
    }

    const handleDecremented = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const keys = [detail.variantId, detail.handle].filter(Boolean)
      if (keys.length > 0) {
        setQuantities((prev) => {
          const next = { ...prev }
          for (const k of keys) {
            next[k] = Math.max(0, (next[k] || 0) - 1)
          }
          return next
        })
      }
    }

    const handleDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const keys = [detail.variantId, detail.handle].filter(Boolean)
      if (keys.length > 0) {
        setQuantities((prev) => {
          const next = { ...prev }
          for (const k of keys) {
            next[k] = 0
          }
          return next
        })
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
