"use client"

import { Home, ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React, { useEffect, useState } from "react"

export default function MobileBottomNav() {
  const [cartCount, setCartCount] = useState(0)

  useEffect(() => {
    const updateCountFromStorage = () => {
      try {
        const stored = localStorage.getItem("purehoney_cart_v2")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed.items)) {
            const sum = parsed.items.reduce((acc: number, item: any) => acc + (item.quantity || 0), 0)
            setCartCount(sum)
            return
          }
        }
      } catch (e) {}
    }

    updateCountFromStorage()

    const handleStorageChange = () => {
      updateCountFromStorage()
    }

    window.addEventListener("cart:item-added", handleStorageChange)
    window.addEventListener("cart:sync-state", handleStorageChange)
    window.addEventListener("cart:item-deleted", handleStorageChange)
    window.addEventListener("cart:quantity-updated", handleStorageChange)

    return () => {
      window.removeEventListener("cart:item-added", handleStorageChange)
      window.removeEventListener("cart:sync-state", handleStorageChange)
      window.removeEventListener("cart:item-deleted", handleStorageChange)
      window.removeEventListener("cart:quantity-updated", handleStorageChange)
    }
  }, [])

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 shadow-xl px-2 py-2 transition-colors duration-300">
      <div className="grid grid-cols-4 items-center text-center">
        {/* Home */}
        <LocalizedClientLink
          href="/"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-semibold">হোম</span>
        </LocalizedClientLink>

        {/* Store / Products */}
        <LocalizedClientLink
          href="/store"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-semibold">সকল মধু</span>
        </LocalizedClientLink>

        {/* WhatsApp Quick Order */}
        <a
          href="https://wa.me/8801999602203?text=আসসালামু%20আলাইকুম,%20আমি%20Pure%20Honey%20ওয়েবসাইট%20থেকে%20খাঁটি%20মধু%20অর্ডার%20করতে%20চাই।"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-1 text-emerald-700 dark:text-emerald-400 active:scale-95 transition-all"
        >
          <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80">
            <MessageCircle className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400 text-white" />
          </div>
          <span className="text-[11px] font-extrabold text-emerald-800 dark:text-emerald-300">অর্ডার</span>
        </a>

        {/* Cart / Drawer Trigger */}
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault()
            if (typeof window !== "undefined") {
              if (window.location.pathname.includes("/checkout")) {
                window.location.href = "/bd/checkout"
                return
              }
              window.dispatchEvent(new CustomEvent("cart:open-drawer"))
            }
          }}
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition-all relative w-full cursor-pointer focus:outline-none"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-amber-500 text-white font-bold text-[9px] min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold">কার্ট</span>
        </button>
      </div>
    </div>
  )
}
