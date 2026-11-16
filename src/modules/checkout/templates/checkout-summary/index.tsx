"use client"

import { Heading } from "@medusajs/ui"
import { useEffect, useState, useMemo, useRef } from "react"
import { useParams, useRouter } from "next/navigation"
import DiscountCode from "@modules/checkout/components/discount-code"
import Divider from "@modules/common/components/divider"
import Thumbnail from "@modules/products/components/thumbnail"
import { formatPrice, formatSize } from "@lib/util/money"
import { Minus, Plus, Trash2 } from "lucide-react"

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

  // 1. Initial items mapped from server cart
  const initialItems: CheckoutItem[] = useMemo(() => {
    return (cart?.items || []).map((item: any) => ({
      id: item.id,
      lineId: item.id,
      variantId: item.variant_id || item.variant?.id,
      title: item.product_title || item.title || "খাঁটি প্রাকৃতিক মধু",
      product_handle: item.product_handle,
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

              const unitPrice = loc.unit_price || matchingServer?.unit_price || 750
              return {
                id: matchingServer?.id || loc.id,
                lineId: matchingServer?.lineId || loc.lineId,
                variantId: loc.variantId || matchingServer?.variantId,
                title: loc.title || matchingServer?.title || "খাঁটি প্রাকৃতিক মধু",
                product_handle: loc.product_handle || matchingServer?.product_handle,
                thumbnail: loc.thumbnail || matchingServer?.thumbnail,
                images: matchingServer?.images,
                variantTitle: loc.variantTitle || matchingServer?.variantTitle || "১ কেজি",
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

  const liveDiscount = cart?.discount_total ?? 0
  const liveTotal = Math.max(0, liveSubtotal + shippingAmount - liveDiscount)

  return (
    <div className="sticky top-0 flex flex-col-reverse small:flex-col gap-y-8 py-8 small:py-0">
      <div className="w-full bg-white flex flex-col">
        <Divider className="my-6 small:hidden" />
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular items-baseline font-bold text-gray-900"
        >
          আপনার কার্ট (অর্ডার বিবরণ)
        </Heading>
        <Divider className="my-6" />

        {/* Live Totals Section */}
        <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">পণ্যের মোট মূল্য</span>
            <span data-testid="cart-subtotal" className="font-semibold text-gray-900">
              {formatPrice(liveSubtotal)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-gray-700">ডেলিভারি চার্জ</span>
            <span data-testid="cart-shipping" className="font-semibold text-gray-900">
              {shippingAmount > 0 ? formatPrice(shippingAmount) : "০ ৳"}
            </span>
          </div>

          {liveDiscount > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-emerald-700 font-medium">ডিসকাউন্ট</span>
              <span className="text-emerald-600 font-semibold" data-testid="cart-discount">
                - {formatPrice(liveDiscount)}
              </span>
            </div>
          )}
        </div>

        <div className="h-px w-full border-b border-gray-200 my-4" />

        <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium">
          <span className="font-bold text-lg text-gray-900">সর্বমোট বিল</span>
          <span
            className="txt-xlarge-plus font-bold text-amber-700"
            data-testid="cart-total"
          >
            {formatPrice(liveTotal)}
          </span>
        </div>

        <div className="h-px w-full border-b border-gray-200 my-4" />

        {/* Interactive Products List with Instant Add/Remove/Update */}
        <div className="flex flex-col divide-y divide-gray-100 max-h-[460px] overflow-y-auto no-scrollbar">
          {items.map((item) => {
            return (
              <div
                key={item.id || item.variantId}
                className="py-3 sm:py-4 flex items-center justify-between gap-3 group"
              >
                {/* Thumbnail */}
                <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-stone-100 flex-shrink-0 border border-stone-200">
                  <Thumbnail
                    thumbnail={item.thumbnail}
                    images={item.images}
                    productHandle={item.product_handle}
                    size="square"
                  />
                </div>

                {/* Details & Live Quantity Stepper */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-xs sm:text-sm text-gray-900 truncate">
                    {item.title}
                  </h4>
                  <p className="text-[11px] sm:text-xs text-gray-500 mt-0.5">
                    সাইজ / ওজন: {formatSize(item.variantTitle)}
                  </p>

                  <div className="flex items-center gap-2 mt-2">
                    {/* Inline Stepper [-] qty [+] */}
                    <div className="inline-flex items-center border border-gray-200 rounded-lg bg-stone-50 overflow-hidden shadow-xs">
                      <button
                        type="button"
                        onClick={() => handleDecrement(item)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-amber-700 hover:bg-amber-100/60 active:scale-95 transition-colors cursor-pointer"
                        title="১টি কমান"
                        aria-label="১টি কমান"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-7 text-center font-bold text-xs text-gray-900 select-none">
                        {formatSize(String(item.quantity))}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleIncrement(item)}
                        className="w-6 h-6 flex items-center justify-center text-gray-600 hover:text-amber-700 hover:bg-amber-100/60 active:scale-95 transition-colors cursor-pointer"
                        title="১টি বাড়ান"
                        aria-label="১টি বাড়ান"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Delete item button */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="p-1 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="আইটেমটি কার্ট থেকে মুছুন"
                      aria-label="আইটেমটি কার্ট থেকে মুছুন"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Right Price Display */}
                <div className="text-right flex-shrink-0 flex flex-col items-end">
                  <span className="text-xs text-gray-500 font-medium">
                    {formatSize(String(item.quantity))}x {formatPrice(item.unit_price)}
                  </span>
                  <span className="font-bold text-sm sm:text-base text-gray-900 mt-0.5">
                    {formatPrice(item.total)}
                  </span>
                </div>
              </div>
            )
          })}
        </div>

        {/* Discount Code Section */}
        <div className="my-6">
          <DiscountCode cart={cart} />
        </div>
      </div>
    </div>
  )
}

export default CheckoutSummary
