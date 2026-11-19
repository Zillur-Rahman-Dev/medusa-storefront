"use client"

import { convertToLocale, formatPrice, formatSize, getItemDiscountInfo } from "@lib/util/money"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { createPortal } from "react-dom"
import { ShoppingCart, X, Truck, Loader2, Minus, Plus, ArrowRight, Tag } from "lucide-react"

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
  raw?: any
}

export default function CartDropdown({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) {
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBadgePulsing, setIsBadgePulsing] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const [mounted, setMounted] = useState(false)
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null)

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
    scheduleServerSync(50)
  }
  const closeDrawer = () => setIsDrawerOpen(false)

  // Engine 2: Active Tab Focus Sync - silently checks server when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        performServerSync()
      }
    }
    window.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleVisibilityChange)
    return () => {
      window.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleVisibilityChange)
    }
  }, [])

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
    const handleOpen = () => setIsDrawerOpen(true)
    const handleClose = () => setIsDrawerOpen(false)
    window.addEventListener("cart:open-drawer", handleOpen)
    window.addEventListener("cart:close-drawer", handleClose)
    return () => {
      window.removeEventListener("cart:open-drawer", handleOpen)
      window.removeEventListener("cart:close-drawer", handleClose)
    }
  }, [])

  useEffect(() => {
    return () => {
      if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
      if (syncTimeoutRef.current) clearTimeout(syncTimeoutRef.current)
    }
  }, [])

  // Save local snapshot helper
  const saveLocalSnapshot = (curItems: UnifiedCartItem[], curOrder: string[]) => {
    if (typeof window === "undefined") return
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
            (c.variantId && srv.variant_id === c.variantId) ||
            (c.lineId && srv.id === c.lineId) ||
            (c.product_handle && srv.product_handle === c.product_handle)
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
            (cItem.variantId && s.variant_id === cItem.variantId) ||
            (cItem.lineId && s.id === cItem.lineId) ||
            (cItem.product_handle && s.product_handle === cItem.product_handle)
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

  const scheduleServerSync = (delayMs: number = 150) => {
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

    try {
      const stored = localStorage.getItem("purehoney_cart_v2")
      if (stored) {
        const parsed = JSON.parse(stored)
        const isRecent = Date.now() - (parsed.timestamp || 0) < 5 * 60 * 1000

        if (isRecent && Array.isArray(parsed.items)) {
          if (parsed.items.length === 0 && rawServer.length > 0) {
            setItems([])
            itemsRef.current = []
            setVariantOrder([])
            variantOrderRef.current = []
            fetch("/api/cart/batch", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ clearAll: true }),
              keepalive: true,
            })
            setIsInitialized(true)
            return
          }

          if (parsed.items.length > 0) {
            // Reconcile client snapshot with server data so fresh titles/prices immediately override stale localStorage
            const merged = parsed.items.map((loc: UnifiedCartItem) => {
              const srv = rawServer.find(
                (s: any) =>
                  (loc.variantId && (s.variant_id === loc.variantId || s.variant?.id === loc.variantId)) ||
                  (loc.lineId && s.id === loc.lineId)
              )
              if (srv) {
                const liveTitle =
                  (srv as any).variant?.product?.title || (srv as any).product_title || srv.title
                const livePrice = srv.unit_price || loc.unit_price
                const liveThumbnail =
                  srv.thumbnail || (srv as any).variant?.product?.thumbnail || loc.thumbnail
                return {
                  ...loc,
                  lineId: srv.id,
                  lineIds: [srv.id],
                  title: liveTitle || loc.title,
                  unit_price: livePrice,
                  thumbnail: liveThumbnail,
                  raw: srv,
                }
              }
              return loc
            })

            setItems(merged)
            itemsRef.current = merged
            const curOrder = Array.isArray(parsed.order)
              ? parsed.order
              : merged.map((i: any) => i.variantId || i.product_handle || i.id)
            setVariantOrder(curOrder)
            variantOrderRef.current = curOrder
            saveLocalSnapshot(merged, curOrder)
            setIsInitialized(true)
            setTimeout(() => {
              performServerSync()
            }, 100)
            return
          }
        }
      }
    } catch (e) {
      console.warn("Cart local storage read error:", e)
    }

    const serverUnified = convertServerItemsToUnified(rawServer)
    setItems(serverUnified)
    itemsRef.current = serverUnified
    const initialOrder = serverUnified.map((i) => i.variantId || i.product_handle || i.id)
    setVariantOrder(initialOrder)
    variantOrderRef.current = initialOrder
    saveLocalSnapshot(serverUnified, initialOrder)
    setIsInitialized(true)
  }, [cartState])

  // Flush keepalive sync on pagehide / beforeunload
  useEffect(() => {
    const handleUnload = () => {
      const currentItems = itemsRef.current
      const serverItems = serverItemsRef.current

      if (currentItems.length === 0 && serverItems.length > 0) {
        fetch("/api/cart/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ clearAll: true }),
          keepalive: true,
        })
        return
      }

      const deletions: Array<{ lineId: string; variantId?: string }> = []
      for (const srv of serverItems) {
        const stillInClient = currentItems.some(
          (c) =>
            (c.variantId && srv.variant_id === c.variantId) ||
            (c.lineId && srv.id === c.lineId) ||
            (c.product_handle && srv.product_handle === c.product_handle)
        )
        if (!stillInClient) {
          deletions.push({ lineId: srv.id, variantId: srv.variant_id || undefined })
        }
      }

      const additions: Array<{ variantId: string; quantity: number }> = []
      const updates: Array<{ lineId: string; quantity: number }> = []

      for (const cItem of currentItems) {
        const matchingSrv = serverItems.find(
          (s) =>
            (cItem.variantId && s.variant_id === cItem.variantId) ||
            (cItem.lineId && s.id === cItem.lineId) ||
            (cItem.product_handle && s.product_handle === cItem.product_handle)
        )

        if (!matchingSrv) {
          if (cItem.variantId) {
            additions.push({ variantId: cItem.variantId, quantity: cItem.quantity })
          }
        } else if (matchingSrv.quantity !== cItem.quantity) {
          updates.push({ lineId: matchingSrv.id, quantity: cItem.quantity })
        }
      }

      if (deletions.length > 0 || additions.length > 0 || updates.length > 0) {
        fetch("/api/cart/batch", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ deletions, additions, updates }),
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

  // Sync active cart item quantities globally for product cards & sessionStorage
  useEffect(() => {
    if (typeof window === "undefined") return
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
  }, [items])

  // Sorted items strictly following variantOrder (newest added on TOP!)
  const displayItems = useMemo(() => {
    return [...items].sort((a, b) => {
      const keyA = a.variantId || a.product_handle || a.id
      const keyB = b.variantId || b.product_handle || b.id
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

  // Stepper increment [+]
  const handleIncrement = (item: UnifiedCartItem) => {
    const nextItems = itemsRef.current.map((it) =>
      it.id === item.id || (item.variantId && it.variantId === item.variantId)
        ? { ...it, quantity: it.quantity + 1 }
        : it
    )
    setItems(nextItems)
    itemsRef.current = nextItems
    saveLocalSnapshot(nextItems, variantOrderRef.current)
    scheduleServerSync()
  }

  // Stepper decrement [-]
  const handleDecrement = (item: UnifiedCartItem) => {
    if (item.quantity > 1) {
      const nextItems = itemsRef.current.map((it) =>
        it.id === item.id || (item.variantId && it.variantId === item.variantId)
          ? { ...it, quantity: it.quantity - 1 }
          : it
      )
      setItems(nextItems)
      itemsRef.current = nextItems
      saveLocalSnapshot(nextItems, variantOrderRef.current)
      scheduleServerSync()
    } else {
      handleRemove(item)
    }
  }

  // Remove item [✕]
  const handleRemove = (item: UnifiedCartItem) => {
    const targetKey = item.variantId || item.product_handle || item.id
    const nextItems = itemsRef.current.filter((it) => {
      if (item.variantId && it.variantId === item.variantId) return false
      if (item.product_handle && it.product_handle === item.product_handle) return false
      if (it.id === item.id) return false
      return true
    })

    const nextOrder = variantOrderRef.current.filter((k) => k !== targetKey)
    setItems(nextItems)
    itemsRef.current = nextItems
    setVariantOrder(nextOrder)
    variantOrderRef.current = nextOrder
    saveLocalSnapshot(nextItems, nextOrder)

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

    scheduleServerSync()
  }

  // Navigation handlers
  const handleCheckoutClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    setIsCheckingOut(true)
    await performServerSync()
    closeDrawer()
    window.location.href = `/${countryCode}/checkout`
  }

  // Listen to Global Cart Events
  useEffect(() => {
    const handleItemAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const targetVariantId = detail.variantId
      const targetHandle = detail.handle
      const itemKey = targetVariantId || targetHandle || detail.id
      const currentItems = itemsRef.current

      const existingIndex = currentItems.findIndex((i) =>
        targetVariantId
          ? i.variantId === targetVariantId
          : targetHandle
          ? i.product_handle === targetHandle
          : false
      )

      let nextItems: UnifiedCartItem[]
      let nextOrder = variantOrderRef.current

      if (existingIndex !== -1) {
        // Product already in cart: increment in-place!
        // DO NOT pulse badge for existing product!
        nextItems = currentItems.map((it, idx) =>
          idx === existingIndex ? { ...it, quantity: it.quantity + (detail.quantity || 1) } : it
        )
      } else {
        // Brand new item: Put at TOP of variantOrder and items!
        // ONLY FOR BRAND NEW PRODUCT: Trigger Badge Pop & Pulse (Smooth 500ms duration)
        setIsBadgePulsing(true)
        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
        badgeTimerRef.current = setTimeout(() => {
          setIsBadgePulsing(false)
        }, 500)

        const newItem: UnifiedCartItem = {
          id: detail.id || `opt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
          variantId: targetVariantId,
          title: detail.title || "খাঁটি প্রাকৃতিক মধু",
          product_handle: detail.handle || "sundarban-kholisha-honey",
          thumbnail: detail.thumbnail,
          variantTitle: detail.variant || "১ কেজি",
          quantity: detail.quantity || 1,
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
      scheduleServerSync()

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
        if (targetId) return i.id === targetId || i.lineId === targetId
        if (targetVariantId) return i.variantId === targetVariantId
        if (targetHandle) return i.product_handle === targetHandle
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
        if (targetId) return i.id === targetId || i.lineId === targetId
        if (targetVariantId) return i.variantId === targetVariantId
        if (targetHandle) return i.product_handle === targetHandle
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
            {/* Drawer Overlay Backdrop */}
            <div
              className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[9999] transition-opacity duration-300 ease-in-out ${
                isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
              }`}
              onClick={closeDrawer}
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
                  className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer group"
                  aria-label="কার্ট বন্ধ করুন"
                  data-testid="close-cart-drawer"
                >
                  <span>বন্ধ করুন</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>

              {/* Drawer Body (Full height compact scrollable list) */}
              {hasItems ? (
                <>
                  {/* Scrollable Items List - Line separated items matching Image 1 */}
                  <div className="flex-1 overflow-y-auto min-h-0 px-4 py-1 flex flex-col divide-y divide-gray-150 dark:divide-zinc-800">
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

                      const discountInfo = getItemDiscountInfo(
                        item.unit_price,
                        currentQty,
                        activePromotions,
                        cartDiscountTotal,
                        totalSubtotal,
                        item.raw
                      )

                      return (
                        <div
                          className="relative py-3 sm:py-3.5 flex items-center gap-2.5 transition-colors"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          {/* Product Image - Stretches vertically when promotion has 3 lines */}
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            onClick={closeDrawer}
                            className={`rounded-xl border border-gray-200/90 dark:border-zinc-700/80 overflow-hidden bg-white dark:bg-zinc-800 shrink-0 p-0.5 flex items-center justify-center transition-all group ${
                              discountInfo.hasDiscount
                                ? "w-14 sm:w-16 h-[74px] sm:h-[78px]"
                                : "w-12 h-12 sm:w-14 sm:h-14"
                            }`}
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

                            {/* Row 2: Promo Discount Row (ONLY when promotion is applied!) */}
                            {discountInfo.hasDiscount && (
                              <div className="flex items-center gap-1.5 my-0.5 sm:my-1">
                                <span className="line-through text-gray-400 dark:text-zinc-500 text-[11px] sm:text-xs select-none">
                                  {formatPrice(item.unit_price)}
                                </span>
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200/80 dark:border-emerald-800 text-[10px] sm:text-[11px] font-medium leading-none shrink-0 select-none">
                                  <Tag className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" />
                                  <span>{discountInfo.badgeText}</span>
                                </span>
                              </div>
                            )}

                            {/* Row 3: Stepper × Unit Price = Total */}
                            <div className={`flex items-center gap-2 w-full flex-wrap ${discountInfo.hasDiscount ? "mt-0.5" : "mt-1 sm:mt-1.5"}`}>
                              {/* Compact Proportional Stepper */}
                              <div className="inline-flex items-center rounded-md border border-gray-200/90 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800 overflow-hidden shadow-2xs">
                                <button
                                  type="button"
                                  onClick={() => handleDecrement(item)}
                                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer select-none"
                                  aria-label="পরিমাণ কমান"
                                >
                                  <Minus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                                </button>
                                <span className="px-1.5 sm:px-2 h-5 sm:h-5.5 flex items-center justify-center bg-white dark:bg-zinc-900 border-x border-gray-200/90 dark:border-zinc-700 text-[11px] sm:text-xs font-medium text-gray-800 dark:text-zinc-200 min-w-[18px] sm:min-w-[20px] select-none">
                                  {formatSize(String(currentQty))}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleIncrement(item)}
                                  className="w-5 h-5 sm:w-5.5 sm:h-5.5 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-50 dark:bg-zinc-800 hover:bg-gray-100 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer select-none"
                                  aria-label="পরিমাণ বাড়ান"
                                >
                                  <Plus className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-orange-500" />
                                </button>
                              </div>

                              {/* Formula: [ - qty + ] × unit_price = total */}
                              <div className="flex items-center gap-1.5 text-xs sm:text-sm font-normal select-none">
                                <span className="text-gray-500 dark:text-zinc-400">×</span>
                                <span className={discountInfo.hasDiscount ? "text-emerald-700 dark:text-emerald-400 font-medium" : "text-gray-700 dark:text-zinc-300"}>
                                  {formatPrice(discountInfo.hasDiscount ? discountInfo.discountedUnitPrice : item.unit_price)}
                                </span>
                                <span className="text-gray-500 dark:text-zinc-400">=</span>
                                <span className={discountInfo.hasDiscount ? "text-emerald-700 dark:text-emerald-400 font-bold" : "text-gray-900 dark:text-zinc-100 font-normal"}>
                                  {formatPrice(discountInfo.hasDiscount ? discountInfo.discountedTotalPrice : itemTotalPrice)}
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Close button (Right '✕', absolute top right corner with clean spacing) */}
                          <button
                            type="button"
                            onClick={() => handleRemove(item)}
                            className="absolute top-2.5 right-0.5 p-1 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                            aria-label="মুছে ফেলুন"
                            title="মুছে ফেলুন"
                            data-testid="cart-item-remove-button"
                          >
                            <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                          </button>
                        </div>
                      )
                    })}
                  </div>

                  {/* Subtotal & Orange CHECKOUT Button (Matching Image 2, all content in Bengali) */}
                  <div className="p-4 sm:p-5 border-t border-gray-150 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-y-3 shrink-0">
                    {effectiveDiscount > 0 ? (
                      <div className="flex flex-col gap-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-normal text-zinc-600 dark:text-zinc-400">সাবটোটাল:</span>
                          <span className="text-zinc-500 dark:text-zinc-400 line-through">{formatPrice(totalSubtotal)}</span>
                        </div>
                        {drawerPromoBreakdown.map((promo) => (
                          <div key={promo.code} className="flex items-center justify-between text-sm">
                            <span className="text-emerald-700 dark:text-emerald-400 font-normal flex items-center gap-1">
                              <Tag className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                              <span>{promo.label}:</span>
                            </span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-medium">- {formatPrice(promo.amount)}</span>
                          </div>
                        ))}
                        <div className="flex items-center justify-between text-base pt-1 border-t border-gray-100 dark:border-zinc-800">
                          <span className="font-normal text-zinc-800 dark:text-zinc-300">মোট:</span>
                          <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100" data-testid="cart-subtotal">
                            {formatPrice(Math.max(0, totalSubtotal - effectiveDiscount))}
                          </span>
                        </div>
                      </div>
                    ) : (
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
                    )}

                    {/* Full-width vibrant Orange CHECKOUT button */}
                    <button
                      type="button"
                      onClick={handleCheckoutClick}
                      disabled={isCheckingOut}
                      className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-80 uppercase tracking-wide"
                    >
                      {isCheckingOut ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>চেকআউটে যাওয়া হচ্ছে...</span>
                        </>
                      ) : (
                        <span>অর্ডার করুন</span>
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
