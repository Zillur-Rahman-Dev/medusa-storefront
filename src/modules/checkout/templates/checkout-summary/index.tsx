"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatPrice, formatSize } from "@lib/util/money"
import { Minus, Plus, Trash2, Tag } from "lucide-react"

export type CheckoutItem = {
  id: string
  lineId?: string
  variantId?: string
  title: string
  product_handle?: string
  thumbnail?: string | null
  images?: any[]
  variantTitle?: string
  quantity: number
  unit_price: number
  total: number
  raw?: any
}

const CheckoutSummary = ({ cart }: { cart: any }) => {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"

  // 1. Initial items mapped from server cart (Server-First metadata priority)
  const initialItems: CheckoutItem[] = useMemo(() => {
    return (cart?.items || []).map((item: any) => ({
      id: item.id,
      lineId: item.id,
      variantId: item.variant_id || item.variant?.id,
      title: item.variant?.product?.title || item.product_title || item.title || "খাঁটি প্রাকৃতিক মধু",
      product_handle: item.variant?.product?.handle || item.product_handle,
      thumbnail: item.thumbnail || item.variant?.product?.thumbnail,
      images: item.variant?.product?.images,
      variantTitle: item.variant?.title || item.subtitle || "১ কেজি",
      quantity: item.quantity,
      unit_price: item.unit_price,
      total: item.total || item.unit_price * item.quantity,
      raw: item,
    }))
  }, [cart?.items])

  const [items, setItems] = useState<CheckoutItem[]>(initialItems)
  const [shippingAmount, setShippingAmount] = useState<number>(() => {
    return cart?.shipping_methods?.[0]?.amount ?? 60
  })

  // Direct server-managed promotions & discount state (single source of truth)
  const [activePromotions, setActivePromotions] = useState<any[]>(() => cart?.promotions || [])
  const [activeDiscountTotal, setActiveDiscountTotal] = useState<number>(() => cart?.discount_total ?? 0)

  useEffect(() => {
    setActivePromotions(cart?.promotions || [])
    setActiveDiscountTotal(cart?.discount_total ?? 0)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("purehoney_promotions")
      } catch {}
    }
  }, [cart?.promotions, cart?.discount_total])

  useEffect(() => {
    const handlePromoUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        setActivePromotions(detail.promotions || [])
        setActiveDiscountTotal(detail.discount_total ?? 0)
      }
    }
    window.addEventListener("cart:promo-updated", handlePromoUpdated)
    return () => {
      window.removeEventListener("cart:promo-updated", handlePromoUpdated)
    }
  }, [])

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const itemsRef = useRef<CheckoutItem[]>(items)
  itemsRef.current = items

  // Guaranteed keepalive sync on page unload / tab close
  useEffect(() => {
    const handleUnload = () => {
      const cur = itemsRef.current
      if (cur && cur.length > 0) {
        fetch("/api/cart/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            desiredItems: cur
              .filter((i) => Boolean(i.variantId) && i.quantity > 0)
              .map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
          }),
          keepalive: true,
        })
      }
    }
    window.addEventListener("pagehide", handleUnload)
    window.addEventListener("beforeunload", handleUnload)
    return () => {
      window.removeEventListener("pagehide", handleUnload)
      window.removeEventListener("beforeunload", handleUnload)
    }
  }, [])

  // 2. Listen to shipping method selection from Section 2
  useEffect(() => {
    const handleShippingChanged = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (typeof detail.amount === "number") {
        setShippingAmount(detail.amount)
      }
    }
    window.addEventListener("checkout:shipping-changed", handleShippingChanged)
    return () => {
      window.removeEventListener("checkout:shipping-changed", handleShippingChanged)
    }
  }, [])

  // Focus & Visibility sync: Refresh server checkout data when user returns to tab
  useEffect(() => {
    const handleFocus = () => {
      if (document.visibilityState === "visible") {
        router.refresh()
      }
    }
    window.addEventListener("visibilitychange", handleFocus)
    window.addEventListener("focus", handleFocus)
    return () => {
      window.removeEventListener("visibilitychange", handleFocus)
      window.removeEventListener("focus", handleFocus)
    }
  }, [router])

  // 3. Server-First Cart Synchronization: Server items are the absolute source of truth
  useEffect(() => {
    setItems(initialItems)
    if (typeof window !== "undefined") {
      try {
        if (initialItems.length === 0) {
          localStorage.removeItem("purehoney_cart_v2")
          sessionStorage.removeItem("medusa_cart_map")
        } else {
          localStorage.setItem(
            "purehoney_cart_v2",
            JSON.stringify({
              items: initialItems.map((i) => ({
                id: i.id,
                lineId: i.lineId,
                variantId: i.variantId,
                title: i.title,
                product_handle: i.product_handle,
                thumbnail: i.thumbnail,
                variantTitle: i.variantTitle,
                quantity: i.quantity,
                unit_price: i.unit_price,
              })),
              timestamp: Date.now(),
            })
          )
        }
        const cartMap: Record<string, any> = {}
        initialItems.forEach((i) => {
          if (i.variantId) cartMap[i.variantId] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
          if (i.id) cartMap[i.id] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
        })
        sessionStorage.setItem("medusa_cart_map", JSON.stringify(cartMap))
        window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: cartMap }))
      } catch (e) {}
    }
  }, [initialItems])

  // 4. Update items and debounce background server sync with keepalive
  const updateItemsAndSync = (nextItems: CheckoutItem[]) => {
    setItems(nextItems)

    try {
      const snapshot = {
        items: nextItems.map((i) => ({
          id: i.id,
          lineId: i.lineId,
          variantId: i.variantId,
          title: i.title,
          product_handle: i.product_handle,
          thumbnail: i.thumbnail,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          unit_price: i.unit_price,
        })),
        timestamp: Date.now(),
      }
      localStorage.setItem("purehoney_cart_v2", JSON.stringify(snapshot))

      const cartMap: Record<string, any> = {}
      nextItems.forEach((i) => {
        if (i.variantId) cartMap[i.variantId] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
        if (i.id) cartMap[i.id] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
      })
      sessionStorage.setItem("medusa_cart_map", JSON.stringify(cartMap))
      window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: cartMap }))
    } catch (e) {}

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    syncTimeoutRef.current = setTimeout(() => {
      fetch("/api/cart/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desiredItems: nextItems
            .filter((i) => Boolean(i.variantId) && i.quantity > 0)
            .map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
        }),
        keepalive: true,
      })
        .then((res) => res.json())
        .then((data) => {
          if (data?.success) {
            if (Array.isArray(data.promotions)) {
              setActivePromotions(data.promotions)
            }
            if (typeof data.discount_total === "number") {
              setActiveDiscountTotal(data.discount_total)
            }
          }
        })
        .catch((e) => console.warn("[CheckoutSummary] debounce sync error:", e))
    }, 150)
  }

  // 5. Interactive controls
  const handleIncrement = (item: CheckoutItem) => {
    const maxStock = item.raw?.variant?.inventory_quantity ?? item.raw?.inventory_quantity
    if (typeof maxStock === "number" && maxStock > 0 && item.quantity >= maxStock) {
      return
    }
    const nextItems = items.map((it) =>
      it.id === item.id || (item.variantId && it.variantId === item.variantId)
        ? { ...it, quantity: it.quantity + 1, total: (it.quantity + 1) * it.unit_price }
        : it
    )
    updateItemsAndSync(nextItems)
  }

  const handleDecrement = (item: CheckoutItem) => {
    if (item.quantity > 1) {
      const nextItems = items.map((it) =>
        it.id === item.id || (item.variantId && it.variantId === item.variantId)
          ? { ...it, quantity: it.quantity - 1, total: (it.quantity - 1) * it.unit_price }
          : it
      )
      updateItemsAndSync(nextItems)
    } else {
      handleRemove(item)
    }
  }

  // Instant & guaranteed removal: updates UI immediately and fires keepalive request to backend
  const handleRemove = async (item: CheckoutItem) => {
    const nextItems = items.filter(
      (it) => !(it.id === item.id || (item.variantId && it.variantId === item.variantId))
    )
    setItems(nextItems)

    try {
      if (nextItems.length === 0) {
        localStorage.removeItem("purehoney_cart_v2")
        sessionStorage.removeItem("medusa_cart_map")
      } else {
        localStorage.setItem(
          "purehoney_cart_v2",
          JSON.stringify({
            items: nextItems,
            timestamp: Date.now(),
          })
        )
      }
      const cartMap: Record<string, any> = {}
      nextItems.forEach((i) => {
        if (i.variantId) cartMap[i.variantId] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
        if (i.id) cartMap[i.id] = { quantity: i.quantity, lineId: i.lineId, variantId: i.variantId }
      })
      sessionStorage.setItem("medusa_cart_map", JSON.stringify(cartMap))
      window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: cartMap }))
      window.dispatchEvent(
        new CustomEvent("cart:item-deleted", {
          detail: { id: item.id, variantId: item.variantId, handle: item.product_handle },
        })
      )
    } catch (e) {}

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    try {
      const payload: any = {
        deletions: [{ lineId: item.lineId || item.id, variantId: item.variantId }],
        desiredItems: nextItems
          .filter((i) => Boolean(i.variantId) && i.quantity > 0)
          .map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
      }
      if (nextItems.length === 0) {
        payload.clearAll = true
      }
      const res = await fetch("/api/cart/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        keepalive: true,
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.success) {
          if (Array.isArray(data.promotions)) {
            setActivePromotions(data.promotions)
          }
          if (typeof data.discount_total === "number") {
            setActiveDiscountTotal(data.discount_total)
          }
        }
      }
    } catch (e) {
      console.warn("[handleRemove] deletion backend warning:", e)
    }

    if (nextItems.length === 0) {
      window.location.href = `/${countryCode}/store`
    }
  }

  // 6. Live Totals calculation
  const liveSubtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0)
  }, [items])

  const liveDiscount = activeDiscountTotal
  const liveTotal = Math.max(0, liveSubtotal + shippingAmount - liveDiscount)

  // Individual promo code breakdown calculation
  const promoBreakdown = useMemo(() => {
    if (!activePromotions || activePromotions.length === 0 || liveDiscount <= 0) {
      if (liveDiscount > 0) {
        return [{ id: "discount", code: "discount", label: "ডিসকাউন্ট", amount: liveDiscount }]
      }
      return []
    }

    const itemsList = items || []
    let allocatedSum = 0

    const list = activePromotions.map((promo: any, index: number) => {
      const code = promo.code || `PROMO${index + 1}`

      // Check Medusa line item adjustments
      let fromAdjustments = 0
      itemsList.forEach((it) => {
        const adjs = it.raw?.adjustments || it.adjustments || []
        adjs.forEach((a: any) => {
          if (
            (promo.id && a.promotion_id === promo.id) ||
            (a.code && a.code.toLowerCase() === code.toLowerCase())
          ) {
            fromAdjustments += Number(a.amount || 0)
          }
        })
      })

      if (fromAdjustments > 0) {
        allocatedSum += fromAdjustments
        return {
          id: promo.id || code,
          code,
          label: `প্রোমো কোড (${code})`,
          amount: fromAdjustments,
        }
      }

      // Check application_method
      let calculated = 0
      if (promo.application_method) {
        const m = promo.application_method
        const val = Number(m.value || 0)
        if (m.type === "percentage") {
          calculated = Math.round((liveSubtotal * val) / 100)
        } else {
          calculated = val
        }
      } else {
        calculated = Math.round(liveDiscount / activePromotions.length)
      }

      allocatedSum += calculated
      return {
        id: promo.id || code,
        code,
        label: `প্রোমো কোড (${code})`,
        amount: calculated,
      }
    })

    // Balance amounts so sum strictly equals liveDiscount
    const currentSum = list.reduce((s, p) => s + p.amount, 0)
    if (currentSum > 0 && currentSum !== liveDiscount && list.length > 0) {
      const diff = liveDiscount - currentSum
      list[list.length - 1].amount = Math.max(0, list[list.length - 1].amount + diff)
    }

    return list
  }, [activePromotions, liveDiscount, liveSubtotal, items])

  return (
    <div className="relative lg:sticky lg:top-6 flex flex-col w-full">
      <div className="w-full bg-white rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-stone-200/80 shadow-2xs flex flex-col">
        <Heading
          level="h2"
          className="flex flex-row text-lg sm:text-xl font-bold text-gray-900 pb-3 mb-2 border-b border-stone-200/80"
        >
          আপনার কার্ট (অর্ডার বিবরণ)
        </Heading>

        {/* 1. Products List (Matching Image 1: Clean line separators, no card wrapper) */}
        <div className="flex flex-col divide-y divide-gray-150">
          {items.map((item) => {
            return (
              <div
                key={item.id || item.variantId}
                className="relative py-3 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 transition-colors"
              >
                {/* Thumbnail - Clean square */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-200/80 overflow-hidden bg-white shrink-0 p-0.5 flex items-center justify-center">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={item.images}
                    productHandle={item.product_handle}
                    size="square"
                  />
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {/* Row 1: Title & Variant with pr-9 sm:pr-10 so (১ কেজি) has clean space from delete button */}
                  <div className="flex items-center gap-1.5 min-w-0 pr-9 sm:pr-10">
                    <h4
                      className="text-xs sm:text-sm font-normal text-gray-800 truncate min-w-0 flex-1"
                      title={`${item.title} ${item.variantTitle ? `(${formatSize(item.variantTitle)})` : ""}`}
                    >
                      {item.title}
                    </h4>
                    {item.variantTitle && (
                      <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 font-normal select-none mr-1">
                        ({formatSize(item.variantTitle)})
                      </span>
                    )}
                  </div>

                  {/* Row 2: Stepper × Unit Price = Total */}
                  <div className="flex items-center gap-2 w-full flex-wrap mt-1 sm:mt-1.5">
                    {/* Compact Proportional Stepper */}
                    {(() => {
                      const maxStock = item.raw?.variant?.inventory_quantity ?? item.raw?.inventory_quantity
                      const isMaxReached = typeof maxStock === "number" && maxStock > 0 && item.quantity >= maxStock
                      return (
                        <div className="inline-flex items-center rounded-md border border-gray-200/90 bg-gray-50 overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDecrement(item)}
                            className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-colors cursor-pointer select-none"
                            title="১টি কমান"
                            aria-label="১টি কমান"
                          >
                            <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                          </button>
                          <span className="px-1.5 sm:px-2 h-5 sm:h-5.5 flex items-center justify-center bg-white border-x border-gray-200/90 text-[11px] sm:text-xs font-medium text-gray-800 min-w-[18px] sm:min-w-[20px] select-none">
                            {formatSize(String(item.quantity))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(item)}
                            disabled={isMaxReached}
                            className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 hover:bg-gray-100 active:scale-95 transition-colors cursor-pointer select-none disabled:opacity-35 disabled:cursor-not-allowed"
                            title={isMaxReached ? "সর্বোচ্চ স্টক যোগ করা হয়েছে" : "১টি বাড়ান"}
                            aria-label="১টি বাড়ান"
                          >
                            <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                          </button>
                        </div>
                      )
                    })()}

                    {/* Formula: [ - qty + ] × unit_price = total */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-normal select-none">
                      <span className="text-gray-500">×</span>
                      <span className="text-gray-700">
                        {formatPrice(item.unit_price)}
                      </span>
                      <span className="text-gray-500">=</span>
                      <span className="text-gray-900 font-medium">
                        {formatPrice(item.unit_price * item.quantity)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Red Delete Button (Absolute Top Right Corner with safe spacing) */}
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="absolute top-2.5 right-0.5 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                  title="আইটেমটি মুছুন"
                  aria-label="আইটেমটি মুছুন"
                >
                  <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-500" />
                </button>
              </div>
            )
          })}
        </div>

        <div className="h-px w-full border-b border-gray-200 my-4" />

        {/* 2. Live Totals Section */}
        <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-normal">পণ্যের মোট মূল্য</span>
            <span data-testid="cart-subtotal" className="text-gray-900 font-normal">
              {formatPrice(liveSubtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700 font-normal">ডেলিভারি চার্জ</span>
            <span data-testid="cart-shipping" className="text-gray-900 font-normal">
              {shippingAmount > 0 ? formatPrice(shippingAmount) : "০ ৳"}
            </span>
          </div>

          {/* Separate rows for each applied promo code */}
          {promoBreakdown.map((promo) => (
            <div key={promo.code} className="flex items-center justify-between">
              <span className="text-emerald-700 font-normal flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>{promo.label}</span>
              </span>
              <span className="text-emerald-600 font-medium" data-testid={`cart-discount-${promo.code}`}>
                - {formatPrice(promo.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px w-full border-b border-gray-200 my-3" />

        <div className="flex items-center justify-between text-ui-fg-base mb-1 txt-medium">
          <span className="text-base sm:text-lg text-gray-900 font-medium">সর্বমোট বিল</span>
          <span
            className="text-xl sm:text-2xl text-amber-700 font-bold"
            data-testid="cart-total"
          >
            {formatPrice(liveTotal)}
          </span>
        </div>

        <div className="h-px w-full border-b border-gray-200 my-3" />

        {/* 3. Discount Code Section */}
        <div className="mt-2 mb-1">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
