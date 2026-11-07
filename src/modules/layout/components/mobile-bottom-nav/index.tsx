"use client"

import { Home, ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function MobileBottomNav() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-white/95 dark:bg-zinc-950/95 backdrop-blur-lg border-t border-zinc-200 dark:border-zinc-800 shadow-lg px-2 py-2 transition-colors duration-300">
      <div className="grid grid-cols-4 items-center text-center">
        {/* Home */}
        <LocalizedClientLink
          href="/"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 active:scale-95 transition-all"
        >
          <Home className="w-5 h-5" />
          <span className="text-[11px] font-medium">হোম</span>
        </LocalizedClientLink>

        {/* Store / Products */}
        <LocalizedClientLink
          href="/store"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 active:scale-95 transition-all"
        >
          <ShoppingBag className="w-5 h-5" />
          <span className="text-[11px] font-medium">সকল পণ্য</span>
        </LocalizedClientLink>

        {/* WhatsApp Order */}
        <a
          href="https://wa.me/8801700000000?text=Hello,%20I%20want%20to%20order%20pure%20honey"
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-col items-center justify-center gap-1 py-1 text-emerald-600 dark:text-emerald-400 active:scale-95 transition-all"
        >
          <div className="p-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80">
            <MessageCircle className="w-4 h-4 fill-emerald-600 dark:fill-emerald-400" />
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 dark:text-emerald-300">অর্ডার</span>
        </a>

        {/* Cart */}
        <LocalizedClientLink
          href="/cart"
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-amber-600 dark:hover:text-amber-400 active:scale-95 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[11px] font-medium">কার্ট</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
