"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatPrice, formatSize, getItemDiscountInfo } from "@lib/util/money"
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

  // Instant reactive promotion & discount state with persistent memory
  const [activePromotions, setActivePromotions] = useState<any[]>(() => {
    if (cart?.promotions && cart.promotions.length > 0) return cart.promotions
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("purehoney_promotions")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed.promotions) && parsed.promotions.length > 0) {
            return parsed.promotions
          }
        }
      } catch {}
    }
    return []
  })

  const [activeDiscountTotal, setActiveDiscountTotal] = useState<number>(() => {
    if (typeof cart?.discount_total === "number" && cart.discount_total > 0) return cart.discount_total
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("purehoney_promotions")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (typeof parsed.discount_total === "number" && parsed.discount_total > 0) {
            return parsed.discount_total
          }
        }
      } catch {}
    }
    return cart?.discount_total ?? 0
  })

  useEffect(() => {
    if (cart?.promotions && cart.promotions.length > 0) {
      setActivePromotions(cart.promotions)
    } else if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("purehoney_promotions")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed.promotions) && parsed.promotions.length > 0) {
            setActivePromotions(parsed.promotions)
          }
        }
      } catch {}
    }
    if (typeof cart?.discount_total === "number" && cart.discount_total > 0) {
      setActiveDiscountTotal(cart.discount_total)
    } else if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("purehoney_promotions")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (typeof parsed.discount_total === "number" && parsed.discount_total > 0) {
            setActiveDiscountTotal(parsed.discount_total)
          }
        }
      } catch {}
    }
  }, [cart?.promotions, cart?.discount_total])

  useEffect(() => {
    const handlePromoUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        setActivePromotions(detail.promotions || [])
        setActiveDiscountTotal(detail.discount_total ?? 0)
        try {
          localStorage.setItem(
            "purehoney_promotions",
            JSON.stringify({
              promotions: detail.promotions || [],
              discount_total: detail.discount_total ?? 0,
              timestamp: Date.now(),
            })
          )
        } catch {}
      }
    }
    window.addEventListener("cart:promo-updated", handlePromoUpdated)
    return () => {
      window.removeEventListener("cart:promo-updated", handlePromoUpdated)
    }
  }, [])

  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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

  // 3. Mount Reconciliation: Synchronize immediately with client's localStorage cart snapshot
  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const stored = localStorage.getItem("purehoney_cart_v2")
      if (stored) {
        const parsed = JSON.parse(stored)
        const isRecent = Date.now() - (parsed.timestamp || 0) < 15 * 60 * 1000

        if (isRecent && Array.isArray(parsed.items) && parsed.items.length > 0) {
          const serverMap = new Map<string, number>()
          initialItems.forEach((it) => {
            const k = it.variantId || it.id
            if (k) serverMap.set(k, it.quantity)
          })

          let isDifferent = false
          if (parsed.items.length !== initialItems.length) {
            isDifferent = true
          } else {
            for (const loc of parsed.items) {
              const k = loc.variantId || loc.id
              if (!serverMap.has(k) || serverMap.get(k) !== loc.quantity) {
                isDifferent = true
                break
              }
            }
          }

          if (isDifferent) {
            const reconciled: CheckoutItem[] = parsed.items.map((loc: any) => {
              const matchingServer = initialItems.find(
                (srv) =>
                  (loc.variantId && srv.variantId === loc.variantId) ||
                  (loc.id && srv.id === loc.id) ||
                  (loc.product_handle && srv.product_handle === loc.product_handle)
              )

              const unitPrice = matchingServer?.unit_price || loc.unit_price || 750
              return {
                id: matchingServer?.id || loc.id,
                lineId: matchingServer?.lineId || loc.lineId,
                variantId: loc.variantId || matchingServer?.variantId,
                title: matchingServer?.title || loc.title || "খাঁটি প্রাকৃতিক মধু",
                product_handle: matchingServer?.product_handle || loc.product_handle,
                thumbnail: matchingServer?.thumbnail || loc.thumbnail,
                images: matchingServer?.images,
                variantTitle: matchingServer?.variantTitle || loc.variantTitle || "১ কেজি",
                quantity: loc.quantity,
                unit_price: unitPrice,
                total: unitPrice * loc.quantity,
                raw: matchingServer?.raw,
              }
            })

            // Instantly update UI state without needing manual reload
            setItems(reconciled)

            // Reconcile Medusa backend to match
            fetch("/api/cart/batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                desiredItems: reconciled
                  .filter((i) => Boolean(i.variantId) && i.quantity > 0)
                  .map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
              }),
            })
              .then(() => {
                router.refresh()
              })
              .catch((err) => {
                console.warn("[CheckoutSummary] background mount sync error:", err)
              })
          } else if (initialItems.length > 0) {
            // Keep fresh server metadata (Title/Price) and sync back to local snapshot
            setItems(initialItems)
            try {
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
            } catch (e) {}
          }
        }
      }
    } catch (e) {
      console.warn("[CheckoutSummary] local snapshot read error:", e)
    }
  }, [initialItems, router])

  // 4. Update items and debounce background server sync
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
      }).catch((e) => console.warn("[CheckoutSummary] debounce sync error:", e))
    }, 200)
  }

  // 5. Interactive controls
  const handleIncrement = (item: CheckoutItem) => {
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

  const handleRemove = (item: CheckoutItem) => {
    const nextItems = items.filter(
      (it) => !(it.id === item.id || (item.variantId && it.variantId === item.variantId))
    )
    if (nextItems.length === 0) {
      try {
        localStorage.removeItem("purehoney_cart_v2")
        sessionStorage.removeItem("medusa_cart_map")
      } catch (e) {}
      fetch("/api/cart/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      })
      window.location.href = `/${countryCode}/store`
      return
    }
    updateItemsAndSync(nextItems)
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
    <div className="sticky top-6 flex flex-col w-full">
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
            const discountInfo = getItemDiscountInfo(
              item.unit_price,
              item.quantity,
              activePromotions,
              liveDiscount,
              liveSubtotal,
              item.raw
            )

            return (
              <div
                key={item.id || item.variantId}
                className="relative py-3 sm:py-3.5 flex items-center gap-2.5 transition-colors"
              >
                {/* Thumbnail */}
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-200/80 overflow-hidden bg-white shrink-0 p-0.5 flex items-center justify-center">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={item.images}
                    productHandle={item.product_handle}
                    size="square"
                  />
                </div>

                {/* Details & Pill Stepper + Math row */}
                <div className="flex-1 min-w-0">
                  {/* Title row with pr-7 to prevent overlap with top-right delete button - NO WRAP (Inline Single-Row) */}
                  <div className="flex items-center gap-1.5 min-w-0 pr-7">
                    <h4
                      className="text-xs sm:text-sm font-normal text-gray-800 truncate min-w-0 flex-1"
                      title={`${item.title} ${item.variantTitle ? `(${formatSize(item.variantTitle)})` : ""}`}
                    >
                      {item.title}
                    </h4>
                    {item.variantTitle && (
                      <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 font-normal select-none">
                        ({formatSize(item.variantTitle)})
                      </span>
                    )}
                    {discountInfo.hasDiscount && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[10px] sm:text-[11px] font-medium leading-none shrink-0 select-none">
                        <Tag className="w-2.5 h-2.5 text-emerald-600" />
                        <span>{discountInfo.badgeText}</span>
                      </span>
                    )}
                  </div>

                  {/* Stepper + Math Formula Row (Full line) */}
                  <div className="flex items-center gap-2 mt-1 sm:mt-1.5 w-full flex-wrap">
                    {/* Pill Stepper */}
                    <div className="inline-flex items-center rounded-full border border-gray-200 bg-gray-100 overflow-hidden shadow-2xs">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-colors cursor-pointer text-sm font-normal select-none"
                        title="১টি কমান"
                        aria-label="১টি কমান"
                      >
                        <Minus className="w-3 h-3 text-orange-500" />
                      </button>
                      <span className="px-2.5 h-6 sm:h-7 flex items-center justify-center bg-white border-x border-gray-200 text-xs sm:text-sm font-normal text-gray-800 select-none">
                        {formatSize(String(item.quantity))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(item)}
                        className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-100 hover:bg-gray-200 active:scale-95 transition-colors cursor-pointer text-sm font-normal select-none"
                        title="১টি বাড়ান"
                        aria-label="১টি বাড়ান"
                      >
                        <Plus className="w-3 h-3 text-orange-500" />
                      </button>
                    </div>

                    {/* Formula: [ - qty + ] × price = total */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm font-normal select-none">
                      <span className="text-gray-500">×</span>
                      {discountInfo.hasDiscount ? (
                        <span className="flex items-center gap-1">
                          <span className="line-through text-gray-400 text-[11px] sm:text-xs">
                            {formatPrice(item.unit_price)}
                          </span>
                          <span className="text-emerald-600 font-medium">
                            {formatPrice(discountInfo.discountedUnitPrice)}
                          </span>
                        </span>
                      ) : (
                        <span className="text-gray-700">
                          {formatPrice(item.unit_price)}
                        </span>
                      )}
                      <span className="text-gray-500">=</span>
                      <span className={discountInfo.hasDiscount ? "text-emerald-700 font-semibold" : "text-gray-900 font-normal"}>
                        {formatPrice(discountInfo.hasDiscount ? discountInfo.discountedTotalPrice : (item.total || item.unit_price * item.quantity))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Red Delete Button */}
                <button
                  type="button"
                  onClick={() => handleRemove(item)}
                  className="absolute top-2.5 right-1 p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
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
