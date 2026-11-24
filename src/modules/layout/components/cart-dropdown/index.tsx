"use client"

import { convertToLocale, formatPrice, formatSize } from "@lib/util/money"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter, usePathname } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState, useTransition } from "react"
import { createPortal } from "react-dom"
import { ShoppingCart, ShoppingBag, X, Truck, Loader2, Minus, Plus, ArrowRight, Tag, Trash2 } from "lucide-react"

// Cloudinary images for known products (in case database thumbnail field is null)
const KNOWN_HONEY_IMAGES: Record<string, string> = {
  "sundarban-kholisha-honey":
    "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg",
  "mustard-flower-honey":
    "/images/hero/slider-mustard.jpg",
  "black-seed-flower-honey":
    "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167194/2f318c58-a2a2-48bc-80e6-56ccd4b5a553_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg.jpg",
}

const MAX_ITEM_QUANTITY = 20

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
  raw?: any
}

export default function CartDropdown({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const router = useRouter()
  const params = useParams()
  const pathname = usePathname()
  const countryCode = (params?.countryCode as string) || "bd"
  const isCheckoutPage = pathname?.includes("/checkout")
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBadgePulsing, setIsBadgePulsing] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [isWaitingForRefresh, setIsWaitingForRefresh] = useState(false)
  const refreshStartedRef = useRef(false)
  const [mounted, setMounted] = useState(false)
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Coordination: Keep drawer open & locked until server refresh DOM commit completes
  useEffect(() => {
    if (isPending && isWaitingForRefresh) {
      refreshStartedRef.current = true
    } else if (refreshStartedRef.current && !isPending && isWaitingForRefresh) {
      refreshStartedRef.current = false
      setIsWaitingForRefresh(false)
      setIsCheckingOut(false)
      setIsDrawerOpen(false)
    }
  }, [isPending, isWaitingForRefresh])

  // Safety fallback: Never leave drawer stuck in updating state
  useEffect(() => {
    if (isWaitingForRefresh) {
      const timer = setTimeout(() => {
        refreshStartedRef.current = false
        setIsWaitingForRefresh(false)
        setIsCheckingOut(false)
        setIsDrawerOpen(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [isWaitingForRefresh])

  const isBusyUpdating = isCheckingOut || isWaitingForRefresh || (isCheckoutPage && isPending && isDrawerOpen)

  // Max Limit Toast notification
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const toastTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const showToast = (msg: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
    setToastMessage(msg)
    toastTimeoutRef.current = setTimeout(() => {
      setToastMessage(null)
    }, 3000)
  }

  // Rapid spam clicking protection (Circuit Breaker)
  const [syncingItemId, setSyncingItemId] = useState<string | null>(null)
  const rapidClicksRef = useRef<Record<string, number>>({})
  const rapidResetTimeoutRef = useRef<Record<string, NodeJS.Timeout>>({})

  useEffect(() => {
    setMounted(true)
  }, [])

  // Local state for instant 0ms optimistic changes
  const [items, setItems] = useState<UnifiedCartItem[]>([])
  const [variantOrder, setVariantOrder] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Direct server-managed promotions & discount state
  const [activePromotions, setActivePromotions] = useState<any[]>(() => cartState?.promotions || [])
  const [cartDiscountTotal, setCartDiscountTotal] = useState<number>(() => cartState?.discount_total ?? 0)

  useEffect(() => {
    setActivePromotions(cartState?.promotions || [])
    setCartDiscountTotal(cartState?.discount_total ?? 0)
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("purehoney_promotions")
      } catch {}
    }
  }, [cartState?.promotions, cartState?.discount_total])

  useEffect(() => {
    const handlePromoUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail) {
        setActivePromotions(detail.promotions || [])
        setCartDiscountTotal(detail.discount_total ?? 0)
      }
    }
    window.addEventListener("cart:promo-updated", handlePromoUpdated)
    return () => {
      window.removeEventListener("cart:promo-updated", handlePromoUpdated)
    }
  }, [])

  // Refs for sync loop and concurrency control
  const itemsRef = useRef<UnifiedCartItem[]>([])
  itemsRef.current = items

  const variantOrderRef = useRef<string[]>([])
  variantOrderRef.current = variantOrder

  const serverItemsRef = useRef<HttpTypes.StoreCartLineItem[]>(cartState?.items || [])
  const isSyncingRef = useRef(false)
  const pendingSyncRef = useRef(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Manage drawer state with smart server-first reconciliation
  const openDrawer = () => {
    setIsDrawerOpen(true)
    if (isCheckoutPage && cartState?.items) {
      const serverUnified = convertServerItemsToUnified(cartState.items)
      setItems(serverUnified)
      itemsRef.current = serverUnified
      serverItemsRef.current = cartState.items
      const order = serverUnified.map((i) => i.variantId || i.id)
      setVariantOrder(order)
      variantOrderRef.current = order
      return
    }

    if (serverItemsRef.current.length > 0) {
      setItems((prev) => {
        const refreshed = prev.map((item) => {
          const srv = serverItemsRef.current.find(
            (s: any) =>
              (item.variantId && (s.variant_id === item.variantId || s.variant?.id === item.variantId)) ||
              (item.lineId && s.id === item.lineId)
          )
          if (srv) {
            const liveTitle = (srv as any).variant?.product?.title || (srv as any).product_title || srv.title
            const livePrice = srv.unit_price || item.unit_price
            const liveThumbnail = srv.thumbnail || (srv as any).variant?.product?.thumbnail || item.thumbnail
            return {
              ...item,
              title: liveTitle || item.title,
              unit_price: livePrice,
              thumbnail: liveThumbnail,
              raw: srv,
            }
          }
          return item
        })
        saveLocalSnapshot(refreshed, variantOrderRef.current)
        return refreshed
      })
    }
  }

  const closeDrawer = () => {
    if (isBusyUpdating) return
    setIsDrawerOpen(false)
    if (isCheckoutPage) {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
        performServerSync().then(() => {
          startTransition(() => {
            router.refresh()
          })
        })
      } else {
        startTransition(() => {
          router.refresh()
        })
      }
    }
  }

  // Engine 2: Active Tab Focus Sync - silently checks server when user returns to tab
  useEffect(() => {
    if (isCheckoutPage) return // NEVER sync on checkout page tab switch
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performServerSync()
      }
    }
    window.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [isCheckoutPage])

  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [isDrawerOpen])

  // Handle escape key to close drawer
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isDrawerOpen) {
        setIsDrawerOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isDrawerOpen])

  // Global drawer events
  useEffect(() => {
    const handleOpen = () => openDrawer()
    const handleClose = () => closeDrawer()
    window.addEventListener("cart:open-drawer", handleOpen)
    window.addEventListener("cart:close-drawer", handleClose)
    return () => {
      window.removeEventListener("cart:open-drawer", handleOpen)
      window.removeEventListener("cart:close-drawer", handleClose)
    }
  }, [])

  // Listen for explicit cart wipe (e.g. after order confirmed)
  useEffect(() => {
    const handleClear = () => {
      setItems([])
      itemsRef.current = []
      setVariantOrder([])
      variantOrderRef.current = []
      try {
        localStorage.removeItem("purehoney_cart_v2")
        sessionStorage.removeItem("medusa_cart_map")
      } catch (e) {}
    }
    window.addEventListener("cart:clear", handleClear)
    return () => window.removeEventListener("cart:clear", handleClear)
  }, [])

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current)
      Object.values(rapidResetTimeoutRef.current).forEach((t) => clearTimeout(t))
    }
  }, [])

  // Save local snapshot helper
  const saveLocalSnapshot = (curItems: UnifiedCartItem[], curOrder: string[]) => {
    if (typeof window === "undefined") return
    if (isCheckoutPage) return // NEVER write to localStorage from checkout page!
    try {
      const snapshot = {
        items: curItems.map((i) => ({
          id: i.id,
          lineId: i.lineId,
          lineIds: i.lineIds,
          variantId: i.variantId,
          title: i.title,
          product_handle: i.product_handle,
          thumbnail: i.thumbnail,
          variantTitle: i.variantTitle,
          quantity: i.quantity,
          unit_price: i.unit_price,
          created_at: i.created_at,
        })),
        order: curOrder,
        timestamp: Date.now(),
      }
      localStorage.setItem("purehoney_cart_v2", JSON.stringify(snapshot))
    } catch (e) {}
  }

  // Helper to convert server items to unified
  const convertServerItemsToUnified = (raw: HttpTypes.StoreCartLineItem[]): UnifiedCartItem[] => {
    const map = new Map<string, UnifiedCartItem>()
    for (const item of raw) {
      const key = item.variant_id || item.variant?.id || item.id
      const liveTitle =
        (item as any).variant?.product?.title || (item as any).product_title || item.title
      const liveHandle =
        (item as any).variant?.product?.handle || item.product_handle
      const liveThumbnail =
        item.thumbnail || (item as any).variant?.product?.thumbnail

      if (map.has(key)) {
        const existing = map.get(key)!
        existing.lineIds = existing.lineIds ? [...existing.lineIds, item.id] : [existing.id, item.id]
        existing.quantity += item.quantity
        existing.title = liveTitle || existing.title
        existing.unit_price = item.unit_price || existing.unit_price
        existing.thumbnail = liveThumbnail || existing.thumbnail
        existing.raw = item
      } else {
        map.set(key, {
          id: item.id,
          lineId: item.id,
          lineIds: [item.id],
          variantId: item.variant_id || item.variant?.id,
          title: liveTitle,
          product_handle: liveHandle,
          thumbnail: liveThumbnail,
          metadata: item.metadata,
          variantTitle: item.variant?.title || item.subtitle || "১ কেজি",
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
          raw: item,
        })
      }
    }
    return Array.from(map.values()).filter((i) => i.quantity > 0)
  }

  // Perform server sync: diffs client against server and sends 1 atomic batch request
  const performServerSync = async (): Promise<boolean> => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    if (isSyncingRef.current) {
      pendingSyncRef.current = true
      return false
    }

    isSyncingRef.current = true

    try {
      const currentItems = itemsRef.current
      const serverItems = serverItemsRef.current

      // 1. If cart is completely empty:
      if (currentItems.length === 0) {
        if (serverItems.length > 0) {
          await fetch("/api/cart/batch", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ clearAll: true }),
            keepalive: true,
          })
          serverItemsRef.current = []
        }
        return true
      }

      // 2. Compute deletions: items in server not in client
      const deletions: Array<{ lineId: string; variantId?: string }> = []
      for (const srv of serverItems) {
        const stillInClient = currentItems.some(
          (c) =>
            (c.variantId && srv.variant_id && srv.variant_id === c.variantId) ||
            (c.lineId && srv.id === c.lineId)
        )
        if (!stillInClient) {
          deletions.push({ lineId: srv.id, variantId: srv.variant_id || undefined })
        }
      }

      // 3. Compute additions & updates
      const additions: Array<{ variantId: string; quantity: number }> = []
      const updates: Array<{ lineId: string; quantity: number }> = []

      for (const cItem of currentItems) {
        const matchingSrv = serverItems.find(
          (s) =>
            (cItem.variantId && s.variant_id && s.variant_id === cItem.variantId) ||
            (cItem.lineId && s.id === cItem.lineId)
        )

        if (!matchingSrv) {
          if (cItem.variantId) {
            additions.push({ variantId: cItem.variantId, quantity: cItem.quantity })
          }
        } else if (matchingSrv.quantity !== cItem.quantity) {
          updates.push({ lineId: matchingSrv.id, quantity: cItem.quantity })
        }
      }

      const desiredItems = currentItems
        .filter((c) => Boolean(c.variantId) && c.quantity > 0)
        .map((c) => ({ variantId: c.variantId!, quantity: c.quantity }))

      if (deletions.length > 0 || additions.length > 0 || updates.length > 0 || desiredItems.length > 0) {
        const res = await fetch("/api/cart/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deletions, additions, updates, desiredItems }),
          keepalive: true,
        })

        if (res.ok) {
          const data = await res.json()
          if (data?.items && Array.isArray(data.items)) {
            serverItemsRef.current = data.items
            // Update lineIds and live product metadata (title, price, thumbnail) on client items
            setItems((prev) => {
              const updated = prev.map((it) => {
                const srv = data.items.find(
                  (s: any) =>
                    (it.variantId && (s.variant_id === it.variantId || s.variant?.id === it.variantId)) ||
                    (it.lineId && s.id === it.lineId)
                )
                if (srv) {
                  const liveTitle =
                    (srv as any).variant?.product?.title || (srv as any).product_title || srv.title
                  const livePrice = srv.unit_price || it.unit_price
                  const liveThumbnail =
                    srv.thumbnail || (srv as any).variant?.product?.thumbnail || it.thumbnail
                  return {
                    ...it,
                    lineId: srv.id,
                    lineIds: [srv.id],
                    title: liveTitle || it.title,
                    unit_price: livePrice,
                    thumbnail: liveThumbnail,
                    raw: srv,
                  }
                }
                return it
              })
              saveLocalSnapshot(updated, variantOrderRef.current)
              return updated
            })
          }
        }
      }

      return true
    } catch (err) {
      console.error("Cart sync error:", err)
      return false
    } finally {
      isSyncingRef.current = false
      if (pendingSyncRef.current) {
        pendingSyncRef.current = false
        performServerSync()
      }
    }
  }

  const scheduleServerSync = (delayMs: number = 350) => {
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
    }
    syncTimeoutRef.current = setTimeout(() => {
      performServerSync()
    }, delayMs)
  }

  // Register global flush method so product cards can await it during direct checkout
  useEffect(() => {
    if (typeof window !== "undefined") {
      ;(window as any).__FLUSH_CART_SYNC__ = performServerSync
    }
  }, [])

  // Mount reconciliation
  useEffect(() => {
    if (typeof window === "undefined") return

    const rawServer = cartState?.items || []
    serverItemsRef.current = rawServer

    // 1. Checkout Page: 100% Server-First source of truth. Zero localStorage reads/writes.
    if (isCheckoutPage) {
      const serverUnified = convertServerItemsToUnified(rawServer)
      setItems(serverUnified)
      itemsRef.current = serverUnified
      const initialOrder = serverUnified.map((i) => i.variantId || i.id)
      setVariantOrder(initialOrder)
      variantOrderRef.current = initialOrder
      setIsInitialized(true)
      return
    }

    // 2. If server cart has items, server data ALWAYS wins!
    if (rawServer.length > 0) {
      const serverUnified = convertServerItemsToUnified(rawServer)
      setItems(serverUnified)
      itemsRef.current = serverUnified
      const initialOrder = serverUnified.map((i) => i.variantId || i.id)
      setVariantOrder(initialOrder)
      variantOrderRef.current = initialOrder
      saveLocalSnapshot(serverUnified, initialOrder)
      setIsInitialized(true)
      return
    }

    // 3. Fallback for anonymous shoppers before server cart initialization
    try {
      const stored = localStorage.getItem("purehoney_cart_v2")
      if (stored) {
        const parsed = JSON.parse(stored)
        const isRecent = Date.now() - (parsed.timestamp || 0) < 5 * 60 * 1000

        if (isRecent && Array.isArray(parsed.items) && parsed.items.length > 0) {
          setItems(parsed.items)
          itemsRef.current = parsed.items
          const curOrder = Array.isArray(parsed.order)
            ? parsed.order
            : parsed.items.map((i: any) => i.variantId || i.id)
          setVariantOrder(curOrder)
          variantOrderRef.current = curOrder
          setIsInitialized(true)
          scheduleServerSync(100)
          return
        }
      }
    } catch (e) {
      console.warn("Cart local storage read error:", e)
    }

    setItems([])
    itemsRef.current = []
    setVariantOrder([])
    variantOrderRef.current = []
    setIsInitialized(true)
  }, [cartState, isCheckoutPage])

  // Sync active cart item quantities globally for product cards & sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    if (isCheckoutPage) return // Do not emit client events or touch sessionStorage on checkout
    const cartMap: Record<string, { quantity: number; lineId?: string; variantId?: string }> = {}
    items.forEach((item) => {
      const info = { quantity: item.quantity, lineId: item.lineId, variantId: item.variantId }
      if (item.variantId) cartMap[item.variantId] = info
      if (item.id) cartMap[item.id] = info
    })
    ;(window as any).__CART_MAP__ = cartMap
    try {
      sessionStorage.setItem("medusa_cart_map", JSON.stringify(cartMap))
    } catch (e) {}
    window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: cartMap }))
  }, [items, isCheckoutPage])

  // Sorted items strictly following variantOrder (newest added on TOP!)
  const displayItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const keyA = a.variantId || a.id
      const keyB = b.variantId || b.id
      const idxA = variantOrder.indexOf(keyA)
      const idxB = variantOrder.indexOf(keyB)
      if (idxA !== -1 && idxB !== -1) return idxA - idxB
      if (idxA !== -1) return -1
      if (idxB !== -1) return 1
      const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
      const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
      return timeB - timeA
    })
  }, [items, variantOrder])

  // Totals
  const totalItems = displayItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalSubtotal = displayItems.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  )
  const hasItems = totalItems > 0

  const effectiveDiscount =
    cartDiscountTotal > 0 ? cartDiscountTotal : (cartState?.discount_total ?? 0)

  // Drawer individual promo code breakdown
  const drawerPromoBreakdown = useMemo(() => {
    if (!activePromotions || activePromotions.length === 0 || effectiveDiscount <= 0) {
      if (effectiveDiscount > 0) {
        return [{ id: "discount", code: "discount", label: "ডিসকাউন্ট", amount: effectiveDiscount }]
      }
      return []
    }

    const itemsList = displayItems || []
    let allocatedSum = 0

    const list = activePromotions.map((promo: any, index: number) => {
      const code = promo.code || `PROMO${index + 1}`

      let fromAdjustments = 0
      itemsList.forEach((it) => {
        const adjs = it.raw?.adjustments || it.metadata?.adjustments || []
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

      let calculated = 0
      if (promo.application_method) {
        const m = promo.application_method
        const val = Number(m.value || 0)
        if (m.type === "percentage") {
          calculated = Math.round((totalSubtotal * val) / 100)
        } else {
          calculated = val
        }
      } else {
        calculated = Math.round(effectiveDiscount / activePromotions.length)
      }

      allocatedSum += calculated
      return {
        id: promo.id || code,
        code,
        label: `প্রোমো কোড (${code})`,
        amount: calculated,
      }
    })

    const currentSum = list.reduce((s, p) => s + p.amount, 0)
    if (currentSum > 0 && currentSum !== effectiveDiscount && list.length > 0) {
      const diff = effectiveDiscount - currentSum
      list[list.length - 1].amount = Math.max(0, list[list.length - 1].amount + diff)
    }

    return list
  }, [activePromotions, effectiveDiscount, totalSubtotal, displayItems])

  // Stepper increment [+] with Max 20 Limit & 5-Click Circuit Breaker
  const handleIncrement = (item: UnifiedCartItem) => {
    const itemKey = item.variantId || item.id
    if (item.quantity >= MAX_ITEM_QUANTITY) {
      showToast("সর্বোচ্চ ২০টি পণ্য অর্ডার করা যাবে")
      return
    }

    const nextQty = Math.min(MAX_ITEM_QUANTITY, item.quantity + 1)
    const nextItems = itemsRef.current.map((it) =>
      it.id === item.id || (item.variantId && it.variantId === item.variantId)
        ? { ...it, quantity: nextQty }
        : it
    )
    setItems(nextItems)
    itemsRef.current = nextItems
    saveLocalSnapshot(nextItems, variantOrderRef.current)

    // Rapid click tracking (circuit breaker)
    const currentClicks = (rapidClicksRef.current[itemKey] || 0) + 1
    rapidClicksRef.current[itemKey] = currentClicks

    if (rapidResetTimeoutRef.current[itemKey]) {
      clearTimeout(rapidResetTimeoutRef.current[itemKey])
    }
    rapidResetTimeoutRef.current[itemKey] = setTimeout(() => {
      rapidClicksRef.current[itemKey] = 0
    }, 1000)

    if (currentClicks >= 5) {
      rapidClicksRef.current[itemKey] = 0
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
      setSyncingItemId(itemKey)
      performServerSync().finally(() => {
        setSyncingItemId(null)
      })
    } else {
      scheduleServerSync(350)
    }
  }

  // Stepper decrement [-] with Min 1 Limit & 5-Click Circuit Breaker
  const handleDecrement = (item: UnifiedCartItem) => {
    const itemKey = item.variantId || item.id
    if (item.quantity <= 1) {
      // Cannot decrement below 1; deletion requires trash icon
      return
    }

    const nextQty = item.quantity - 1
    const nextItems = itemsRef.current.map((it) =>
      it.id === item.id || (item.variantId && it.variantId === item.variantId)
        ? { ...it, quantity: nextQty }
        : it
    )
    setItems(nextItems)
    itemsRef.current = nextItems
    saveLocalSnapshot(nextItems, variantOrderRef.current)

    // Rapid click tracking (circuit breaker)
    const currentClicks = (rapidClicksRef.current[itemKey] || 0) + 1
    rapidClicksRef.current[itemKey] = currentClicks

    if (rapidResetTimeoutRef.current[itemKey]) {
      clearTimeout(rapidResetTimeoutRef.current[itemKey])
    }
    rapidResetTimeoutRef.current[itemKey] = setTimeout(() => {
      rapidClicksRef.current[itemKey] = 0
    }, 1000)

    if (currentClicks >= 5) {
      rapidClicksRef.current[itemKey] = 0
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current)
        syncTimeoutRef.current = null
      }
      setSyncingItemId(itemKey)
      performServerSync().finally(() => {
        setSyncingItemId(null)
      })
    } else {
      scheduleServerSync(350)
    }
  }

  // Dedicated item deletion (Trash icon)
  const handleRemove = (item: UnifiedCartItem) => {
    const targetKey = item.variantId || item.id
    const nextItems = itemsRef.current.filter((it) => {
      if (item.variantId && it.variantId) {
        return it.variantId !== item.variantId
      }
      if (item.lineId && it.lineId) {
        return it.lineId !== item.lineId
      }
      return it.id !== item.id
    })

    const nextOrder = variantOrderRef.current.filter((k) => k !== targetKey)
    setItems(nextItems)
    itemsRef.current = nextItems
    setVariantOrder(nextOrder)
    variantOrderRef.current = nextOrder
    saveLocalSnapshot(nextItems, nextOrder)

    // Reset rapid clicks for removed item
    rapidClicksRef.current[targetKey] = 0
    if (rapidResetTimeoutRef.current[targetKey]) {
      clearTimeout(rapidResetTimeoutRef.current[targetKey])
    }

    window.dispatchEvent(
      new CustomEvent("cart:item-deleted", {
        detail: {
          id: item.id,
          lineId: item.lineId,
          variantId: item.variantId,
        },
      })
    )

    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    // Immediate deletion to server with keepalive to guarantee backend update even if tab is closed
    fetch("/api/cart/batch", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        deletions: [{ lineId: item.lineId || item.id, variantId: item.variantId }],
        desiredItems: nextItems
          .filter((i) => Boolean(i.variantId) && i.quantity > 0)
          .map((i) => ({ variantId: i.variantId!, quantity: i.quantity })),
        clearAll: nextItems.length === 0,
      }),
      keepalive: true,
    }).catch((e) => console.warn("[cart-dropdown] immediate deletion warning:", e))
  }

  // Navigation handlers (Immediate Flush & Gatekeeper)
  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    if (isCheckingOut) return
    setIsCheckingOut(true)

    // 1. Immediately cancel pending debounce timer
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current)
      syncTimeoutRef.current = null
    }

    // 2. Wait for any in-flight background sync to fully settle
    while (isSyncingRef.current) {
      await new Promise((resolve) => setTimeout(resolve, 50))
    }

    // 3. Direct, guaranteed atomic save to backend and await HTTP 200
    const currentItems = itemsRef.current
    const desiredItems = currentItems
      .filter((c) => Boolean(c.variantId) && c.quantity > 0)
      .map((c) => ({ variantId: c.variantId!, quantity: c.quantity }))

    try {
      const res = await fetch("/api/cart/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          desiredItems,
          clearAll: desiredItems.length === 0,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data?.items && Array.isArray(data.items)) {
          serverItemsRef.current = data.items
        }
      }
    } catch (err) {
      console.error("[handleCheckoutClick] direct sync error:", err)
    }

    // 4. On checkout page, keep drawer locked with spinner until router.refresh commits to DOM
    if (isCheckoutPage) {
      refreshStartedRef.current = true
      setIsWaitingForRefresh(true)
      startTransition(() => {
        router.refresh()
      })
    } else {
      window.location.href = `/${countryCode}/checkout`
    }
  }

  // Listen to Global Cart Events
  useEffect(() => {
    const handleItemAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const itemKey = targetVariantId || detail.id || targetHandle
      const currentItems = itemsRef.current

      const existingIndex = currentItems.findIndex((i) =>
        targetVariantId
          ? Boolean(i.variantId && i.variantId === targetVariantId)
          : targetHandle
          ? i.product_handle === targetHandle
          : false
      )

      let nextItems: UnifiedCartItem[]
      let nextOrder = variantOrderRef.current

      if (existingIndex !== -1) {
        // Product already in cart: increment in-place up to MAX_ITEM_QUANTITY!
        const existing = currentItems[existingIndex]
        if (existing.quantity >= MAX_ITEM_QUANTITY) {
          showToast("সর্বোচ্চ ২০টি পণ্য অর্ডার করা যাবে")
          return
        }
        const addQty = detail.quantity || 1
        const nextQty = Math.min(MAX_ITEM_QUANTITY, existing.quantity + addQty)
        nextItems = currentItems.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: nextQty } : it
        )
      } else {
        // Brand new item: Put at TOP of variantOrder and items!
        // ONLY FOR BRAND NEW PRODUCT: Trigger Badge Pop & Pulse (Smooth 500ms duration)
        setIsBadgePulsing(true)
        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
        badgeTimerRef.current = setTimeout(() => {
          setIsBadgePulsing(false)
        }, 500)

        const initialQty = Math.min(MAX_ITEM_QUANTITY, detail.quantity || 1)
        const newItem: UnifiedCartItem = {
          id: detail.id || `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          variantId: targetVariantId,
          title: detail.title || "খাঁটি প্রাকৃতিক মধু",
          product_handle: detail.handle || "sundarban-kholisha-honey",
          thumbnail: detail.thumbnail,
          variantTitle: detail.variant || "১ কেজি",
          quantity: initialQty,
          unit_price: detail.price || 750,
          created_at: new Date().toISOString(),
        }
        nextItems = [newItem, ...currentItems]
        nextOrder = [itemKey, ...nextOrder.filter((k) => k !== itemKey)]
        setVariantOrder(nextOrder)
        variantOrderRef.current = nextOrder
      }

      setItems(nextItems)
      itemsRef.current = nextItems
      saveLocalSnapshot(nextItems, nextOrder)
      scheduleServerSync(350)

      if (detail.openDrawer === true) {
        openDrawer()
      }
    }

    const handleQuantityUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      if (detail.id && typeof detail.quantity === "number") {
        const nextItems = itemsRef.current.map((it) =>
          it.id === detail.id || it.variantId === detail.id
            ? { ...it, quantity: detail.quantity }
            : it
        )
        setItems(nextItems)
        itemsRef.current = nextItems
        saveLocalSnapshot(nextItems, variantOrderRef.current)
        scheduleServerSync()
      }
    }

    const handleItemDecremented = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const targetId = detail.id

      const existing = itemsRef.current.find((i) => {
        if (targetVariantId && i.variantId) return i.variantId === targetVariantId
        if (targetId) return i.id === targetId || i.lineId === targetId
        if (!targetVariantId && !targetId && targetHandle) return i.product_handle === targetHandle
        return false
      })

      if (existing) {
        if (existing.quantity > 1) {
          handleDecrement(existing)
        } else {
          handleRemove(existing)
        }
      }
    }

    const handleItemDeleted = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const targetId = detail.id

      const existing = itemsRef.current.find((i) => {
        if (targetVariantId && i.variantId) return i.variantId === targetVariantId
        if (targetId) return i.id === targetId || i.lineId === targetId
        if (!targetVariantId && !targetId && targetHandle) return i.product_handle === targetHandle
        return false
      })

      if (existing) {
        handleRemove(existing)
      }
    }

    const handleFlushSync = () => {
      performServerSync()
    }

    window.addEventListener("cart:item-added", handleItemAdded)
    window.addEventListener("cart:quantity-updated", handleQuantityUpdated)
    window.addEventListener("cart:item-decremented", handleItemDecremented)
    window.addEventListener("cart:item-deleted", handleItemDeleted)
    window.addEventListener("cart:flush-sync", handleFlushSync)

    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded)
      window.removeEventListener("cart:quantity-updated", handleQuantityUpdated)
      window.removeEventListener("cart:item-decremented", handleItemDecremented)
      window.removeEventListener("cart:item-deleted", handleItemDeleted)
      window.removeEventListener("cart:flush-sync", handleFlushSync)
    }
  }, [])

  return (
    <div className="h-full flex items-center">
      {/* Header Cart Button with Badge Pop & Pulse */}
      <button
        type="button"
        onClick={openDrawer}
        className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors relative cursor-pointer focus:outline-none"
        data-testid="nav-cart-button"
        aria-label="শপিং কার্ট খুলুন"
      >
        <div className="relative">
          <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
          {totalItems > 0 && (
            <>
              {/* Pulse Ring for New Product Add */}
              {isBadgePulsing && (
                <span className="absolute -top-1.5 -right-2 min-w-4 h-4 px-1 rounded-full bg-amber-400 animate-ping opacity-75 pointer-events-none" />
              )}
              {/* Badge Pop */}
              <span
                className={`absolute -top-1.5 -right-2 font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm text-white select-none transition-all duration-500 ease-out ${
                  isBadgePulsing
                    ? "scale-135 bg-amber-500 shadow-md shadow-amber-500/60 ring-2 ring-amber-300"
                    : "scale-100 bg-amber-500"
                }`}
              >
                {formatSize(String(totalItems))}
              </span>
            </>
          )}
        </div>
        <span className="text-[11px] font-semibold mt-0.5 leading-tight">কার্ট</span>
      </button>

      {/* Render Backdrop & Drawer directly into document.body to avoid parent CSS containing block constraints */}
      {mounted &&
        createPortal(
          <>
            {/* Sticky Floating Cart Widget on Right Edge (Mobile & Desktop) */}
            {totalItems > 0 && !isDrawerOpen && !isCheckoutPage && (
              <button
                type="button"
                onClick={openDrawer}
                className="fixed right-0 top-1/2 -translate-y-1/2 z-[9990] flex flex-col rounded-l-[6px] overflow-hidden shadow-xl hover:shadow-2xl border-l border-y border-[#f26522] cursor-pointer transition-all duration-200 select-none group hover:-translate-x-0.5 active:scale-95"
                aria-label="শপিং কার্ট খুলুন"
              >
                {/* Top Half: Solid Orange with Shopping Bag + Item Count */}
                <div className="bg-[#f26522] py-1.5 md:py-2 px-2 md:px-2.5 flex flex-col items-center justify-center text-white min-w-[62px] md:min-w-[76px]">
                  <ShoppingBag className="w-4 h-4 md:w-5 md:h-5 text-white stroke-[2.2] group-hover:scale-105 transition-transform" />
                  <span className="text-[10px] md:text-[11px] font-bold leading-tight mt-0.5 whitespace-nowrap">
                    {formatSize(String(totalItems))} টি পণ্য
                  </span>
                </div>

                {/* Bottom Half: Pure White with Orange Price */}
                <div className="bg-white dark:bg-zinc-900 py-1 md:py-1.5 px-1.5 md:px-2 text-center border-t border-orange-200 dark:border-zinc-800">
                  <span className="text-[10px] md:text-[11px] sm:text-xs font-black text-[#f26522] tracking-tight leading-none block whitespace-nowrap">
                    {formatPrice(totalSubtotal)}
                  </span>
                </div>
              </button>
            )}

            {/* Drawer Overlay Backdrop */}
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9999] transition-opacity duration-300 ease-in-out ${
                isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={() => {
                if (!isBusyUpdating) closeDrawer()
              }}
              aria-hidden="true"
            />

            {/* Slide-over Drawer Panel (Full Screen Height, Right to Left, matching Image 2) */}
            <aside
              className={`fixed inset-y-0 right-0 z-[10000] w-full max-w-[420px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col h-screen max-h-screen transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 ${
                isDrawerOpen ? "translate-x-0" : "translate-x-full"
              }`}
              aria-modal="true"
              role="dialog"
            >
              {/* Drawer Header (Matching Image: SHOPPING CART / Close →) */}
              <div className="p-4 sm:p-5 border-b border-gray-150 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
                <h3 className="font-bold text-sm sm:text-base tracking-wider uppercase text-zinc-900 dark:text-zinc-100">
                  শপিং কার্ট
                </h3>
                <button
                  type="button"
                  onClick={closeDrawer}
                  disabled={isBusyUpdating}
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group disabled:opacity-50 disabled:cursor-not-allowed"
                  aria-label="কার্ট বন্ধ করুন"
                  data-testid="close-cart-drawer"
                >
                  <span>বন্ধ করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Toast Notification Banner (e.g. Max 20 items reached) */}
              {toastMessage && (
                <div className="mx-4 mt-2 px-3 py-2 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-800 dark:text-amber-200 text-xs font-medium flex items-center justify-between shrink-0 animate-in fade-in slide-in-from-top-1 duration-200">
                  <div className="flex items-center gap-1.5">
                    <span>⚠️</span>
                    <span>{toastMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setToastMessage(null)}
                    className="p-0.5 hover:opacity-75 text-amber-800 dark:text-amber-200 cursor-pointer"
                    aria-label="বার্তা বন্ধ করুন"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}

              {/* Active Processing Lock Overlay */}
              {isBusyUpdating && (
                <div className="absolute inset-0 bg-white/75 dark:bg-zinc-900/75 backdrop-blur-[1px] z-50 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">
                    {isCheckoutPage ? "আপডেট সংরক্ষণ করা হচ্ছে..." : "আপনার অর্ডারটি প্রস্তুত হচ্ছে..."}
                  </p>
                </div>
              )}

              {/* Drawer Body (Full height compact scrollable list) */}
              {hasItems ? (
                <>
                  {/* Scrollable Items List - Line separated items matching Image 1 */}
                  <div className="flex-1 overflow-y-auto min-h-0 px-4 py-1 flex flex-col divide-y divide-gray-150 dark:divide-zinc-800">
                    {displayItems.map((item) => {
                      const itemKey = item.variantId || item.id
                      const isItemSyncing = syncingItemId === itemKey
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
                          className="relative py-3 sm:py-3.5 flex items-center gap-2.5 transition-colors"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          {/* Product Image - Clean square */}
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            onClick={closeDrawer}
                            className="w-12 h-12 sm:w-14 sm:h-14 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-gray-200/90 dark:border-zinc-700/80 flex items-center justify-center p-0.5 relative group"
                          >
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={item.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                              />
                            ) : (
                              <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 text-amber-700 dark:text-amber-400">
                                <span className="text-xl">🍯</span>
                                <span className="text-[9px] font-normal">মধু</span>
                              </div>
                            )}
                          </LocalizedClientLink>

                          {/* Product Details & Stepper */}
                          <div className="flex-1 min-w-0 flex flex-col justify-center">
                            {/* Row 1: Title & Variant with pr-9 sm:pr-10 so (১ কেজি) has clean space from delete button */}
                            <div className="flex items-center gap-1.5 min-w-0 pr-9 sm:pr-10">
                              <h4 className="text-xs sm:text-sm font-normal truncate min-w-0 flex-1 text-zinc-900 dark:text-zinc-100">
                                <LocalizedClientLink
                                  href={`/products/${item.product_handle}`}
                                  onClick={closeDrawer}
                                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-normal"
                                  data-testid="product-link"
                                  title={`${item.title} ${variantLabel ? `(${formatSize(variantLabel)})` : ""}`}
                                >
                                  {item.title}
                                </LocalizedClientLink>
                              </h4>
                              {variantLabel && (
                                <span className="shrink-0 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-normal select-none mr-1">
                                  ({formatSize(variantLabel)})
                                </span>
                              )}
                            </div>

                            {/* Row 2: Stepper × Unit Price = Total */}
                            <div className="flex items-center gap-2 mt-1 sm:mt-1.5 w-full flex-wrap">
                              {/* Compact Proportional Stepper */}
                              <div className="inline-flex items-center rounded-md border border-gray-200/90 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleDecrement(item)}
                                  disabled={item.quantity <= 1 || isItemSyncing || isCheckingOut}
                                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer select-none disabled:opacity-35 disabled:cursor-not-allowed"
                                  aria-label="পরিমাণ কমান"
                                  title={item.quantity <= 1 ? "আইটেম মুছতে ডানের ট্র্যাশ বাটনে ক্লিক করুন" : "পরিমাণ কমান"}
                                >
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                                </button>
                                <span className="px-1.5 sm:px-2 h-5 sm:h-5.5 flex items-center justify-center bg-white dark:bg-zinc-900 border-x border-gray-200/90 dark:border-zinc-700 text-[11px] sm:text-xs font-medium text-gray-800 dark:text-zinc-200 min-w-[20px] sm:min-w-[24px] select-none">
                                  {isItemSyncing ? (
                                    <Loader2 className="w-3 h-3 animate-spin text-orange-500" />
                                  ) : (
                                    formatSize(String(currentQty))
                                  )}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrement(item)}
                                  disabled={item.quantity >= MAX_ITEM_QUANTITY || isItemSyncing || isCheckingOut}
                                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer select-none disabled:opacity-35 disabled:cursor-not-allowed"
                                  aria-label="পরিমাণ বাড়ান"
                                  title={item.quantity >= MAX_ITEM_QUANTITY ? "সর্বোচ্চ ২০টি পণ্য অর্ডার করা যাবে" : "পরিমাণ বাড়ান"}
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                                </button>
                              </div>

                              {/* Formula: [ - qty + ] × unit_price = total */}
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-normal select-none">
                                <span className="text-gray-500 dark:text-zinc-400">×</span>
                                <span className="text-gray-700 dark:text-zinc-300">
                                  {formatPrice(item.unit_price)}
                                </span>
                                <span className="text-gray-500 dark:text-zinc-400">=</span>
                                <span className="text-gray-900 dark:text-zinc-100 font-medium">
                                  {formatPrice(itemTotalPrice)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Dedicated Trash Delete Button */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            disabled={isCheckingOut || isItemSyncing}
                            className="absolute top-2.5 right-0.5 p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 disabled:opacity-40 disabled:cursor-not-allowed group/trash"
                            aria-label="কার্ট থেকে মুছে ফেলুন"
                            title="কার্ট থেকে মুছে ফেলুন"
                            data-testid="cart-item-remove-button"
                          >
                            <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 group-hover/trash:text-red-500 transition-colors" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Subtotal & Orange CHECKOUT Button (Matching Image 2, all content in Bengali) */}
                  <div className="p-4 sm:p-5 border-t border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-y-3 shrink-0">
                    <div className="flex items-center justify-between text-base">
                      <span className="font-normal text-zinc-800 dark:text-zinc-300">
                        মোট:
                      </span>
                      <span
                        className="text-lg font-bold text-zinc-900 dark:text-zinc-100"
                        data-testid="cart-subtotal"
                      >
                        {formatPrice(totalSubtotal)}
                      </span>
                    </div>

                    {/* Full-width vibrant Orange CHECKOUT button */}
                    <button
                      type="button"
                      onClick={handleCheckoutClick}
                      disabled={isBusyUpdating}
                      className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-80 uppercase tracking-wide"
                    >
                      {isBusyUpdating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>{isCheckoutPage ? "আপডেট সংরক্ষণ হচ্ছে..." : "আপনার অর্ডারটি প্রস্তুত হচ্ছে..."}</span>
                        </>
                      ) : (
                        <span>{isCheckoutPage ? "আপডেট সংরক্ষণ করুন" : "অর্ডার সম্পন্ন করুন"}</span>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-6 min-h-0">
                  <div className="w-16 h-16 rounded-full bg-orange-100 dark:bg-zinc-800 flex items-center justify-center text-3xl mb-4">
                    🍯
                  </div>
                  <h4 className="font-bold text-base text-zinc-900 dark:text-zinc-100">
                    আপনার শপিং কার্ট খালি
                  </h4>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-[240px]">
                    পছন্দের খাঁটি মধু বেছে নিয়ে কার্টে যোগ করুন।
                  </p>
                  <div className="mt-5">
                    <LocalizedClientLink
                      href="/store"
                      onClick={closeDrawer}
                      className="inline-flex h-10 items-center justify-center px-5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs transition-colors shadow-sm"
                    >
                      মধু ব্রাউজ করুন ➔
                    </LocalizedClientLink>
                  </div>
                </div>
              )}
            </aside>
          </>,
          document.body
        )}
    </div>
  )
}
