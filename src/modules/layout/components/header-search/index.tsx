"use client"

import React, { useState, useEffect, useRef, useMemo } from "react"
import { Search, X, ArrowRight, Loader2 } from "lucide-react"
import { useRouter, useParams } from "next/navigation"
import Image from "next/image"
import Link from "next/link"

type SearchItem = {
  id: string
  title: string
  handle: string
  thumbnail?: string
  price?: number
  weight?: string
  categories?: string[]
}

// Module-level in-memory cache so products are fetched only once per browser session
let cachedProducts: SearchItem[] | null = null

export default function HeaderSearch() {
  const [query, setQuery] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [products, setProducts] = useState<SearchItem[]>(cachedProducts || [])

  const containerRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"

  // Pre-fetch search products on focus
  const loadProducts = async () => {
    if (cachedProducts && cachedProducts.length > 0) {
      setProducts(cachedProducts)
      return
    }

    try {
      setIsLoading(true)
      const res = await fetch("/api/search-products")
      const data = await res.json()
      if (data?.products) {
        cachedProducts = data.products
        setProducts(data.products)
      }
    } catch (err) {
      console.error("Search prefetch error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // In-memory instant filtering
  const filteredProducts = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase().trim()

    return products.filter((p) => {
      const matchTitle = p.title?.toLowerCase().includes(q)
      const matchHandle = p.handle?.toLowerCase().includes(q)
      const matchCat = p.categories?.some((c) => c?.toLowerCase().includes(q))
      const matchWeight = p.weight?.toLowerCase().includes(q)
      return matchTitle || matchHandle || matchCat || matchWeight
    })
  }, [query, products])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsOpen(false)
    if (!query.trim()) {
      router.push(`/${countryCode}/store`)
      return
    }
    router.push(`/${countryCode}/store?q=${encodeURIComponent(query.trim())}`)
  }

  const handleSelectProduct = (handle: string) => {
    setIsOpen(false)
    setQuery("")
    router.push(`/${countryCode}/products/${handle}`)
  }

  return (
    <div
      ref={containerRef}
      className="relative flex items-center w-full max-w-xs sm:max-w-sm mx-auto"
    >
      <form onSubmit={handleSearchSubmit} className="relative w-full">
        <input
          type="text"
          value={query}
          onFocus={() => {
            loadProducts()
            if (query.trim()) setIsOpen(true)
          }}
          onChange={(e) => {
            setQuery(e.target.value)
            if (!isOpen) setIsOpen(true)
            if (!cachedProducts) loadProducts()
          }}
          placeholder="খাঁটি মধু খুঁজুন..."
          className="w-full pl-3.5 pr-20 py-1.5 rounded-full text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-600 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
        />

        {/* Clear query button */}
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("")
              setIsOpen(false)
            }}
            className="absolute right-14 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        {/* Search button */}
        <button
          type="submit"
          aria-label="Search"
          className="absolute right-1 top-1/2 -translate-y-1/2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow-sm transition-colors"
        >
          {isLoading ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Search className="w-3.5 h-3.5" />
          )}
          <span className="hidden sm:inline">সার্চ</span>
        </button>
      </form>

      {/* Floating Instant Live Search Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150">
          {filteredProducts.length > 0 ? (
            <div className="p-2 space-y-1">
              <div className="px-3 py-1 text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                মিল পাওয়া মধু ({filteredProducts.length})
              </div>

              {filteredProducts.slice(0, 5).map((product) => (
                <button
                  key={product.id}
                  type="button"
                  onClick={() => handleSelectProduct(product.handle)}
                  className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors text-left group"
                >
                  {/* Thumbnail */}
                  <div className="w-11 h-11 rounded-lg bg-zinc-100 dark:bg-zinc-800 shrink-0 overflow-hidden relative border border-zinc-200/60 dark:border-zinc-700/60">
                    {product.thumbnail ? (
                      <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        className="object-contain p-1"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                        🍯
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate group-hover:text-amber-600 transition-colors">
                      {product.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-0.5">
                      {product.price ? (
                        <span className="text-xs font-black text-zinc-900 dark:text-zinc-200">
                          ৳ {product.price.toLocaleString()}
                        </span>
                      ) : null}
                      {product.weight && (
                        <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-semibold border border-amber-200/50">
                          {product.weight}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Arrow */}
                  <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-amber-600 group-hover:translate-x-0.5 transition-all shrink-0" />
                </button>
              ))}

              {/* View all button */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={handleSearchSubmit}
                  className="w-full py-2 px-3 rounded-xl bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 dark:hover:bg-orange-900/60 text-orange-700 dark:text-orange-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <span>সবগুলো ফলাফল দেখুন ({filteredProducts.length}টি মধু)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 text-center">
              <p className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                &ldquo;{query}&rdquo; দিয়ে কোনো মধু পাওয়া যায়নি
              </p>
              <p className="text-[11px] text-zinc-400 mt-1">
                সুন্দরবন, সরিষা বা কালোজিরা লিখে চেষ্টা করুন
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
