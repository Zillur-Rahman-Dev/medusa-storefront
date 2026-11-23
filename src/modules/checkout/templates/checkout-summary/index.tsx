"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatPrice, formatSize } from "@lib/util/money"
import { Tag, Pencil } from "lucide-react"

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

  // 1. Direct Server Handshake State: Initialized with server cart, and instantly synchronizes
  // with verified HTTP 200 server cart payloads from /api/cart/batch or promo actions
  const [activeCart, setActiveCart] = useState<any>(cart)

  useEffect(() => {
    setActiveCart(cart)
  }, [cart])

  // Direct Handshake: listen to confirmed server cart from /api/cart/batch response
  useEffect(() => {
    const handleServerUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail?.cart) {
        setActiveCart(detail.cart)
        if (detail.cart.promotions) {
          setActivePromotions(detail.cart.promotions)
        }
        if (typeof detail.cart.discount_total === "number") {
          setActiveDiscountTotal(detail.cart.discount_total)
        }
      }
    }
    window.addEventListener("cart:server-updated", handleServerUpdated)
    return () => {
      window.removeEventListener("cart:server-updated", handleServerUpdated)
    }
  }, [])

  // 2. Initial items mapped from server cart (Server-First metadata priority & deduplication)
  const items: CheckoutItem[] = useMemo(() => {
    const map = new Map<string, CheckoutItem>()
    for (const item of activeCart?.items || []) {
      const key = item.variant_id || item.variant?.id || item.id
      const itemTitle = item.variant?.product?.title || item.product_title || item.title || "খাঁটি প্রাকৃতিক মধু"
      const itemHandle = item.variant?.product?.handle || item.product_handle
      const itemThumb = item.thumbnail || item.variant?.product?.thumbnail
      const itemVariantTitle = item.variant?.title || item.subtitle || "১ কেজি"

      if (map.has(key)) {
        const existing = map.get(key)!
        existing.quantity += item.quantity
        existing.total += item.total || item.unit_price * item.quantity
      } else {
        map.set(key, {
          id: item.id,
          lineId: item.id,
          variantId: item.variant_id || item.variant?.id,
          title: itemTitle,
          product_handle: itemHandle,
          thumbnail: itemThumb,
          images: item.variant?.product?.images,
          variantTitle: itemVariantTitle,
          quantity: item.quantity,
          unit_price: item.unit_price,
          total: item.total || item.unit_price * item.quantity,
          raw: item,
        })
      }
    }
    return Array.from(map.values()).filter((i) => i.quantity > 0)
  }, [activeCart?.items])

  const [shippingAmount, setShippingAmount] = useState<number>(() => {
    return activeCart?.shipping_methods?.[0]?.amount ?? 60
  })

  // Direct server-managed promotions & discount state (single source of truth)
  const [activePromotions, setActivePromotions] = useState<any[]>(() => activeCart?.promotions || [])
  const [activeDiscountTotal, setActiveDiscountTotal] = useState<number>(() => activeCart?.discount_total ?? 0)

  useEffect(() => {
    setActivePromotions(activeCart?.promotions || [])
    setActiveDiscountTotal(activeCart?.discount_total ?? 0)
  }, [activeCart?.promotions, activeCart?.discount_total])

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

  // If cart is completely empty on server, return to store
  useEffect(() => {
    if (items.length === 0 && (!activeCart?.items || activeCart.items.length === 0)) {
      window.location.href = `/${countryCode}/store`
    }
  }, [items.length, activeCart?.items, countryCode])

  // 5. Live Totals calculation
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
        {/* Header with Title and [ ✏️ অর্ডার পরিবর্তন করুন ] */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/80">
          <Heading
            level="h2"
            className="text-base sm:text-lg font-bold text-gray-900"
          >
            অর্ডারের সারসংক্ষেপ ({formatSize(String(items.reduce((s, i) => s + i.quantity, 0)))}টি পণ্য)
          </Heading>
          <button
            type="button"
            onClick={() => {
              window.dispatchEvent(new CustomEvent("cart:open-drawer"))
            }}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold text-orange-600 hover:text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 transition-colors cursor-pointer group shadow-2xs select-none"
            aria-label="অর্ডার পরিবর্তন করুন"
          >
            <Pencil className="w-3.5 h-3.5 group-hover:scale-110 transition-transform text-orange-600" />
            <span>অর্ডার পরিবর্তন করুন</span>
          </button>
        </div>

        {/* 1. Products List (100% Read-Only, Clean & Fast) */}
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
                  {/* Row 1: Title & Variant */}
                  <div className="flex items-center gap-1.5 min-w-0">
                    <h4
                      className="text-xs sm:text-sm font-medium text-gray-800 truncate min-w-0 flex-1"
                      title={`${item.title} ${item.variantTitle ? `(${formatSize(item.variantTitle)})` : ""}`}
                    >
                      {item.title}
                    </h4>
                    {item.variantTitle && (
                      <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 font-normal select-none">
                        ({formatSize(item.variantTitle)})
                      </span>
                    )}
                  </div>

                  {/* Row 2: Quantity Badge × Unit Price = Total */}
                  <div className="flex items-center gap-2 w-full flex-wrap mt-1 sm:mt-1.5">
                    {/* Read-Only Quantity Badge */}
                    <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-stone-100 border border-stone-200 text-xs font-semibold text-stone-700 select-none">
                      {formatSize(String(item.quantity))}টি
                    </span>

                    {/* Formula: [ qty ] × unit_price = total */}
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
          <DiscountCode cart={activeCart || cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
