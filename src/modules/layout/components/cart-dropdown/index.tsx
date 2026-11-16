"use client"

import { convertToLocale, formatPrice, formatSize } from "@lib/util/money"
import { addToCart, deleteLineItem, updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { useParams, useRouter } from "next/navigation"
import { Fragment, useEffect, useMemo, useRef, useState } from "react"
import { ShoppingCart, X, Truck, Loader2, Minus, Plus, ArrowRight } from "lucide-react"

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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [isBadgePulsing, setIsBadgePulsing] = useState(false)
  const [isCheckingOut, setIsCheckingOut] = useState(false)
  const badgeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Local state for instant 0ms optimistic changes
  const [items, setItems] = useState<UnifiedCartItem[]>([])
  const [variantOrder, setVariantOrder] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Refs for sync loop and concurrency control
  const itemsRef = useRef<UnifiedCartItem[]>([])
  itemsRef.current = items

  const variantOrderRef = useRef<string[]>([])
  variantOrderRef.current = variantOrder

  const serverItemsRef = useRef<HttpTypes.StoreCartLineItem[]>(cartState?.items || [])
  const isSyncingRef = useRef(false)
  const pendingSyncRef = useRef(false)
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Manage drawer state
  const openDrawer = () => setIsDrawerOpen(true)
  const closeDrawer = () => setIsDrawerOpen(false)

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
      if (map.has(key)) {
        const existing = map.get(key)!
        existing.lineIds = existing.lineIds ? [...existing.lineIds, item.id] : [existing.id, item.id]
        existing.quantity += item.quantity
      } else {
        map.set(key, {
          id: item.id,
          lineId: item.id,
          lineIds: [item.id],
          variantId: item.variant_id || item.variant?.id,
          title: item.title,
          product_handle: item.product_handle,
          thumbnail: item.thumbnail,
          metadata: item.metadata,
          variantTitle: item.variant?.title || item.subtitle || "১ কেজি",
          quantity: item.quantity,
          unit_price: item.unit_price,
          created_at: item.created_at,
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
            // Update lineIds on client items
            setItems((prev) =>
              prev.map((it) => {
                const srv = data.items.find((s: any) => s.variant_id === it.variantId)
                if (srv) {
                  return { ...it, lineId: srv.id, lineIds: [srv.id] }
                }
                return it
              })
            )
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
            setItems(parsed.items)
            itemsRef.current = parsed.items
            if (Array.isArray(parsed.order)) {
              setVariantOrder(parsed.order)
              variantOrderRef.current = parsed.order
            }
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
        // ONLY FOR BRAND NEW PRODUCT: Trigger Badge Pop & Pulse!
        setIsBadgePulsing(true)
        if (badgeTimerRef.current) clearTimeout(badgeTimerRef.current)
        badgeTimerRef.current = setTimeout(() => {
          setIsBadgePulsing(false)
        }, 250)

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
                className={`absolute -top-1.5 -right-2 font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm text-white select-none transition-transform duration-200 ease-out ${
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

      {/* Drawer Overlay Backdrop */}
      <div
        className={`fixed inset-0 bg-black/50 backdrop-blur-[2px] z-[999] transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={closeDrawer}
        aria-hidden="true"
      />

      {/* Slide-over Drawer Panel (Sliding in from Right to Left, matching Image) */}
      <aside
        className={`fixed inset-y-0 right-0 z-[1000] w-full max-w-[420px] bg-white dark:bg-zinc-900 shadow-2xl flex flex-col h-full transform transition-transform duration-300 ease-in-out border-l border-zinc-200 dark:border-zinc-800 ${
          isDrawerOpen ? "translate-x-0" : "translate-x-full"
        }`}
        aria-modal="true"
        role="dialog"
      >
        {/* Drawer Header (Matching Image: SHOPPING CART / Close →) */}
        <div className="p-4 sm:p-5 border-b border-gray-100 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900 shrink-0">
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

        {/* Drawer Body */}
        {hasItems ? (
          <>
            {/* Scrollable Items List */}
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
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
                    className="p-3 sm:p-3.5 rounded-2xl border border-gray-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xs flex items-center gap-3 transition-colors"
                    key={item.id}
                    data-testid="cart-item"
                  >
                    {/* Product Image */}
                    <LocalizedClientLink
                      href={`/products/${item.product_handle}`}
                      onClick={closeDrawer}
                      className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border border-gray-200/90 dark:border-zinc-700/80 flex items-center justify-center p-1 relative group"
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
                          <span className="text-[9px] font-normal">মধু</span>
                        </div>
                      )}
                    </LocalizedClientLink>

                    {/* Product Details & Stepper */}
                    <div className="flex-1 min-w-0">
                      {/* Title & variant: font-normal, not bold */}
                      <h4 className="text-xs sm:text-sm font-normal truncate text-zinc-900 dark:text-zinc-100">
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          onClick={closeDrawer}
                          className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors font-normal"
                          data-testid="product-link"
                          title={`${item.title} ${variantLabel ? `(${formatSize(variantLabel)})` : ""}`}
                        >
                          {item.title} {variantLabel ? `(${formatSize(variantLabel)})` : ""}
                        </LocalizedClientLink>
                      </h4>

                      {/* Stepper + Math row matching Image */}
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        {/* Pill Stepper */}
                        <div className="inline-flex items-center rounded-full border border-gray-200 dark:border-zinc-700 bg-gray-100 dark:bg-zinc-800 overflow-hidden shadow-2xs">
                          <button
                            type="button"
                            onClick={() => handleDecrement(item)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer text-sm font-normal select-none"
                            aria-label="পরিমাণ কমান"
                          >
                            <Minus className="w-3 h-3 text-orange-500" />
                          </button>
                          <span className="px-2.5 h-6 sm:h-7 flex items-center justify-center bg-white dark:bg-zinc-900 border-x border-gray-200 dark:border-zinc-700 text-xs sm:text-sm font-normal text-gray-800 dark:text-zinc-200 select-none">
                            {formatSize(String(currentQty))}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleIncrement(item)}
                            className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center text-orange-500 hover:text-orange-600 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 active:scale-95 transition-colors cursor-pointer text-sm font-normal select-none"
                            aria-label="পরিমাণ বাড়ান"
                          >
                            <Plus className="w-3 h-3 text-orange-500" />
                          </button>
                        </div>

                        {/* Math formula: × ৳১,৬০০.০০ = ৳১৪,৪০০.০০ */}
                        <span className="text-xs sm:text-sm font-normal text-gray-700 dark:text-zinc-300 flex items-center gap-1.5 select-none">
                          <span>×</span>
                          <span>{formatPrice(item.unit_price)}</span>
                          <span>=</span>
                          <span className="text-gray-900 dark:text-zinc-100 font-normal">{formatPrice(itemTotalPrice)}</span>
                        </span>
                      </div>
                    </div>

                    {/* Close button (Right '✕', matching Image) */}
                    <button
                      type="button"
                      onClick={() => handleRemove(item)}
                      className="p-1.5 text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-colors cursor-pointer rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 shrink-0 ml-auto"
                      aria-label="মুছে ফেলুন"
                      data-testid="cart-item-remove-button"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )
              })}
            </div>

            {/* Subtotal & Orange CHECKOUT Button (Matching Image, all content in Bengali) */}
            <div className="p-4 sm:p-5 border-t border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col gap-y-4 shrink-0">
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
                disabled={isCheckingOut}
                className="w-full h-12 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 transition-all shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-80 uppercase tracking-wide"
              >
                {isCheckingOut ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>চেকআউটে যাওয়া হচ্ছে...</span>
                  </>
                ) : (
                  <span>চেকআউট</span>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
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
    </div>
  )
}
