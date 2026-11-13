"use client"

import ItemsTemplate from "./items"
import Summary from "./summary"
import EmptyCartMessage from "../components/empty-cart-message"
import SignInPrompt from "../components/sign-in-prompt"
import Divider from "@modules/common/components/divider"
import { HttpTypes } from "@medusajs/types"
import { deleteLineItem } from "@lib/data/cart"
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

  // Raw items from server props
  const rawItems = cart?.items || []
  const serverSignature = rawItems.map((i) => `${i.id}_${i.quantity}`).join("|")
  const prevSignatureRef = useRef<string>(serverSignature)

  // 1. Instant 0ms Optimistic Delete Handler for the Cart Page
  const handleOptimisticDelete = async (itemId: string) => {
    // Instantly hide item from items table and recalculate summary in 0ms!
    setDeletedItemIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]))

    try {
      await deleteLineItem(itemId)
      router.refresh()
    } catch (err) {
      console.error("Failed to delete line item on cart page:", err)
      // Rollback on network failure
      setDeletedItemIds((prev) => prev.filter((id) => id !== itemId))
    }
  }

  // When server cart updates from backend, clean up deletedItemIds
  useEffect(() => {
    if (prevSignatureRef.current === serverSignature) return

    setDeletedItemIds((prev) =>
      prev.filter((id) => rawItems.some((item) => item.id === id))
    )

    prevSignatureRef.current = serverSignature
  }, [serverSignature, rawItems])

  // Active Cart Object for 0ms UI update
  const activeCart = useMemo(() => {
    if (!cart) return null

    const activeItems = (cart.items || []).filter(
      (item) => !deletedItemIds.includes(item.id)
    )

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
  }, [cart, deletedItemIds])

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
              <ItemsTemplate cart={activeCart!} onDelete={handleOptimisticDelete} />
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
