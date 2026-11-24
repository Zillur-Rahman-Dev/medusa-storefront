"use client"

import { Home, ShoppingBag, Search, User } from "lucide-react"
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

  const handleSearchClick = () => {
    if (typeof window !== "undefined") {
      const searchInput = document.querySelector('input[type="search"]') as HTMLInputElement
      if (searchInput) {
        searchInput.focus()
        searchInput.scrollIntoView({ behavior: "smooth", block: "center" })
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleCartClick = (e: React.MouseEvent) => {
    e.preventDefault()
    if (typeof window !== "undefined") {
      if (window.location.pathname.includes("/checkout")) {
        window.location.href = "/bd/checkout"
        return
      }
      window.dispatchEvent(new CustomEvent("cart:open-drawer"))
    }
  }

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 md:hidden bg-amber-600 dark:bg-amber-700 text-white shadow-2xl border-t border-amber-500/40 px-2 py-1.5 transition-colors duration-300">
      <div className="grid grid-cols-4 items-center text-center">
        {/* 1. HOME */}
        <LocalizedClientLink
          href="/"
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white hover:text-amber-100 active:scale-95 transition-all"
        >
          <Home className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">HOME</span>
        </LocalizedClientLink>

        {/* 2. CART */}
        <button
          type="button"
          onClick={handleCartClick}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white hover:text-amber-100 active:scale-95 transition-all relative w-full cursor-pointer focus:outline-none"
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-[2.2]" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-zinc-900 dark:bg-black text-white font-black text-[9px] min-w-4 h-4 px-1 rounded-full flex items-center justify-center shadow-md border border-white/20">
                {cartCount}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold tracking-wider uppercase">CART</span>
        </button>

        {/* 3. SEARCH */}
        <button
          type="button"
          onClick={handleSearchClick}
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white hover:text-amber-100 active:scale-95 transition-all cursor-pointer focus:outline-none"
        >
          <Search className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">SEARCH</span>
        </button>

        {/* 4. ACCOUNT */}
        <LocalizedClientLink
          href="/account"
          className="flex flex-col items-center justify-center gap-0.5 py-1 text-white hover:text-amber-100 active:scale-95 transition-all"
        >
          <User className="w-5 h-5 stroke-[2.2]" />
          <span className="text-[10px] font-bold tracking-wider uppercase">ACCOUNT</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
