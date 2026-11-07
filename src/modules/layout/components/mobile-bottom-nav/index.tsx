"use client"

import { Home, ShoppingBag, MessageCircle, ShoppingCart } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

export default function MobileBottomNav() {
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
          href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20খাঁটি%20মধু%20অর্ডার%20করতে%20চাই।"
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
          className="flex flex-col items-center justify-center gap-1 py-1 text-zinc-600 dark:text-zinc-400 hover:text-emerald-700 dark:hover:text-emerald-400 active:scale-95 transition-all"
        >
          <ShoppingCart className="w-5 h-5" />
          <span className="text-[11px] font-semibold">কার্ট</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
