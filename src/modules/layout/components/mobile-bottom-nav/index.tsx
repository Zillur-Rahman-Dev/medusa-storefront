"use client"

import { Home, ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React, { useEffect, useState } from "react"

export default function MobileBottomNav() {
  const [optimisticCount, setOptimisticCount] = useState(0)

  useEffect(() => {
    const handleAdded = () => setOptimisticCount((prev) => prev + 1)
    const handleFailed = () => setOptimisticCount((prev) => Math.max(0, prev - 1))
    window.addEventListener("cart:item-added", handleAdded)
    window.addEventListener("cart:item-failed", handleFailed)
    return () => {
      window.removeEventListener("cart:item-added", handleAdded)
      window.removeEventListener("cart:item-failed", handleFailed)
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

        {/* Cart */}
        <LocalizedClientLink
          href="/cart"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition-all relative"
        >
          <div className="relative">
            <ShoppingCart className="w-5 h-5" />
            {optimisticCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white font-bold text-[9px] min-w-3.5 h-3.5 px-0.5 rounded-full flex items-center justify-center shadow-sm animate-bounce">
                +{optimisticCount}
              </span>
            )}
          </div>
          <span className="text-[11px] font-semibold">কার্ট</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
