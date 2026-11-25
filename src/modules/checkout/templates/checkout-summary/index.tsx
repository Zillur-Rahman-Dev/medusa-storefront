"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useState, useMemo } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatPrice, formatSize } from "@lib/util/money"
import { Tag } from "lucide-react"

// Cloudinary images for known products (in case database thumbnail field is null or unoptimized)
const KNOWN_HONEY_IMAGES: Record<string, string> = {
  "sundarban-kholisha-honey":
    "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg",
  "mustard-flower-honey":
    "/images/hero/slider-mustard.jpg",
  "black-seed-flower-honey":
    "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167194/2f318c58-a2a2-48bc-80e6-56ccd4b5a553_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg.jpg",
}

function resolveProductImage(opts: {
  thumbnail?: string | null
  metadata?: any
  handle?: string | null
  title?: string | null
}): string | null {
  if (
    opts.thumbnail &&
    typeof opts.thumbnail === "string" &&
    opts.thumbnail.startsWith("http")
  ) {
    return opts.thumbnail
  }

  if (opts.metadata?.thumbnail && typeof opts.metadata.thumbnail === "string") {
    return opts.metadata.thumbnail
  }

  const handle = opts.handle || ""
  const title = opts.title || ""

  if (KNOWN_HONEY_IMAGES[handle]) {
    return KNOWN_HONEY_IMAGES[handle]
  }

  if (
    handle.includes("sundarban") ||
    handle.includes("kholisha") ||
    title.includes("খলিশা")
  ) {
    return KNOWN_HONEY_IMAGES["sundarban-kholisha-honey"]
  }
  if (
    handle.includes("mustard") ||
    handle.includes("sorisha") ||
    title.includes("সরিষা")
  ) {
    return KNOWN_HONEY_IMAGES["mustard-flower-honey"]
  }
  if (
    handle.includes("black-seed") ||
    handle.includes("kalijira") ||
    title.includes("কালোজিরা")
  ) {
    return KNOWN_HONEY_IMAGES["black-seed-flower-honey"]
  }

  return opts.thumbnail || null
}

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

  // 1. Initial items mapped from server cart (Server-First absolute single source of truth)
  const items: CheckoutItem[] = useMemo(() => {
    const map = new Map<string, CheckoutItem>()
    for (const item of cart?.items || []) {
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
  }, [cart?.items])

  const [shippingAmount, setShippingAmount] = useState<number>(() => {
    return cart?.shipping_methods?.[0]?.amount ?? 70
  })
  const [originalShippingAmount, setOriginalShippingAmount] = useState<number>(() => {
    return (cart?.shipping_methods?.[0]?.amount && cart.shipping_methods[0].amount > 0)
      ? cart.shipping_methods[0].amount
      : 70
  })

  // Direct server-managed promotions & discount state (single source of truth)
  const [activePromotions, setActivePromotions] = useState<any[]>(() => cart?.promotions || [])
  const [activeDiscountTotal, setActiveDiscountTotal] = useState<number>(() => cart?.discount_total ?? 0)

  useEffect(() => {
    setActivePromotions(cart?.promotions || [])
    setActiveDiscountTotal(cart?.discount_total ?? 0)
  }, [cart?.promotions, cart?.discount_total])

  useEffect(() => {
    const handlePromoUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        if (Array.isArray(detail.promotions)) {
          setActivePromotions(detail.promotions)
        }
        if (typeof detail.discount_total === "number") {
          setActiveDiscountTotal(detail.discount_total)
        }
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
        if (detail.amount > 0) {
          setOriginalShippingAmount(detail.amount)
        }
      }
    }
    window.addEventListener("checkout:shipping-changed", handleShippingChanged)
    return () => {
      window.removeEventListener("checkout:shipping-changed", handleShippingChanged)
    }
  }, [])

  // If cart is completely empty on server, return to store
  useEffect(() => {
    if (items.length === 0 && (!cart?.items || cart.items.length === 0)) {
      window.location.href = `/${countryCode}/store`
    }
  }, [items.length, cart?.items, countryCode])

  // 5. Live Totals calculation
  const liveSubtotal = useMemo(() => {
    return items.reduce((acc, it) => acc + (it.unit_price * it.quantity), 0)
  }, [items])

  const liveDiscount = activeDiscountTotal
  const liveTotal = Math.max(0, liveSubtotal + shippingAmount - liveDiscount)

  const isFreeShipping = shippingAmount === 0 || activePromotions.some((p: any) => {
    const type = p.application_method?.target_type || p.type
    return type === "shipping_methods" || p.application_method?.type === "free_shipping"
  })

  // Individual promo code breakdown calculation (Each promo code discount displayed separately)
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
      <div className="w-full bg-white dark:bg-zinc-900 rounded-xl sm:rounded-2xl p-4 sm:p-6 border border-stone-200/80 dark:border-zinc-800 shadow-2xs flex flex-col">
        {/* Header with Title (100% Read-Only Summary) */}
        <div className="flex items-center justify-between pb-3 mb-2 border-b border-stone-200/80 dark:border-zinc-800">
          <Heading
            level="h2"
            className="text-base sm:text-lg font-bold text-gray-900 dark:text-zinc-100"
          >
            অর্ডারের সারসংক্ষেপ ({formatSize(String(items.reduce((s, i) => s + i.quantity, 0)))}টি পণ্য)
          </Heading>
        </div>

        {/* 1. Products List (100% Read-Only, Clean & Fast) */}
        <div className="flex flex-col divide-y divide-gray-150 dark:divide-zinc-800">
          {items.map((item) => {
            const raw = item.raw || {}
            const quantity = item.quantity || 1

            // Extract adjustments and discounts on this line item
            const adjustments = raw.adjustments || []
            const adjAmount = adjustments.reduce((s: number, a: any) => s + Number(a.amount || 0), 0)
            const lineDiscount = adjAmount || Number(raw.discount_total || 0)

            let originalUnitPrice = item.unit_price
            let currentUnitPrice = item.unit_price
            let discountPercent = 0
            let isFreeItem = false

            if (raw.original_total && raw.total && raw.original_total > raw.total) {
              originalUnitPrice = Math.round(raw.original_total / quantity)
              currentUnitPrice = Math.round(raw.total / quantity)
              discountPercent = Math.round(((raw.original_total - raw.total) / raw.original_total) * 100)
            } else if (lineDiscount > 0) {
              const computedOrigTotal = item.unit_price * quantity
              if (raw.total && raw.total < computedOrigTotal) {
                currentUnitPrice = Math.round(raw.total / quantity)
                originalUnitPrice = item.unit_price
              } else {
                currentUnitPrice = Math.max(0, Math.round((computedOrigTotal - lineDiscount) / quantity))
                originalUnitPrice = item.unit_price
              }
              discountPercent = originalUnitPrice > 0
                ? Math.round(((originalUnitPrice - currentUnitPrice) / originalUnitPrice) * 100)
                : 0
            } else if (raw.original_unit_price && raw.original_unit_price > item.unit_price) {
              originalUnitPrice = raw.original_unit_price
              currentUnitPrice = item.unit_price
              discountPercent = Math.round(((originalUnitPrice - currentUnitPrice) / originalUnitPrice) * 100)
            } else if (raw.compare_at_unit_price && raw.compare_at_unit_price > item.unit_price) {
              originalUnitPrice = raw.compare_at_unit_price
              currentUnitPrice = item.unit_price
              discountPercent = Math.round(((originalUnitPrice - currentUnitPrice) / originalUnitPrice) * 100)
            }

            // Check Buy X Get Y / Free item (গ)
            const hasFreePromo = adjustments.some((a: any) => {
              const code = (a.code || "").toLowerCase()
              const desc = (a.description || "").toLowerCase()
              return code.includes("free") || desc.includes("free") || code.includes("gift") || desc.includes("gift")
            })

            if (currentUnitPrice === 0 || discountPercent === 100 || hasFreePromo || raw.metadata?.is_free) {
              isFreeItem = true
              currentUnitPrice = 0
            }

            const originalTotal = originalUnitPrice * quantity
            const currentTotal = isFreeItem ? 0 : (currentUnitPrice * quantity)
            const hasDiscount = originalTotal > currentTotal
            const savingsAmount = Math.max(0, originalTotal - currentTotal)

            const imageUrl = resolveProductImage({
              thumbnail: item.thumbnail,
              metadata: raw.metadata,
              handle: item.product_handle,
              title: item.title,
            }) || (item.images && item.images.length > 0 ? item.images[0].url : null)

            return (
              <div
                key={item.id || item.variantId}
                className="relative py-3 sm:py-3.5 flex items-center gap-2.5 sm:gap-3 transition-colors"
              >
                {/* Thumbnail - Full cover on all devices */}
                <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl border border-gray-200/80 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shrink-0 flex items-center justify-center">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={item.title}
                      fill
                      className="object-cover object-center"
                      sizes="(max-width: 640px) 48px, 56px"
                      unoptimized
                    />
                  ) : (
                    <span className="text-xl sm:text-2xl select-none">🍯</span>
                  )}
                  {isFreeItem && (
                    <span className="absolute top-0 right-0 z-10 bg-emerald-600 text-white text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-bl-md leading-none shadow-xs select-none">
                      ফ্রি
                    </span>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  {/* Row 1: Title & Variant (Left) + Savings Tag (Right) */}
                  <div className="flex items-start justify-between gap-1.5 min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <h4
                        className="text-xs sm:text-sm font-semibold text-gray-800 dark:text-zinc-100 truncate min-w-0"
                        title={`${item.title} ${item.variantTitle ? `(${formatSize(item.variantTitle)})` : ""}`}
                      >
                        {item.title}
                      </h4>
                      {item.variantTitle && (
                        <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal select-none">
                          ({formatSize(item.variantTitle)})
                        </span>
                      )}
                    </div>

                    {/* Savings Tag: Small text and tag format */}
                    {hasDiscount && !isFreeItem && savingsAmount > 0 && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200/80 dark:border-emerald-800 shrink-0 select-none">
                        {formatPrice(savingsAmount)} সাশ্রয়
                      </span>
                    )}
                    {isFreeItem && (
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[10px] sm:text-xs font-semibold bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200/80 dark:border-amber-800 shrink-0 select-none">
                        🎁 ফ্রি উপহার
                      </span>
                    )}
                  </div>

                  {/* Row 2: Quantity × Unit Price (Left) + Strikethrough Total & Discounted Total / ফ্রি (Right) */}
                  <div className="flex items-center justify-between w-full mt-1 sm:mt-1.5">
                    {/* Left: Quantity × Unit Price */}
                    <div className="flex items-center gap-1.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 flex-wrap select-none">
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">
                        {formatSize(String(quantity))} টি
                      </span>
                      <span className="text-zinc-400">×</span>
                      <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                        {formatPrice(isFreeItem ? 0 : currentUnitPrice)}
                      </span>
                    </div>

                    {/* Right: ~OriginalTotal~ CurrentTotal (or "ফ্রি" if free) */}
                    <div className="flex items-center gap-1.5 shrink-0 ml-2 select-none">
                      {isFreeItem ? (
                        <>
                          {originalTotal > 0 && (
                            <span className="line-through text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm">
                              {formatPrice(originalTotal)}
                            </span>
                          )}
                          <span className="text-xs sm:text-sm font-bold text-emerald-600 dark:text-emerald-400">
                            ফ্রি
                          </span>
                        </>
                      ) : hasDiscount ? (
                        <>
                          <span className="line-through text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm">
                            {formatPrice(originalTotal)}
                          </span>
                          <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {formatPrice(currentTotal)}
                          </span>
                        </>
                      ) : (
                        <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100">
                          {formatPrice(currentTotal)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="h-px w-full border-b border-gray-200 dark:border-zinc-800 my-4" />

        {/* 2. Live Totals Section */}
        <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-zinc-300 font-normal">পণ্যের মোট মূল্য</span>
            <span data-testid="cart-subtotal" className="text-gray-900 dark:text-zinc-100 font-semibold">
              {formatPrice(liveSubtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs sm:text-sm">
            <span className="text-gray-700 dark:text-zinc-300 font-normal">ডেলিভারি চার্জ</span>
            {isFreeShipping ? (
              <div data-testid="cart-shipping" className="flex items-center gap-1.5 select-none">
                <span className="line-through text-zinc-400 dark:text-zinc-500 text-xs sm:text-sm">
                  {formatPrice(originalShippingAmount > 0 ? originalShippingAmount : 70)}
                </span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                  ফ্রি
                </span>
              </div>
            ) : (
              <span data-testid="cart-shipping" className="text-gray-900 dark:text-zinc-100 font-normal select-none">
                {shippingAmount > 0 ? formatPrice(shippingAmount) : "০ ৳"}
              </span>
            )}
          </div>

          {/* Separate rows for each applied promo code */}
          {promoBreakdown.map((promo) => (
            <div key={promo.code || promo.id} className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-emerald-700 dark:text-emerald-400 font-normal flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>{promo.label}</span>
              </span>
              <span className="text-emerald-600 dark:text-emerald-400 font-medium" data-testid={`cart-discount-${promo.code}`}>
                - {formatPrice(promo.amount)}
              </span>
            </div>
          ))}
        </div>

        <div className="h-px w-full border-b border-gray-200 dark:border-zinc-800 my-3" />

        <div className="flex items-center justify-between text-ui-fg-base mb-1 txt-medium">
          <span className="text-base sm:text-lg text-gray-900 dark:text-zinc-100 font-medium">সর্বমোট বিল</span>
          <span
            className="text-xl sm:text-2xl text-amber-700 dark:text-amber-500 font-bold"
            data-testid="cart-total"
          >
            {formatPrice(liveTotal)}
          </span>
        </div>

        <div className="h-px w-full border-b border-gray-200 dark:border-zinc-800 my-3" />

        {/* 3. Discount Code Section (Promo Apply Option Back) */}
        <div className="mt-2 mb-1">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
