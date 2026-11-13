"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { deleteLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import DeleteButton from "@modules/common/components/delete-button"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { ShoppingCart, CheckCircle2 } from "lucide-react"

// Cloudinary images for known products (in case database thumbnail field is null)
const KNOWN_HONEY_IMAGES: Record<string, string> = {
  "sundarban-kholisha-honey":
    "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg",
  "mustard-flower-honey":
    "https://res.cloudinary.com/dqseoiw8p/raw/upload/v1794166098/e9b3e553-c496-419a-a1ca-e817d73045f1_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg",
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

type OptimisticItem = {
  id: string
  title: string
  product_handle?: string
  thumbnail?: string | null
  variantTitle?: string
  quantity: number
  unitPrice: number
}

const CartDropdown = ({
  cart: cartState,
}: {
  cart?: HttpTypes.StoreCart | null
}) => {
  const [activeTimer, setActiveTimer] = useState<NodeJS.Timeout | undefined>(
    undefined
  )
  const [cartDropdownOpen, setCartDropdownOpen] = useState(false)
  const [optimisticItems, setOptimisticItems] = useState<OptimisticItem[]>([])
  const [deletedItemIds, setDeletedItemIds] = useState<string[]>([])

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  // 1. Raw server items coming directly from backend props
  const rawServerItems = cartState?.items || []

  // 2. Active server items (excluding items optimistically deleted by user in this session)
  const activeServerItems = rawServerItems.filter(
    (item) => !deletedItemIds.includes(item.id)
  )

  // 3. Totals (Active server items + Optimistic pending items)
  const activeServerCount = activeServerItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  const optimisticCount = optimisticItems.reduce(
    (acc, item) => acc + item.quantity,
    0
  )
  const totalItems = activeServerCount + optimisticCount

  const activeServerSubtotal = activeServerItems.reduce(
    (acc, item) => acc + item.unit_price * item.quantity,
    0
  )
  const optimisticSubtotal = optimisticItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  )
  const totalSubtotal = activeServerSubtotal + optimisticSubtotal

  // Signature based STRICTLY on server props (does NOT change on local optimistic delete)
  const serverSignature = rawServerItems
    .map((i) => `${i.id}_${i.quantity}`)
    .join("|")
  const prevSignatureRef = useRef<string>(serverSignature)

  const timedOpen = () => {
    open()
    if (activeTimer) clearTimeout(activeTimer)
    const timer = setTimeout(close, 4500)
    setActiveTimer(timer)
  }

  // Instant 0ms Optimistic Delete handler (Clean, reliable, no loop or blink)
  const handleOptimisticDelete = async (itemId: string) => {
    // 1. Instantly hide item from UI & recalculate totals in 0ms
    setDeletedItemIds((prev) => (prev.includes(itemId) ? prev : [...prev, itemId]))

    // 2. Background delete via Medusa API
    try {
      await deleteLineItem(itemId)
    } catch (err) {
      console.error("Failed to delete line item:", err)
      // Rollback on network failure
      setDeletedItemIds((prev) => prev.filter((id) => id !== itemId))
    }
  }

  // Listen to optimistic cart events for instant 0.05s UI responsiveness across the storefront
  useEffect(() => {
    const handleItemAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      const newItem: OptimisticItem = {
        id: detail.id || `opt_${Date.now()}`,
        title: detail.title || "খাঁটি প্রাকৃতিক মধু",
        product_handle: detail.handle || "sundarban-kholisha-honey",
        thumbnail: detail.thumbnail,
        variantTitle: detail.variant || "১ কেজি",
        quantity: detail.quantity || 1,
        unitPrice: detail.price || 750,
      }

      setOptimisticItems((prev) => [newItem, ...prev])
      timedOpen()
    }

    const handleItemFailed = () => {
      // Rollback on failure
      setOptimisticItems((prev) => prev.slice(1))
    }

    window.addEventListener("cart:item-added", handleItemAdded)
    window.addEventListener("cart:item-failed", handleItemFailed)

    return () => {
      window.removeEventListener("cart:item-added", handleItemAdded)
      window.removeEventListener("cart:item-failed", handleItemFailed)
    }
  }, [])

  // When real server cart updates from backend (serverSignature changes)
  useEffect(() => {
    if (prevSignatureRef.current === serverSignature) return

    // 1. Clean up deletedItemIds for items that are now permanently gone from rawServerItems
    setDeletedItemIds((prev) =>
      prev.filter((id) => rawServerItems.some((item) => item.id === id))
    )

    // 2. Remove only optimistic items that have now appeared in rawServerItems
    setOptimisticItems((prev) =>
      prev.filter(
        (opt) =>
          !rawServerItems.some(
            (srv) => srv.product_handle === opt.product_handle
          )
      )
    )

    prevSignatureRef.current = serverSignature
  }, [serverSignature, rawServerItems])

  const openAndCancel = () => {
    if (activeTimer) clearTimeout(activeTimer)
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer)
    }
  }, [activeTimer])

  const hasItems = totalItems > 0

  return (
    <div
      className="h-full z-50"
      onMouseEnter={openAndCancel}
      onMouseLeave={close}
    >
      <Popover className="relative h-full flex items-center">
        <PopoverButton className="h-full flex items-center focus:outline-none">
          <LocalizedClientLink
            className="flex flex-col items-center justify-center p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors relative"
            href="/cart"
            data-testid="nav-cart-link"
          >
            <div className="relative">
              <ShoppingCart className="w-5 h-5 text-zinc-700 dark:text-zinc-200" />
              <span
                className={`absolute -top-1.5 -right-2 font-bold text-[10px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-sm transition-all duration-300 ${
                  optimisticItems.length > 0
                    ? "bg-emerald-500 text-white scale-110"
                    : "bg-amber-500 text-white"
                }`}
              >
                {totalItems}
              </span>
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
                {totalItems} টি পণ্য
              </span>
            </div>

            {hasItems ? (
              <>
                <div className="overflow-y-scroll max-h-[380px] p-4 flex flex-col no-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {/* 1. Instant Optimistic Items (Rendered with 100% IDENTICAL card design as server items) */}
                  {optimisticItems.map((optItem) => {
                    const imageUrl = resolveProductImage({
                      thumbnail: optItem.thumbnail,
                      handle: optItem.product_handle,
                      title: optItem.title,
                    })

                    return (
                      <div
                        className="py-3 first:pt-0 last:pb-0 flex gap-x-3 items-center animate-in fade-in duration-200"
                        key={optItem.id}
                        data-testid="cart-item"
                      >
                        {/* Product Image */}
                        <LocalizedClientLink
                          href={`/products/${optItem.product_handle}`}
                          onClick={close}
                          className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center relative group"
                        >
                          {imageUrl ? (
                            <img
                              src={imageUrl}
                              alt={optItem.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 dark:from-zinc-800 dark:to-zinc-900 text-amber-700 dark:text-amber-400">
                              <span className="text-2xl">🍯</span>
                              <span className="text-[9px] font-bold">মধু</span>
                            </div>
                          )}
                        </LocalizedClientLink>

                        {/* Product Details */}
                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <h4 className="text-xs sm:text-sm font-bold truncate text-zinc-900 dark:text-zinc-100">
                              <LocalizedClientLink
                                href={`/products/${optItem.product_handle}`}
                                onClick={close}
                                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                                data-testid="product-link"
                              >
                                {optItem.title}
                              </LocalizedClientLink>
                            </h4>
                            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                              সাইজ:{" "}
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {optItem.variantTitle || "ডিফল্ট"}
                              </span>
                              {"  •  "}
                              পরিমাণ:{" "}
                              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                {optItem.quantity}
                              </span>
                            </p>
                          </div>

                          {/* Bottom Row: Status on Left, Price on Right */}
                          <div className="flex items-center justify-between pt-1.5">
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              <span>যোগ হচ্ছে...</span>
                            </span>

                            <div className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                              ৳{optItem.unitPrice * optItem.quantity}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}

                  {/* 2. Official Medusa Server Items (Rendered with 100% IDENTICAL card design) */}
                  {activeServerItems
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                    })
                    .map((item) => {
                      const imageUrl = resolveProductImage({
                        thumbnail: item.thumbnail,
                        metadata: item.metadata,
                        handle: item.product_handle,
                        title: item.title,
                      })

                      const variantLabel =
                        item.variant?.title || item.subtitle || "ডিফল্ট"
                      const itemPrice = item.unit_price * item.quantity

                      return (
                        <div
                          className="py-3 first:pt-0 last:pb-0 flex gap-x-3 items-center animate-in fade-in duration-200"
                          key={item.id}
                          data-testid="cart-item"
                        >
                          {/* Product Image */}
                          <LocalizedClientLink
                            href={`/products/${item.product_handle}`}
                            onClick={close}
                            className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-amber-50/50 dark:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center relative group"
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

                          {/* Product Details */}
                          <div className="flex flex-col justify-between flex-1 min-w-0">
                            <div>
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
                              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                                সাইজ:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  {variantLabel}
                                </span>
                                {"  •  "}
                                পরিমাণ:{" "}
                                <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                                  {item.quantity}
                                </span>
                              </p>
                            </div>

                            {/* Bottom Row: Delete Button on Left (Single Trash Icon + 'মুছে ফেলুন'), Price on Right */}
                            <div className="flex items-center justify-between pt-1.5">
                              <DeleteButton
                                id={item.id}
                                onDelete={handleOptimisticDelete}
                                className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                                data-testid="cart-item-remove-button"
                              >
                                মুছে ফেলুন
                              </DeleteButton>

                              <div className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100">
                                ৳{itemPrice}
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>

                {/* Subtotal & Action Button (Only 'কার্ট দেখুন' button) */}
                <div className="p-4 border-t border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/30 flex flex-col gap-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-semibold text-zinc-600 dark:text-zinc-400">
                      মোট বিল:
                    </span>
                    <span
                      className="text-base font-extrabold text-emerald-800 dark:text-emerald-400"
                      data-testid="cart-subtotal"
                    >
                      {convertToLocale({
                        amount: totalSubtotal,
                        currency_code: cartState?.currency_code || "bdt",
                      })}
                    </span>
                  </div>

                  {/* Single Clean Full-Width Button: Only 'কার্ট দেখুন' */}
                  <LocalizedClientLink
                    href="/cart"
                    onClick={close}
                    className="w-full h-11 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 font-bold text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-[0.99]"
                    data-testid="go-to-cart-button"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>কার্ট দেখুন</span>
                  </LocalizedClientLink>
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

export default CartDropdown
