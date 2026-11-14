"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { X, SlidersHorizontal, ListFilter, ArrowUpDown, Eye } from "lucide-react"

import PriceRangeSlider from "../price-range-slider"
import WeightFilter, { WEIGHT_OPTIONS } from "../weight-filter"
import CategoryFilter from "../category-filter"
import ProductFlagFilter from "../product-flag-filter"
import ProductPreview from "@modules/products/components/product-preview"
import { formatPrice } from "@lib/util/money"

type ClientStoreViewProps = {
  products: HttpTypes.StoreProduct[]
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

export type StoreSortOption =
  | "default"
  | "created_at"
  | "latest"
  | "oldest"
  | "price_asc"
  | "price_desc"
  | "offer"

// Helper for product price
function getProductMinPrice(product: HttpTypes.StoreProduct): number {
  if (!product.variants?.length) return 0
  const amounts = product.variants
    .map((v: any) => v.calculated_price?.calculated_amount)
    .filter((a): a is number => typeof a === "number" && !isNaN(a))
  return amounts.length ? Math.min(...amounts) : 0
}

function getProductMaxPrice(product: HttpTypes.StoreProduct): number {
  if (!product.variants?.length) return 0
  const amounts = product.variants
    .map((v: any) => v.calculated_price?.calculated_amount)
    .filter((a): a is number => typeof a === "number" && !isNaN(a))
  return amounts.length ? Math.max(...amounts) : 0
}

export default function ClientStoreView({
  products,
  categories,
  region,
  countryCode,
}: ClientStoreViewProps) {
  const searchParams = useSearchParams()

  // Calculate global min and max prices from inventory
  const { minPossiblePrice, maxPossiblePrice } = useMemo(() => {
    let min = 0
    let max = 3500

    products.forEach((p) => {
      p.variants?.forEach((v: any) => {
        const amt = v.calculated_price?.calculated_amount
        if (typeof amt === "number" && !isNaN(amt)) {
          if (amt > max) max = Math.ceil(amt / 100) * 100
        }
      })
    })

    return { minPossiblePrice: min, maxPossiblePrice: max }
  }, [products])

  // Initial states from URL params if present
  const initialQ = searchParams?.get("q") || ""
  const initialCategory = searchParams?.get("category") || "all"
  const initialWeight = searchParams?.get("weight") || "all"
  const initialFlag = searchParams?.get("flag") || "all"
  const initialSort = (searchParams?.get("sortBy") as StoreSortOption) || "default"

  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedWeight, setSelectedWeight] = useState(initialWeight)
  const [selectedFlag, setSelectedFlag] = useState(initialFlag)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    maxPossiblePrice,
  ])
  const [sortBy, setSortBy] = useState<StoreSortOption>(initialSort)
  const [itemsPerPage, setItemsPerPage] = useState<string>("default")
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Sync with searchParams
  useEffect(() => {
    const q = searchParams?.get("q")
    if (q !== null && q !== undefined) {
      setSearchQuery(q)
    }
  }, [searchParams])

  // Silently update URL without triggering Next.js server reload
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (selectedWeight !== "all") params.set("weight", selectedWeight)
    if (selectedFlag !== "all") params.set("flag", selectedFlag)
    if (priceRange[0] > minPossiblePrice) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < maxPossiblePrice) params.set("maxPrice", priceRange[1].toString())
    if (sortBy !== "default" && sortBy !== "created_at") params.set("sortBy", sortBy)

    const queryStr = params.toString()
    const newUrl = queryStr ? `/${countryCode}/store?${queryStr}` : `/${countryCode}/store`
    window.history.replaceState(null, "", newUrl)
  }, [
    searchQuery,
    selectedCategory,
    selectedWeight,
    selectedFlag,
    priceRange,
    sortBy,
    countryCode,
    minPossiblePrice,
    maxPossiblePrice,
  ])

  // Dynamic counts for categories, weights, and flags
  const { categoryCounts, weightCounts, flagCounts } = useMemo(() => {
    const catMap: Record<string, number> = { all: products.length }
    const weightMap: Record<string, number> = { all: products.length }
    const fMap: Record<string, number> = { best_selling: 0, new_arrival: 0 }

    categories.forEach((c) => {
      catMap[c.id] = 0
      if (c.handle) catMap[c.handle] = 0
    })

    WEIGHT_OPTIONS.forEach((w) => {
      weightMap[w.id] = 0
    })

    products.forEach((p, idx) => {
      // Categories
      p.categories?.forEach((c) => {
        catMap[c.id] = (catMap[c.id] || 0) + 1
        if (c.handle) catMap[c.handle] = (catMap[c.handle] || 0) + 1
      })

      // Weights
      WEIGHT_OPTIONS.forEach((w) => {
        if (w.id === "all") return
        const hasMatchingVariant = p.variants?.some((v) =>
          w.matches(
            v.title || "",
            (p.metadata?.weight as string) || (p.weight ? `${p.weight}g` : "")
          )
        )
        if (hasMatchingVariant) {
          weightMap[w.id] = (weightMap[w.id] || 0) + 1
        }
      })

      // Flags
      const isBest =
        p.categories?.some(
          (c) =>
            c.handle?.includes("top-selling") ||
            c.name?.includes("বিক্রিত") ||
            c.name?.includes("সেরা")
        ) ||
        p.tags?.some((t) => t.value?.toLowerCase().includes("best")) ||
        idx < 4

      if (isBest) fMap.best_selling = (fMap.best_selling || 0) + 1

      // New arrival (top 4 or tags)
      if (idx < 5 || p.tags?.some((t) => t.value?.toLowerCase().includes("new"))) {
        fMap.new_arrival = (fMap.new_arrival || 0) + 1
      }
    })

    return { categoryCounts: catMap, weightCounts: weightMap, flagCounts: fMap }
  }, [products, categories])

  // In-Memory Filtering and Sorting (0ms, Zero Server Network Load)
  const filteredProducts = useMemo(() => {
    let result = products.filter((product, idx) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim()
        const titleMatch = product.title?.toLowerCase().includes(q)
        const descMatch = product.description?.toLowerCase().includes(q)
        const handleMatch = product.handle?.toLowerCase().includes(q)
        const categoryMatch = product.categories?.some((c) =>
          c.name?.toLowerCase().includes(q)
        )
        if (!titleMatch && !descMatch && !handleMatch && !categoryMatch) {
          return false
        }
      }

      // 2. Category Filter
      if (selectedCategory !== "all") {
        const matchesCategory = product.categories?.some(
          (c) => c.id === selectedCategory || c.handle === selectedCategory
        )
        if (!matchesCategory) return false
      }

      // 3. Weight Filter
      if (selectedWeight !== "all") {
        const opt = WEIGHT_OPTIONS.find((w) => w.id === selectedWeight)
        if (opt) {
          const hasVariant = product.variants?.some((v) =>
            opt.matches(
              v.title || "",
              (product.metadata?.weight as string) ||
                (product.weight ? `${product.weight}g` : "")
            )
          )
          if (!hasVariant) return false
        }
      }

      // 4. Product Flag Filter (Best Selling / New Arrival)
      if (selectedFlag === "best_selling") {
        const isBest =
          product.categories?.some(
            (c) =>
              c.handle?.includes("top-selling") ||
              c.name?.includes("বিক্রিত") ||
              c.name?.includes("সেরা")
          ) ||
          product.tags?.some((t) => t.value?.toLowerCase().includes("best")) ||
          idx < 4
        if (!isBest) return false
      } else if (selectedFlag === "new_arrival") {
        const isNew =
          idx < 5 || product.tags?.some((t) => t.value?.toLowerCase().includes("new"))
        if (!isNew) return false
      }

      // 5. Price Range Filter
      const [currentMin, currentMax] = priceRange
      const hasPriceInRange = product.variants?.some((v: any) => {
        const amt = v.calculated_price?.calculated_amount
        if (typeof amt !== "number" || isNaN(amt)) return false
        return amt >= currentMin && amt <= currentMax
      })

      if (!hasPriceInRange) return false

      return true
    })

    // Sorting
    result.sort((a, b) => {
      if (sortBy === "price_asc") {
        return getProductMinPrice(a) - getProductMinPrice(b)
      }
      if (sortBy === "price_desc") {
        return getProductMaxPrice(b) - getProductMaxPrice(a)
      }
      if (sortBy === "latest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateB - dateA
      }
      if (sortBy === "oldest") {
        const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
        const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
        return dateA - dateB
      }
      if (sortBy === "offer") {
        const isOfferA = a.tags?.some((t) => t.value?.toLowerCase().includes("offer")) || false
        const isOfferB = b.tags?.some((t) => t.value?.toLowerCase().includes("offer")) || false
        return (isOfferB ? 1 : 0) - (isOfferA ? 1 : 0)
      }
      // default / created_at
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })

    return result
  }, [
    products,
    searchQuery,
    selectedCategory,
    selectedWeight,
    selectedFlag,
    priceRange,
    sortBy,
  ])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== "all") count++
    if (selectedWeight !== "all") count++
    if (selectedFlag !== "all") count++
    if (priceRange[0] > minPossiblePrice || priceRange[1] < maxPossiblePrice) count++
    if (searchQuery.trim()) count++
    return count
  }, [
    selectedCategory,
    selectedWeight,
    selectedFlag,
    priceRange,
    searchQuery,
    minPossiblePrice,
    maxPossiblePrice,
  ])

  const handleResetFilters = () => {
    setSelectedCategory("all")
    setSelectedWeight("all")
    setSelectedFlag("all")
    setPriceRange([minPossiblePrice, maxPossiblePrice])
    setSearchQuery("")
    setSortBy("default")
  }

  // Active Category Name for chip
  const activeCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null
    const found = categories.find(
      (c) => c.id === selectedCategory || c.handle === selectedCategory
    )
    return found ? found.name?.trim() : selectedCategory
  }, [selectedCategory, categories])

  // Active Weight Name for chip
  const activeWeightName = useMemo(() => {
    if (selectedWeight === "all") return null
    const found = WEIGHT_OPTIONS.find((w) => w.id === selectedWeight)
    return found ? found.label : selectedWeight
  }, [selectedWeight])

  // Active Flag Name for chip
  const activeFlagName = useMemo(() => {
    if (selectedFlag === "best_selling") return "সর্বাধিক বিক্রিত"
    if (selectedFlag === "new_arrival") return "নতুন আগমন"
    return null
  }, [selectedFlag])

  // Pagination slice
  const displayedProducts = useMemo(() => {
    if (itemsPerPage === "default") return filteredProducts
    const limit = parseInt(itemsPerPage)
    return isNaN(limit) ? filteredProducts : filteredProducts.slice(0, limit)
  }, [filteredProducts, itemsPerPage])

  // Mobile clean button label helpers so user never sees duplicate "Default ...":
  const currentSortLabel = useMemo(() => {
    switch (sortBy) {
      case "latest":
        return "নতুন মধু"
      case "oldest":
        return "পুরাতন"
      case "price_asc":
        return "কম দাম"
      case "price_desc":
        return "বেশি দাম"
      case "offer":
        return "অফার"
      default:
        return "সাজান"
    }
  }, [sortBy])

  const currentLimitLabel = useMemo(() => {
    switch (itemsPerPage) {
      case "16":
        return "১৬টি"
      case "20":
        return "২০টি"
      case "24":
        return "২৪টি"
      case "36":
        return "৩৬টি"
      default:
        return "সব মধু"
    }
  }, [itemsPerPage])

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen py-5 sm:py-8">
      <div className="content-container">
        {/* Breadcrumb row */}
        <div className="flex items-center justify-between pb-3 sm:pb-4 text-xs text-zinc-500">
          <h1 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
            আমাদের সকল খাঁটি মধু
          </h1>
          <div className="hidden sm:flex items-center gap-1.5">
            <span>হোম</span>
            <span>&gt;</span>
            <span className="text-zinc-900 dark:text-zinc-100 font-semibold">স্টোর</span>
          </div>
        </div>

        {/* MOBILE TOP CONTROLS BAR: 3 distinct buttons without text overlap */}
        <div className="lg:hidden mb-3">
          <div className="grid grid-cols-3 gap-2">
            {/* 1. FILTERS Button */}
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              className="flex items-center justify-center gap-1 py-2 px-1.5 rounded-lg border-2 border-orange-500 bg-white dark:bg-zinc-900 text-orange-500 font-bold text-xs shadow-xs active:scale-95 transition-all cursor-pointer"
            >
              <ListFilter className="w-3.5 h-3.5 stroke-[2.5] shrink-0" />
              <span className="truncate">ফিল্টার</span>
              {activeFiltersCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-black shrink-0 ml-0.5">
                  {activeFiltersCount}
                </span>
              )}
            </button>

            {/* 2. Sorting Button (Transparent select over custom styled button) */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as StoreSortOption)}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                aria-label="Sort products"
              >
                <option value="default">সাধারণ সাজান (Default)</option>
                <option value="latest">নতুন মধু (Latest)</option>
                <option value="oldest">পুরাতন মধু (Oldest)</option>
                <option value="price_asc">দাম: কম থেকে বেশি (Low to High)</option>
                <option value="price_desc">দাম: বেশি থেকে কম (High to Low)</option>
                <option value="offer">অফার প্রোডাক্ট (Offers)</option>
              </select>
              <div className="w-full h-full py-2 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <ArrowUpDown className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                    {currentSortLabel}
                  </span>
                </div>
                <span className="text-[9px] text-zinc-400 shrink-0 ml-0.5">▼</span>
              </div>
            </div>

            {/* 3. Items Limit Button (Transparent select over custom styled button) */}
            <div className="relative">
              <select
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 z-10 cursor-pointer"
                aria-label="Products per page"
              >
                <option value="default">সব মধু দেখুন (All)</option>
                <option value="16">১৬টি করে দেখুন (16)</option>
                <option value="20">২০টি করে দেখুন (20)</option>
                <option value="24">২৪টি করে দেখুন (24)</option>
                <option value="36">৩৬টি করে দেখুন (36)</option>
              </select>
              <div className="w-full h-full py-2 px-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between shadow-xs">
                <div className="flex items-center gap-1 min-w-0 truncate">
                  <Eye className="w-3 h-3 text-orange-500 shrink-0" />
                  <span className="text-xs font-bold text-orange-600 dark:text-orange-400 truncate">
                    {currentLimitLabel}
                  </span>
                </div>
                <span className="text-[9px] text-orange-500 shrink-0 ml-0.5">▼</span>
              </div>
            </div>
          </div>

          {/* Mobile Product Count & Active Filters */}
          <div className="mt-2.5 flex flex-wrap items-center justify-between gap-1.5 text-xs">
            <span className="text-zinc-600 dark:text-zinc-400 font-semibold">
              মোট <span className="font-extrabold text-orange-600">{filteredProducts.length}টি</span> মধু পাওয়া গেছে
            </span>
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="text-red-600 font-bold text-xs hover:underline cursor-pointer"
              >
                রিসেট করুন
              </button>
            )}
          </div>
        </div>

        {/* DESKTOP TOP BAR:
            LEFT SIDE: Product Count + সক্রিয় ফিল্টার tags
            RIGHT SIDE: Sort By : [ ... ] and প্রদর্শন: [ ... ] */}
        <div className="hidden lg:flex items-center justify-between py-2.5 px-4 mb-4 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          {/* LEFT SIDE: Product Count + Active Filter Tags */}
          <div className="flex items-center gap-3 flex-wrap min-w-0">
            {/* Product Count Display */}
            <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/60 px-3 py-1 rounded-lg shrink-0">
              মোট {filteredProducts.length}টি মধু
            </span>

            {/* Active Filters row (Image 3) on the LEFT */}
            {activeFiltersCount > 0 && (
              <div className="flex items-center gap-2 flex-wrap border-l border-zinc-200 dark:border-zinc-800 pl-3">
                <span className="text-xs text-zinc-500 font-medium shrink-0">
                  সক্রিয় ফিল্টার:
                </span>

                {/* Search tag */}
                {searchQuery && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm">
                    <span>সার্চ: &ldquo;{searchQuery}&rdquo;</span>
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="hover:text-red-500 p-0.5 cursor-pointer"
                      aria-label="Remove search filter"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {/* Category tag */}
                {activeCategoryName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm">
                    <span>ক্যাটেগরি: {activeCategoryName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedCategory("all")}
                      className="hover:text-red-500 p-0.5 cursor-pointer"
                      aria-label="Remove category filter"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {/* Weight tag */}
                {activeWeightName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm">
                    <span>ওজন: {activeWeightName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedWeight("all")}
                      className="hover:text-red-500 p-0.5 cursor-pointer"
                      aria-label="Remove weight filter"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {/* Flag tag */}
                {activeFlagName && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm">
                    <span>ফ্ল্যাগ: {activeFlagName}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedFlag("all")}
                      className="hover:text-red-500 p-0.5 cursor-pointer"
                      aria-label="Remove flag filter"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                )}

                {/* Price tag */}
                {(priceRange[0] > minPossiblePrice ||
                  priceRange[1] < maxPossiblePrice) && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800 shadow-sm">
                    <span>
                      দাম: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                    </span>
                    <button
                      type="button"
                      onClick={() =>
                        setPriceRange([minPossiblePrice, maxPossiblePrice])
                      }
                      className="hover:text-red-500 p-0.5 cursor-pointer"
                      aria-label="Remove price filter"
                    >
                      <X className="w-3 h-3 stroke-[2.5]" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: Sort By and প্রদর্শন Dropdowns */}
          <div className="flex items-center gap-4 shrink-0 ml-4">
            {/* Sort By controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                সাজান :
              </span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as StoreSortOption)}
                  className="py-1.5 pl-3 pr-8 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/60 text-xs sm:text-sm font-semibold text-zinc-800 dark:text-zinc-200 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="default">সাধারণ সাজান</option>
                  <option value="latest">নতুন মধু (সর্বশেষ)</option>
                  <option value="oldest">পুরাতন মধু</option>
                  <option value="price_asc">দাম: কম থেকে বেশি</option>
                  <option value="price_desc">দাম: বেশি থেকে কম</option>
                  <option value="offer">অফার প্রোডাক্ট</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2.5 flex items-center text-zinc-400 text-xs">
                  ▼
                </div>
              </div>
            </div>

            {/* প্রদর্শন dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                প্রদর্শন :
              </span>
              <div className="relative">
                <select
                  value={itemsPerPage}
                  onChange={(e) => setItemsPerPage(e.target.value)}
                  className="py-1.5 pl-3 pr-7 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs sm:text-sm font-bold text-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 shadow-sm appearance-none cursor-pointer"
                >
                  <option value="default">সব মধু (সবগুলো)</option>
                  <option value="16">১৬টি করে</option>
                  <option value="20">২০টি করে</option>
                  <option value="24">২৪টি করে</option>
                  <option value="36">৩৬টি করে</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-2 flex items-center text-orange-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* MOBILE ACTIVE FILTER TAGS (Image 3) */}
        {activeFiltersCount > 0 && (
          <div className="lg:hidden mb-3 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="text-zinc-500 font-medium">সক্রিয় ফিল্টার:</span>

            {/* Search tag */}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>সার্চ: &ldquo;{searchQuery}&rdquo;</span>
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {/* Category tag */}
            {activeCategoryName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>ক্যাটেগরি: {activeCategoryName}</span>
                <button
                  type="button"
                  onClick={() => setSelectedCategory("all")}
                  className="hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {/* Weight tag */}
            {activeWeightName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>ওজন: {activeWeightName}</span>
                <button
                  type="button"
                  onClick={() => setSelectedWeight("all")}
                  className="hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {/* Flag tag */}
            {activeFlagName && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>ফ্ল্যাগ: {activeFlagName}</span>
                <button
                  type="button"
                  onClick={() => setSelectedFlag("all")}
                  className="hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}

            {/* Price tag */}
            {(priceRange[0] > minPossiblePrice ||
              priceRange[1] < maxPossiblePrice) && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50/90 dark:bg-amber-950/60 text-amber-950 dark:text-amber-200 border border-amber-300 dark:border-amber-800">
                <span>
                  দাম: {formatPrice(priceRange[0])} - {formatPrice(priceRange[1])}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setPriceRange([minPossiblePrice, maxPossiblePrice])
                  }
                  className="hover:text-red-500 p-0.5 cursor-pointer"
                >
                  <X className="w-3 h-3 stroke-[2.5]" />
                </button>
              </span>
            )}
          </div>
        )}

        {/* MAIN LAYOUT: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* DESKTOP SIDEBAR (Layout matching reference image) */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-4 sticky top-20">
            {/* 1. Red Clear All Filters Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 rounded-lg bg-[#e52d27] hover:bg-[#c91f1a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 uppercase tracking-wide cursor-pointer"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>সব ফিল্টার মুছুন</span>
              </button>
            )}

            {/* 2. Price Range Slider (Centered thumb, matching Image 6) */}
            <PriceRangeSlider
              min={minPossiblePrice}
              max={maxPossiblePrice}
              value={priceRange}
              onChange={setPriceRange}
              step={50}
            />

            {/* 3. Categories Filter (With tick mark checkboxes, matching Image) */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onChange={setSelectedCategory}
              productCounts={categoryCounts}
            />

            {/* 4. Weight / Pack Size Filter (Compact tag chips) */}
            <WeightFilter
              selectedWeight={selectedWeight}
              onChange={setSelectedWeight}
              productCounts={weightCounts}
            />

            {/* 5. Product Flag Filter (Best Selling, New Arrival, matching Image 3rd card) */}
            <ProductFlagFilter
              selectedFlag={selectedFlag}
              onChange={setSelectedFlag}
              productCounts={flagCounts}
            />
          </aside>

          {/* MAIN PRODUCT GRID SECTION */}
          <main className="flex-1 min-w-0">
            {displayedProducts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-12 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-lg mx-auto my-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-orange-500">
                  <SlidersHorizontal className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  কোনো মধু পাওয়া যায়নি
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  আপনার নির্বাচিত ফিল্টার বা দামের সীমার সাথে মিল রেখে কোনো পণ্য পাওয়া যায়নি।
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#e52d27] hover:bg-[#c91f1a] text-white font-bold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>সব ফিল্টার মুছুন</span>
                </button>
              </div>
            ) : (
              <ul
                className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                data-testid="products-list"
              >
                {displayedProducts.map((product) => (
                  <li key={product.id}>
                    <ProductPreview product={product} region={region} />
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE LEFT SLIDE-OVER DRAWER (Image 5) */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-start">
          {/* Backdrop on the right */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Left Drawer Panel */}
          <div className="relative w-[85%] max-w-[320px] bg-white dark:bg-zinc-900 h-full overflow-y-auto p-4 shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-left duration-250">
            <div className="space-y-4">
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <ListFilter className="w-4 h-4 text-orange-500 stroke-[2.5]" />
                  <span className="font-extrabold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 uppercase tracking-wide">
                    FILTERS
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
                  aria-label="Close filters drawer"
                >
                  <X className="w-5 h-5 stroke-[2.5]" />
                </button>
              </div>

              {/* Red Clear All Filters Button inside drawer */}
              {activeFiltersCount > 0 && (
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="w-full py-2.5 px-4 rounded-lg bg-[#e52d27] hover:bg-[#c91f1a] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md uppercase tracking-wide cursor-pointer"
                >
                  <X className="w-4 h-4 stroke-[3]" />
                  <span>সব ফিল্টার মুছুন</span>
                </button>
              )}

              {/* Price Range Slider */}
              <PriceRangeSlider
                min={minPossiblePrice}
                max={maxPossiblePrice}
                value={priceRange}
                onChange={setPriceRange}
                step={50}
              />

              {/* Categories Filter (Tick mark checkboxes) */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={setSelectedCategory}
                productCounts={categoryCounts}
              />

              {/* Weight Filter (Compact tag chips) */}
              <WeightFilter
                selectedWeight={selectedWeight}
                onChange={setSelectedWeight}
                productCounts={weightCounts}
              />

              {/* Product Flag Filter */}
              <ProductFlagFilter
                selectedFlag={selectedFlag}
                onChange={setSelectedFlag}
                productCounts={flagCounts}
              />
            </div>

            {/* Bottom drawer buttons */}
            <div className="pt-4 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2 sticky bottom-0 bg-white dark:bg-zinc-900 pb-2">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-2.5 px-3 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 font-bold text-xs cursor-pointer"
              >
                রিসেট
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-2 py-2.5 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md cursor-pointer"
              >
                {filteredProducts.length}টি মধু দেখুন
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
