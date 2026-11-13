"use client"

import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { deleteLineItem, updateLineItem } from "@lib/data/cart"
import { useRouter } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"

const CartTemplate = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const router = useRouter()
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([])
  const [quantities, setQuantities] = useState<Record<string, number>>({})

  // Raw items from server props
  const rawItems = cart?.items || []
  const serverSignature = rawItems.map((i) => `${i.id}_${i.quantity}`).join("|")
  const prevSignatureRef = useRef<string>(serverSignature)

  // 1. Instant 0ms Optimistic Delete Handler for the Cart Page
  const handleOptimisticDelete = async (itemId: string) => {
    // Instantly hide item from items table and recalculate summary in 0ms!
    setDeletedItemIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]))

    // Instantly notify header CartDropdown & cart badge count
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:item-deleted", {
          detail: { id: itemId },
        })
      )
    }

    try {
      await deleteLineItem(itemId)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete line item on cart page:", err)
      // Rollback on network failure
      setDeletedItemIds((prev) => prev.filter((id) => id !== itemId))
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-delete-failed", {
            detail: { id: itemId },
          })
        )
      }
    }
  }

  // 2. Instant 0ms Optimistic Quantity Update Handler for the Cart Page
  const handleOptimisticQuantity = async (itemId: string, newQuantity: number) => {
    // Instantly update dropdown value, row price, and summary subtotal in 0ms!
    setQuantities((prev) => ({ ...prev, [itemId]: newQuantity }))

    // Instantly notify header CartDropdown & cart badge count
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:quantity-updated", {
          detail: { id: itemId, quantity: newQuantity },
        })
      )
    }

    try {
      await updateLineItem({
        lineId: itemId,
        quantity: newQuantity,
      })
      router.refresh()
    } catch (err) {
      console.error("Failed to update quantity on cart page:", err)
      // Rollback on network failure
      setQuantities((prev) => {
        const copy = { ...prev }
        delete copy[itemId]
        return copy
      })
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:quantity-update-failed", {
            detail: { id: itemId },
          })
        )
      }
      throw err
    }
  }

  // When server cart updates from backend, clean up deletedItemIds and matched quantities
  useEffect(() => {
    if (prevSignatureRef.current === serverSignature) return

    setDeletedItemIds((prev) =>
      prev.filter((id) => rawItems.some((item) => item.id === id))
    )

    setQuantities((prev) => {
      const next = { ...prev }
      for (const [id, qty] of Object.entries(prev)) {
        const srv = rawItems.find((i) => i.id === id)
        if (srv && srv.quantity === qty) {
          delete next[id]
        }
      }
      return next
    })

    prevSignatureRef.current = serverSignature
  }, [serverSignature, rawItems])

  // Active Cart Object for 0ms UI update across items table & summary
  const activeCart = useMemo(() => {
    if (!cart) return null

    const activeItems = (cart.items || [])
      .filter((item) => !deletedItemIds.includes(item.id))
      .map((item) => {
        const qty = quantities[item.id] ?? item.quantity
        const subtotal = item.unit_price * qty
        return {
          ...item,
          quantity: qty,
          subtotal,
          total: subtotal,
        }
      })

    const subtotal = activeItems.reduce(
      (acc, item) => acc + item.unit_price * item.quantity,
      0
    )

    return {
      ...cart,
      items: activeItems,
      subtotal,
      total: subtotal,
      raw_subtotal: { value: String(subtotal), precision: 20 },
      raw_total: { value: String(subtotal), precision: 20 },
      original_subtotal: subtotal,
      original_total: subtotal,
    } as HttpTypes.StoreCart
  }, [cart, deletedItemIds, quantities])

  const hasItems = (activeCart?.items?.length ?? 0) > 0

  return (
    <div className="py-12">
      <div className="content-container" data-testid="cart-container">
        {hasItems ? (
          <div className="grid grid-cols-1 small:grid-cols-[1fr_360px] gap-x-40">
            <div className="flex flex-col bg-white py-6 gap-y-6">
              {!customer && (
                <>
                  <SignInPrompt />
                  <Divider />
                </>
              )}
              <ItemsTemplate
                cart={activeCart!}
                onDelete={handleOptimisticDelete}
                onUpdateQuantity={handleOptimisticQuantity}
              />
            </div>
            <div className="relative">
              <div className="flex flex-col gap-y-8 sticky top-12">
                {activeCart && activeCart.region && (
                  <div className="bg-white py-6">
                    <Summary cart={activeCart as any} />
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div>
            <EmptyCartMessage />
          </div>
        )}
      </div>
    </div>
  )
}

export default CartTemplate
