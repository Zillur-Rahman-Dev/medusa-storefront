"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale, formatPrice, formatSize } from "@lib/util/money"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { ShoppingCart, X, Truck, Loader2 } from "lucide-react"

// Cloudinary images for known products (in case database thumbnail field is null)
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

  return null
}

type UnifiedCartItem = {
  id: string
  lineId?: string
  lineIds?: string[]
  variantId?: string
  title: string
  product_handle?: string
  thumbnail?: string | null
  metadata?: any
  variantTitle?: string
  quantity: number
  unit_price: number
  created_at?: string
}

export default function CartDropdown({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | undefined>(undefined)
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isNavigatingToCart, setIsNavigatingToCart] = useState(false)

  // Local state for instant 0ms optimistic changes
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([])
  const [quantityOverrides, setQuantityOverrides] = useState<Record<string, number>>({})
  const [optimisticNewItems, setOptimisticNewItems] = useState<UnifiedCartItem[]>([])

  // Debounce timers & pending updates refs
  const debounceTimersRef = useRef<Record<string, NodeJS.Timeout>>({})
  const pendingUpdatesRef = useRef<Record<string, number>>({})

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const timedOpen = () => {
    open()
    if (activeTimer) clearTimeout(activeTimer)
    const timer = setTimeout(close, 4500)
    setActiveTimer(timer)
  }

  const openAndCancel = () => {
    if (activeTimer) clearTimeout(activeTimer)
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer)
      // Clear all debounce timers on unmount
      Object.values(debounceTimersRef.current).forEach((t) => clearTimeout(t))
    }
  }, [activeTimer])

  // 1. Raw server items from Medusa
  const rawServerItems = cartState?.items || []

  // 2. Consolidate server items by variant/product to eliminate duplicate rows in UI
  const consolidatedServerItems: UnifiedCartItem[] = useMemo(() => {
    const map = new Map<string, UnifiedCartItem>()

    for (const item of rawServerItems) {
      if (deletedItemIds.includes(item.id)) continue

      const variantKey = item.variant_id || item.variant?.id || item.product_handle || item.id
      const overrideQty = quantityOverrides[item.id]

      if (map.has(variantKey)) {
        const existing = map.get(variantKey)!
        existing.lineIds = existing.lineIds ? [...existing.lineIds, item.id] : [existing.lineId || existing.id, item.id]
        if (typeof overrideQty === "number") {
          existing.quantity = overrideQty
        } else {
          existing.quantity += item.quantity
        }
      } else {
        const activeQty = typeof overrideQty === "number" ? overrideQty : item.quantity
        map.set(variantKey, {
          id: item.id,
          lineId: item.id,
          lineIds: [item.id],
          variantId: item.variant_id || item.variant?.id,
          title: item.title,
          product_handle: item.product_handle,
          thumbnail: item.thumbnail,
          metadata: item.metadata,
          variantTitle: item.variant?.title || item.subtitle || "১ কেজি",
          quantity: activeQty,
          unit_price: item.unit_price,
          created_at: item.created_at,
        })
      }
    }

    return Array.from(map.values()).filter((item) => item.quantity > 0)
  }, [rawServerItems, deletedItemIds, quantityOverrides])

  // 3. Active optimistic new items (excluding any that server has now confirmed)
  const activeNewItems: UnifiedCartItem[] = optimisticNewItems
    .filter((newItem) => !deletedItemIds.includes(newItem.id))
    .filter(
      (newItem) =>
        !consolidatedServerItems.some(
          (srv) =>
            (newItem.variantId && srv.variantId === newItem.variantId) ||
            srv.product_handle === newItem.product_handle
        )
    )
    .map((newItem) => {
      const activeQty = quantityOverrides[newItem.id] ?? newItem.quantity
      return {
        ...newItem,
        quantity: activeQty,
      }
    })
    .filter((item) => item.quantity > 0)

  // 4. Unified Display List (0ms Single Source of Truth!)
  const displayItems: UnifiedCartItem[] = [...activeNewItems, ...consolidatedServerItems]

  // Totals
  const totalItems = displayItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalSubtotal = displayItems.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  )
  const hasItems = totalItems > 0

  // Server signature to detect real backend updates
  const serverSignature = rawServerItems
    .map((i) => `${i.id}_${i.quantity}`)
    .join("|")
  const prevSignatureRef = useRef<string>(serverSignature)

  useEffect(() => {
    if (prevSignatureRef.current === serverSignature) return

    // Clean up deleted IDs for items permanently gone from server
    setDeletedItemIds((prev) =>
      prev.filter((id) => rawServerItems.some((item) => item.id === id))
    )

    // Clean up optimistic new items that have appeared in server items
    setOptimisticNewItems((prev) =>
      prev.filter(
        (opt) =>
          !rawServerItems.some(
            (srv) =>
              (opt.variantId && srv.variant_id === opt.variantId) ||
              srv.product_handle === opt.product_handle
          )
      )
    )

    // Clean up quantity overrides that are now reflected on server
    setQuantityOverrides((prev) => {
      const next = { ...prev }
      for (const [id, qty] of Object.entries(prev)) {
        const srv = rawServerItems.find((i) => i.id === id)
        if (srv && srv.quantity === qty) {
          delete next[id]
        }
      }
      return next
    })

    prevSignatureRef.current = serverSignature
  }, [serverSignature, rawServerItems])

  // Sync active cart item quantities globally for product cards & sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    const cartMap: Record<string, { quantity: number; lineId?: string; variantId?: string }> = {}
    displayItems.forEach((item) => {
      const info = { quantity: item.quantity, lineId: item.lineId, variantId: item.variantId }
      if (item.variantId) cartMap[item.variantId] = info
      if (item.product_handle) cartMap[item.product_handle] = info
      if (item.id) cartMap[item.id] = info
    })
    ;(window as any).__CART_MAP__ = cartMap
    try {
      sessionStorage.setItem("medusa_cart_map", JSON.stringify(cartMap))
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: cartMap }))
  }, [displayItems])

  // =========================================================================
  // DEBOUNCED SYNC ENGINE (400ms Sweet Spot)
  // =========================================================================
  const queueSync = (
    itemId: string,
    lineId: string | undefined,
    variantId: string | undefined,
    newQty: number,
    lineIds?: string[]
  ) => {
    const key = lineId || itemId
    pendingUpdatesRef.current[key] = newQty

    // Clear previous timer for this item
    if (debounceTimersRef.current[key]) {
      clearTimeout(debounceTimersRef.current[key])
    }

    // Set 400ms debounce timer (fires ONLY 1 clean request after user pauses clicking)
    debounceTimersRef.current[key] = setTimeout(async () => {
      const finalQty = pendingUpdatesRef.current[key]
      delete pendingUpdatesRef.current[key]
      delete debounceTimersRef.current[key]

      if (typeof finalQty !== "number") return

      try {
        if (lineId) {
          const allIds = lineIds && lineIds.length > 0 ? lineIds : [lineId]
          if (finalQty <= 0) {
            await Promise.all(allIds.map((lid) => deleteLineItem(lid)))
          } else {
            await updateLineItem({ lineId, quantity: finalQty })
            if (allIds.length > 1) {
              const extraIds = allIds.filter((lid) => lid !== lineId)
              await Promise.all(extraIds.map((lid) => deleteLineItem(lid)))
            }
          }
        } else if (variantId && finalQty > 0) {
          await addToCart({ variantId, quantity: finalQty, countryCode: "bd" })
        }
      } catch (err) {
        console.error("Failed to sync cart item quantity:", err)
        // Rollback local override on network failure
        setQuantityOverrides((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
        window.dispatchEvent(
          new CustomEvent("cart:item-failed", {
            detail: {
              message: "ইন্টারনেট সমস্যার কারণে কার্ট আপডেট করা সম্ভব হয়নি। আবার চেষ্টা করুন।",
            },
          })
        )
      }
    }, 400)
  }

  // Handle [ + ] Button Click
  const handleIncrement = (item: UnifiedCartItem) => {
    const newQty = item.quantity + 1
    // Instant 0ms UI update
    setQuantityOverrides((prev) => ({ ...prev, [item.id]: newQty }))
    queueSync(item.id, item.lineId, item.variantId, newQty, item.lineIds)
  }

  // Handle [ - ] Button Click
  const handleDecrement = (item: UnifiedCartItem) => {
    if (item.quantity > 1) {
      const newQty = item.quantity - 1
      // Instant 0ms UI update
      setQuantityOverrides((prev) => ({ ...prev, [item.id]: newQty }))
      queueSync(item.id, item.lineId, item.variantId, newQty, item.lineIds)
    } else {
      // If quantity is 1, decrementing removes the item
      handleRemove(item)
    }
  }

  // Handle Remove / Delete Button Click (Instant 0ms removal)
  const handleRemove = async (item: UnifiedCartItem) => {
    const allIds = item.lineIds && item.lineIds.length > 0 ? item.lineIds : [item.lineId || item.id]

    // Cancel pending timer
    allIds.forEach((key) => {
      if (debounceTimersRef.current[key]) {
        clearTimeout(debounceTimersRef.current[key])
        delete debounceTimersRef.current[key]
        delete pendingUpdatesRef.current[key]
      }
    })

    // Instantly hide from UI in 0ms
    setDeletedItemIds((prev) => [...prev, ...allIds])
    setOptimisticNewItems((prev) => prev.filter((i) => !allIds.includes(i.id)))

    if (item.variantId || item.product_handle) {
      window.dispatchEvent(
        new CustomEvent("cart:item-deleted", {
          detail: {
            variantId: item.variantId,
            handle: item.product_handle,
          },
        })
      )
    }

    // Background delete from server
    try {
      await Promise.all(allIds.map((lid) => deleteLineItem(lid)))
    } catch (err) {
      console.error("Failed to delete line item:", err)
      // Rollback on failure
      setDeletedItemIds((prev) => prev.filter((id) => !allIds.includes(id)))
    }
  }

  // Auto-healing background task: permanently clean up duplicate line items from previous tests
  const autoHealedRef = useRef(false)
  useEffect(() => {
    if (autoHealedRef.current || rawServerItems.length === 0) return
    const groups: Record<string, HttpTypes.StoreCartLineItem[]> = {}
    for (const item of rawServerItems) {
      const key = item.variant_id || item.variant?.id || item.product_handle
      if (key) {
        groups[key] = groups[key] ? [...groups[key], item] : [item]
      }
    }

    const duplicateGroups = Object.values(groups).filter((list) => list.length > 1)
    if (duplicateGroups.length > 0) {
      autoHealedRef.current = true
      duplicateGroups.forEach(async (items) => {
        const totalQty = items.reduce((sum, i) => sum + i.quantity, 0)
        const primaryId = items[0].id
        const extraIds = items.slice(1).map((i) => i.id)
        try {
          await updateLineItem({ lineId: primaryId, quantity: totalQty })
          await Promise.all(extraIds.map((id) => deleteLineItem(id)))
          router.refresh()
        } catch (e) {
          console.warn("Auto-healing error:", e)
        }
      })
    }
  }, [rawServerItems, router])

  // =========================================================================
  // FLUSH PENDING DEBOUNCED UPDATES TO SERVER IMMEDIATELY
  // =========================================================================
  const flushPendingUpdates = async () => {
    const pendingKeys = Object.keys(pendingUpdatesRef.current)
    if (pendingKeys.length > 0) {
      const syncPromises = pendingKeys.map(async (key) => {
        const timer = debounceTimersRef.current[key]
        if (timer) clearTimeout(timer)
        const finalQty = pendingUpdatesRef.current[key]
        delete pendingUpdatesRef.current[key]
        delete debounceTimersRef.current[key]

        if (typeof finalQty === "number") {
          const srvItem = rawServerItems.find((i) => i.id === key)
          if (srvItem) {
            if (finalQty <= 0) {
              return deleteLineItem(srvItem.id)
            } else {
              return updateLineItem({ lineId: srvItem.id, quantity: finalQty })
            }
          }
        }
      })

      try {
        await Promise.all(syncPromises)
      } catch (err) {
        console.error("Flush before cart navigation error:", err)
      }
    }
  }

  // Handle Cart Navigation (Header Cart Icon)
  const handleGoToCartClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsNavigatingToCart(true)
    await flushPendingUpdates()
    close()
    if (totalItems > 0) {
      router.push(`/${countryCode}/checkout`)
    } else {
      router.push(`/${countryCode}/store`)
    }
    setIsNavigatingToCart(false)
  }

  // Handle Checkout Click (🛒 অর্ডার নিশ্চিত করুন (চেকআউট))
  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCheckingOut(true)
    await flushPendingUpdates()
    close()
    router.push(`/${countryCode}/checkout`)
  }

  // =========================================================================
  // LISTEN TO GLOBAL CART EVENTS (Home, Store, Product Details)
  // =========================================================================
  useEffect(() => {
    const handleItemAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle

      // 1. SMART MERGE: Check if item already exists in our active items
      const existingItem = displayItems.find(
        (i) =>
          (targetVariantId && i.variantId === targetVariantId) ||
          (targetHandle && i.product_handle === targetHandle)
      )

      if (existingItem) {
        // Product already in cart! Directly increment quantity in 0ms (NO BLINK!)
        const currentQty = existingItem.quantity
        const newQty = currentQty + (detail.quantity || 1)
        setQuantityOverrides((prev) => ({ ...prev, [existingItem.id]: newQty }))
        queueSync(existingItem.id, existingItem.lineId, existingItem.variantId, newQty, existingItem.lineIds)
      } else {
        // Brand new item: Add directly as a full unified row in 0ms!
        const newItem: UnifiedCartItem = {
          id: detail.id || `opt_${Date.now()}`,
          variantId: targetVariantId,
          title: detail.title || "খাঁটি প্রাকৃতিক মধু",
          product_handle: detail.handle || "sundarban-kholisha-honey",
          thumbnail: detail.thumbnail,
          variantTitle: detail.variant || "১ কেজি",
          quantity: detail.quantity || 1,
          unit_price: detail.price || 750,
          created_at: new Date().toISOString(),
        }

        setOptimisticNewItems((prev) => [newItem, ...prev])
        queueSync(newItem.id, undefined, newItem.variantId, newItem.quantity)
      }

      if (detail.openDropdown !== false) {
        timedOpen()
      }
    }

    const handleQuantityUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (detail.id && typeof detail.quantity === "number") {
        setQuantityOverrides((prev) => ({
          ...prev,
          [detail.id]: detail.quantity,
        }))
      }
    }

    const handleItemDecremented = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const targetId = detail.id

      const existingItem = displayItems.find(
        (i) =>
          (targetId && (i.id === targetId || i.lineId === targetId)) ||
          (targetVariantId && i.variantId === targetVariantId) ||
          (targetHandle && i.product_handle === targetHandle)
      )

      if (existingItem) {
        if (existingItem.quantity > 1) {
          const newQty = existingItem.quantity - 1
          setQuantityOverrides((prev) => ({ ...prev, [existingItem.id]: newQty }))
          queueSync(existingItem.id, existingItem.lineId, existingItem.variantId, newQty, existingItem.lineIds)
        } else {
          handleRemove(existingItem)
        }
      }
    }

    const handleItemDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const targetId = detail.id

      const existingItem = displayItems.find(
        (i) =>
          (targetId && (i.id === targetId || i.lineId === targetId)) ||
          (targetVariantId && i.variantId === targetVariantId) ||
          (targetHandle && i.product_handle === targetHandle)
      )

      if (existingItem) {
        handleRemove(existingItem)
      }
    }

    window.addEventListener("cart:item-added", handleItemAdded)
    window.addEventListener("cart:quantity-updated", handleQuantityUpdated)
    window.addEventListener("cart:item-decremented", handleItemDecremented)
    window.addEventListener("cart:item-deleted", handleItemDeleted)

    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded)
      window.removeEventListener("cart:quantity-updated", handleQuantityUpdated)
      window.removeEventListener("cart:item-decremented", handleItemDecremented)
      window.removeEventListener("cart:item-deleted", handleItemDeleted)
    }
  }, [displayItems, rawServerItems])

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full flex items-center">
        <PopoverButton className="h-full flex items-center focus:outline-none">
          <LocalizedClientLink
            className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors relative cursor-pointer"
            href="/cart"
            onClick={handleGoToCartClick}
            data-testid="nav-cart-link"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
              {totalItems > 0 && (
                <span
                  className="absolute -top-1.5 -right-2 font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 bg-amber-500 text-white"
                >
                  {formatSize(String(totalItems))}
                </span>
              )}
            </div>
            <span className="text-[11px] font-semibold mt-0.5 leading-tight">কার্ট</span>
          </LocalizedClientLink>
        </PopoverButton>

        <Transition
          show={cartDropdownOpen}
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="opacity-0 translate-y-1"
          enterTo="opacity-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="opacity-100 translate-y-0"
          leaveTo="opacity-0 translate-y-1"
        >
          <PopoverPanel
            static
            className="hidden small:block absolute top-[calc(100%+1px)] right-0 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl w-[400px] text-zinc-900 dark:text-zinc-100 overflow-hidden"
            data-testid="nav-cart-dropdown"
          >
            {/* Header */}
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-50/70 dark:bg-zinc-950/40">
              <div className="flex items-center gap-2">
                <span className="text-base">🍯</span>
                <h3 className="font-bold text-sm tracking-tight text-zinc-900 dark:text-zinc-100">
                  আপনার শপিং কার্ট
                </h3>
              </div>
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {totalItems > 0 ? `${formatSize(String(totalItems))} টি পণ্য` : "খালি"}
              </span>
            </div>

            {hasItems ? (
              <>
                {/* 100% UNIFIED ITEM LIST (Matching Image 3: Zero-Blink, Stepper on Row, Instant Feedback) */}
                <div className="overflow-y-scroll max-h-[380px] p-4 flex flex-col no-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {displayItems.map((item) => {
                    const imageUrl = resolveProductImage({
                      thumbnail: item.thumbnail,
                      metadata: item.metadata,
                      handle: item.product_handle,
                      title: item.title,
                    })

                    const currentQty = item.quantity
                    const itemTotalPrice = item.unit_price * currentQty
                    const variantLabel = item.variantTitle || "১ কেজি"

                    return (
                      <div
                        className="py-3.5 first:pt-0 last:pb-0 flex gap-x-3 items-center group transition-colors"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        {/* Product Image */}
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          onClick={close}
                          className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center relative group"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={item.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 text-amber-700 dark:text-amber-400">
                              <span className="text-2xl">🍯</span>
                              <span className="text-[9px] font-bold">মধু</span>
                            </div>
                          )}
                        </LocalizedClientLink>

                        {/* Product Details & Stepper */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          {/* Row 1: Title & Single Remove Button */}
                          <div className="flex items-start justify-between gap-1">
                            <div className="min-w-0 flex-1">
                              <h4 className="text-xs sm:text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">
                                <LocalizedClientLink
                                  href={`/products/${item.product_handle}`}
                                  onClick={close}
                                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                  data-testid="product-link"
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h4>
                              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                                সাইজ:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  {formatSize(variantLabel)}
                                </span>
                              </p>
                            </div>

                            {/* Clean Delete Button (Right top '✕') */}
                            <button
                              type="button"
                              onClick={() => handleRemove(item)}
                              className="p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-800"
                              aria-label="মুছে ফেলুন"
                              data-testid="cart-item-remove-button"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row 2 (Matching Image 3): Stepper [-] [Qty] [+] on Left, Price on Right */}
                          <div className="flex items-center justify-between pt-2">
                            {/* Stepper matching Image 3: [-] [Qty] [+] */}
                            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
                              <button
                                type="button"
                                onClick={() => handleDecrement(item)}
                                className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold text-sm select-none cursor-pointer"
                                aria-label="পরিমাণ কমান"
                              >
                                -
                              </button>
                              <span className="w-8 text-center text-xs font-black text-zinc-900 dark:text-zinc-100 select-none">
                                {formatSize(String(currentQty))}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleIncrement(item)}
                                className="w-7 h-7 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold text-sm select-none cursor-pointer"
                                aria-label="পরিমাণ বাড়ান"
                              >
                                +
                              </button>
                            </div>

                            {/* Price breakdown matching Image 3 */}
                            <div className="text-right">
                              <div className="text-xs sm:text-sm font-black text-zinc-900 dark:text-zinc-100">
                                {formatPrice(itemTotalPrice)}
                              </div>
                              {currentQty > 1 && (
                                <div className="text-[10px] text-zinc-400">
                                  {formatSize(String(currentQty))} × {formatPrice(item.unit_price)}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Subtotal & Dual Bottom Action Buttons (Checkout + View Cart) */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col gap-y-2.5">
                  <div className="flex items-center justify-between text-sm pb-1">
                    <span className="font-bold text-zinc-600 dark:text-zinc-400">
                      মোট বিল:
                    </span>
                    <span
                      className="text-base sm:text-lg font-black text-emerald-800 dark:text-emerald-400"
                      data-testid="cart-subtotal"
                    >
                      {formatPrice(totalSubtotal)}
                    </span>
                  </div>

                  {/* Primary Button: 🛒 অর্ডার নিশ্চিত করুন with Instant Flush */}
                  <button
                    type="button"
                    onClick={handleCheckoutClick}
                    disabled={isCheckingOut}
                    className="w-full h-11 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-[0.99] text-white font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md shadow-amber-600/20 cursor-pointer disabled:opacity-80"
                  >
                    {isCheckingOut ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    <span>{isCheckingOut ? "অর্ডার পেজে যাওয়া হচ্ছে..." : "🛒 অর্ডার নিশ্চিত করুন"}</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="py-12 px-6 flex flex-col items-center justify-center text-center">
                <div className="w-12 h-12 rounded-full bg-amber-100 dark:bg-amber-950/60 flex items-center justify-center text-xl mb-3">
                  🍯
                </div>
                <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  আপনার শপিং কার্ট খালি
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 max-w-[220px]">
                  পছন্দের খাঁটি মধু বেছে নিয়ে কার্টে যোগ করুন।
                </p>
                <div className="mt-4">
                  <LocalizedClientLink
                    href="/store"
                    onClick={close}
                    className="inline-flex h-9 items-center justify-center px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs transition-colors"
                  >
                    মধু ব্রাউজ করুন ➔
                  </LocalizedClientLink>
                </div>
              </div>
            )}
          </PopoverPanel>
        </Transition>
      </Popover>
    </div>
  )
}
