"use client"

import {
  Popover,
  PopoverButton,
  PopoverPanel,
  Transition,
} from "@headlessui/react"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { Button } from "@medusajs/ui"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "@modules/products/components/thumbnail"
import { usePathname } from "next/navigation"
import { Fragment, useEffect, useRef, useState } from "react"
import { ShoppingCart, ShoppingBag, ArrowRight, CheckCircle2 } from "lucide-react"

type OptimisticItem = {
  id: string
  title: string
  product_handle?: string
  thumbnail?: string
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

  const open = () => setCartDropdownOpen(true)
  const close = () => setCartDropdownOpen(false)

  const serverItems = cartState?.items || []

  // Total items = server items + optimistic items
  const serverTotalItems = serverItems.reduce((acc, item) => acc + item.quantity, 0)
  const optimisticTotalItems = optimisticItems.reduce((acc, item) => acc + item.quantity, 0)
  const totalItems = serverTotalItems + optimisticTotalItems

  // Subtotal = server subtotal + optimistic items prices
  const serverSubtotal = cartState?.subtotal ?? 0
  const optimisticSubtotal = optimisticItems.reduce(
    (acc, item) => acc + item.unitPrice * item.quantity,
    0
  )
  const totalSubtotal = serverSubtotal + optimisticSubtotal

  const itemRef = useRef<number>(serverTotalItems)

  const timedOpen = () => {
    open()
    if (activeTimer) clearTimeout(activeTimer)
    const timer = setTimeout(close, 4500)
    setActiveTimer(timer)
  }

  // Listen to optimistic cart events for instant 0.05s UI responsiveness
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

  // When real server cart arrives, smoothly reset optimistic items
  useEffect(() => {
    if (serverTotalItems !== itemRef.current) {
      setOptimisticItems([])
      itemRef.current = serverTotalItems
    }
  }, [serverTotalItems])

  const openAndCancel = () => {
    if (activeTimer) clearTimeout(activeTimer)
    open()
  }

  useEffect(() => {
    return () => {
      if (activeTimer) clearTimeout(activeTimer)
    }
  }, [activeTimer])

  const pathname = usePathname()

  // Open cart dropdown when modifying the cart items, but only if we're not on the cart page
  useEffect(() => {
    if (itemRef.current !== serverTotalItems && !pathname.includes("/cart")) {
      timedOpen()
    }
  }, [serverTotalItems])

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
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300">
                {totalItems} টি পণ্য
              </span>
            </div>

            {hasItems ? (
              <>
                <div className="overflow-y-scroll max-h-[380px] p-4 flex flex-col gap-y-4 no-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800/80">
                  {/* 1. Instant Optimistic Items (Rendered at top with green check badge) */}
                  {optimisticItems.map((optItem) => (
                    <div
                      className="pt-3 first:pt-0 flex gap-x-3 animate-in fade-in slide-in-from-top-2 duration-300"
                      key={optItem.id}
                    >
                      <LocalizedClientLink
                        href={`/products/${optItem.product_handle}`}
                        className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-amber-50 dark:bg-zinc-800 border border-amber-200/60 dark:border-zinc-700 flex items-center justify-center"
                      >
                        {optItem.thumbnail ? (
                          <img
                            src={optItem.thumbnail}
                            alt={optItem.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🍯</span>
                        )}
                      </LocalizedClientLink>

                      <div className="flex flex-col justify-between flex-1 min-w-0">
                        <div>
                          <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold mb-0.5">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>কার্টে যোগ হয়েছে!</span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
                            {optItem.title}
                          </h4>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">
                            সাইজ: {optItem.variantTitle} | পরিমাণ: {optItem.quantity}
                          </p>
                        </div>
                        <div className="text-xs font-bold text-emerald-700 dark:text-emerald-400 pt-1">
                          ৳{optItem.unitPrice * optItem.quantity}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 2. Official Medusa Server Items */}
                  {serverItems
                    .sort((a, b) => {
                      return (a.created_at ?? "") > (b.created_at ?? "") ? -1 : 1
                    })
                    .map((item) => (
                      <div
                        className="pt-3 first:pt-0 flex gap-x-3"
                        key={item.id}
                        data-testid="cart-item"
                      >
                        <LocalizedClientLink
                          href={`/products/${item.product_handle}`}
                          className="w-16 h-16 shrink-0 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                        >
                          <Thumbnail
                            thumbnail={item.thumbnail}
                            images={item.variant?.product?.images}
                            size="square"
                          />
                        </LocalizedClientLink>

                        <div className="flex flex-col justify-between flex-1 min-w-0">
                          <div>
                            <h4 className="text-xs sm:text-sm font-semibold truncate text-zinc-900 dark:text-zinc-100">
                              <LocalizedClientLink
                                href={`/products/${item.product_handle}`}
                                data-testid="product-link"
                              >
                                {item.title}
                              </LocalizedClientLink>
                            </h4>
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              <LineItemOptions
                                variant={item.variant}
                                data-testid="cart-item-variant"
                              />
                              <span>পরিমাণ: {item.quantity}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <DeleteButton
                              id={item.id}
                              className="text-xs text-red-500 hover:text-red-700 font-medium transition-colors"
                              data-testid="cart-item-remove-button"
                            >
                              মুছে ফেলুন 🗑️
                            </DeleteButton>

                            <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100">
                              <LineItemPrice
                                item={item}
                                style="tight"
                                currencyCode={cartState?.currency_code || "bdt"}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* Subtotal & Action Buttons */}
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

                  {/* Dual Action Buttons */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <LocalizedClientLink
                      href="/cart"
                      onClick={close}
                      className="w-full h-10 px-3 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                      data-testid="go-to-cart-button"
                    >
                      <ShoppingCart className="w-3.5 h-3.5" />
                      <span>কার্ট দেখুন</span>
                    </LocalizedClientLink>

                    <LocalizedClientLink
                      href="/checkout?step=address"
                      onClick={close}
                      className="w-full h-10 px-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-md shadow-amber-600/20 active:scale-[0.98]"
                      data-testid="go-to-checkout-button"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>অর্ডার করুন</span>
                      <ArrowRight className="w-3 h-3" />
                    </LocalizedClientLink>
                  </div>
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
                  <LocalizedClientLink href="/store" onClick={close}>
                    <Button
                      variant="secondary"
                      size="small"
                      className="rounded-xl font-bold text-xs"
                    >
                      মধু ব্রাউজ করুন ➔
                    </Button>
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
