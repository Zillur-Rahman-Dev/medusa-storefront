"use client"

import React, { useState, useMemo, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import { SlidersHorizontal, X, RotateCcw, Search, Sparkles } from "lucide-react"

import PriceRangeSlider from "../price-range-slider"
import WeightFilter, { WEIGHT_OPTIONS } from "../weight-filter"
import CategoryFilter from "../category-filter"
import SortFilter, { StoreSortOption } from "../sort-filter"
import ProductPreview from "@modules/products/components/product-preview"

type ClientStoreViewProps = {
  products: HttpTypes.StoreProduct[]
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

// Helpers for price calculation
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
    let max = 3500 // fallback

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
  const initialSort = (searchParams?.get("sortBy") as StoreSortOption) || "created_at"

  const [searchQuery, setSearchQuery] = useState(initialQ)
  const [selectedCategory, setSelectedCategory] = useState(initialCategory)
  const [selectedWeight, setSelectedWeight] = useState(initialWeight)
  const [priceRange, setPriceRange] = useState<[number, number]>([
    0,
    maxPossiblePrice,
  ])
  const [sortBy, setSortBy] = useState<StoreSortOption>(initialSort)
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false)

  // Listen to searchParams changes (e.g. if user searched from HeaderSearch)
  useEffect(() => {
    const q = searchParams?.get("q")
    if (q !== null && q !== undefined) {
      setSearchQuery(q)
    }
  }, [searchParams])

  // Silently sync state to URL query string without triggering Next.js server component reload
  useEffect(() => {
    const params = new URLSearchParams()
    if (searchQuery.trim()) params.set("q", searchQuery.trim())
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (selectedWeight !== "all") params.set("weight", selectedWeight)
    if (priceRange[0] > minPossiblePrice) params.set("minPrice", priceRange[0].toString())
    if (priceRange[1] < maxPossiblePrice) params.set("maxPrice", priceRange[1].toString())
    if (sortBy !== "created_at") params.set("sortBy", sortBy)

    const queryStr = params.toString()
    const newUrl = queryStr ? `/${countryCode}/store?${queryStr}` : `/${countryCode}/store`
    window.history.replaceState(null, "", newUrl)
  }, [
    searchQuery,
    selectedCategory,
    selectedWeight,
    priceRange,
    sortBy,
    countryCode,
    minPossiblePrice,
    maxPossiblePrice,
  ])

  // Calculate dynamic product counts for categories and weights
  const { categoryCounts, weightCounts } = useMemo(() => {
    const catMap: Record<string, number> = { all: products.length }
    const weightMap: Record<string, number> = { all: products.length }

    // Init category counts
    categories.forEach((c) => {
      catMap[c.id] = 0
      if (c.handle) catMap[c.handle] = 0
    })

    // Init weight counts
    WEIGHT_OPTIONS.forEach((w) => {
      weightMap[w.id] = 0
    })

    products.forEach((p) => {
      // Categories
      p.categories?.forEach((c) => {
        catMap[c.id] = (catMap[c.id] || 0) + 1
        if (c.handle) catMap[c.handle] = (catMap[c.handle] || 0) + 1
      })

      // Weights
      WEIGHT_OPTIONS.forEach((w) => {
        if (w.id === "all") return
        const hasMatchingVariant = p.variants?.some((v) =>
          w.matches(v.title || "", (p.metadata?.weight as string) || (p.weight ? `${p.weight}g` : ""))
        )
        if (hasMatchingVariant) {
          weightMap[w.id] = (weightMap[w.id] || 0) + 1
        }
      })
    })

    return { categoryCounts: catMap, weightCounts: weightMap }
  }, [products, categories])

  // In-Memory Real-Time Filtering and Sorting (0ms, Zero Server Network Load)
  const filteredProducts = useMemo(() => {
    let result = products.filter((product) => {
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

      // 4. Price Range Filter
      const [currentMin, currentMax] = priceRange
      // Product matches if any variant's price falls inside [currentMin, currentMax]
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
      if (sortBy === "title_asc") {
        return (a.title || "").localeCompare(b.title || "", "bn")
      }
      // default: created_at desc
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
    priceRange,
    sortBy,
  ])

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0
    if (selectedCategory !== "all") count++
    if (selectedWeight !== "all") count++
    if (priceRange[0] > minPossiblePrice || priceRange[1] < maxPossiblePrice) count++
    if (searchQuery.trim()) count++
    return count
  }, [
    selectedCategory,
    selectedWeight,
    priceRange,
    searchQuery,
    minPossiblePrice,
    maxPossiblePrice,
  ])

  const handleResetFilters = () => {
    setSelectedCategory("all")
    setSelectedWeight("all")
    setPriceRange([minPossiblePrice, maxPossiblePrice])
    setSearchQuery("")
    setSortBy("created_at")
  }

  // Find category name for active pill
  const activeCategoryName = useMemo(() => {
    if (selectedCategory === "all") return null
    const found = categories.find(
      (c) => c.id === selectedCategory || c.handle === selectedCategory
    )
    return found ? found.name?.trim() : selectedCategory
  }, [selectedCategory, categories])

  // Find weight name for active pill
  const activeWeightName = useMemo(() => {
    if (selectedWeight === "all") return null
    const found = WEIGHT_OPTIONS.find((w) => w.id === selectedWeight)
    return found ? found.label : selectedWeight
  }, [selectedWeight])

  return (
    <div className="bg-zinc-50/50 dark:bg-zinc-950 min-h-screen py-6 sm:py-10">
      <div className="content-container">
        {/* Header Title & Breadcrumb Banner */}
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-600 dark:text-amber-400 mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>১০০% খাঁটি ও প্রাকৃতিক সুন্দরবনের মধু</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100 tracking-tight">
              আমাদের সকল খাঁটি মধু
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              সরাসরি সুন্দরবন ও দেশের সেরা মৌচাক থেকে সংগৃহীত নিরাপদ এবং পরীক্ষিত মধু
            </p>
          </div>

          {/* Search bar inside Store page */}
          <div className="relative w-full md:w-80">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="মধু বা ফুলের নাম লিখে খুঁজুন..."
              className="w-full pl-9 pr-8 py-2 text-xs sm:text-sm rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm"
            />
            <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-0.5 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile Horizontal Category Chips */}
        <div className="lg:hidden mb-4 overflow-x-auto pb-2 flex items-center gap-2 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
              selectedCategory === "all"
                ? "bg-orange-500 text-white shadow-sm"
                : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
            }`}
          >
            সকল মধু ({products.length})
          </button>
          {categories
            .filter((c) => {
              const h = c.handle?.toLowerCase() || ""
              const n = c.name?.toLowerCase() || ""
              return (
                !["shirts", "sweatshirts", "pants", "merch"].includes(h) &&
                !["shirts", "sweatshirts", "pants", "merch"].includes(n)
              )
            })
            .map((c) => {
              const isSelected = selectedCategory === c.id || selectedCategory === c.handle
              const count = categoryCounts[c.id] || categoryCounts[c.handle]
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => setSelectedCategory(isSelected ? "all" : c.id)}
                  className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isSelected
                      ? "bg-orange-500 text-white shadow-sm"
                      : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800"
                  }`}
                >
                  {c.name?.trim()} {count ? `(${count})` : ""}
                </button>
              )
            })}
        </div>

        {/* Mobile Filter & Sort Trigger Button */}
        <div className="lg:hidden mb-5 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => setIsMobileDrawerOpen(true)}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm shadow-sm hover:border-orange-500 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4 text-orange-500" />
            <span>ফিল্টার ও প্রাইস রেঞ্জ</span>
            {activeFiltersCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-orange-500 text-white text-[10px] flex items-center justify-center font-black">
                {activeFiltersCount}
              </span>
            )}
          </button>

          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-orange-600 text-xs font-semibold flex items-center gap-1 shadow-sm"
              title="ফিল্টার রিসেট"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>রিসেট</span>
            </button>
          )}
        </div>

        {/* Main Content Layout: Sidebar + Product Grid */}
        <div className="flex flex-col lg:flex-row lg:items-start gap-8">
          {/* DESKTOP SIDEBAR */}
          <aside className="hidden lg:block w-72 shrink-0 space-y-5 sticky top-20">
            {/* 1. Category Filter */}
            <CategoryFilter
              categories={categories}
              selectedCategory={selectedCategory}
              onChange={setSelectedCategory}
              productCounts={categoryCounts}
            />

            {/* 2. Price Range Slider (Matching user's reference image) */}
            <PriceRangeSlider
              min={minPossiblePrice}
              max={maxPossiblePrice}
              value={priceRange}
              onChange={setPriceRange}
              step={50}
            />

            {/* 3. Weight / Pack Size Filter */}
            <WeightFilter
              selectedWeight={selectedWeight}
              onChange={setSelectedWeight}
              productCounts={weightCounts}
            />

            {/* 4. Sort Options */}
            <SortFilter sortBy={sortBy} onChange={setSortBy} />

            {/* Reset All Button */}
            {activeFiltersCount > 0 && (
              <button
                type="button"
                onClick={handleResetFilters}
                className="w-full py-2.5 px-4 rounded-xl border border-dashed border-orange-300 dark:border-orange-800 text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>সব ফিল্টার মুছে ফেলুন ({activeFiltersCount})</span>
              </button>
            )}
          </aside>

          {/* MAIN PRODUCT GRID SECTION */}
          <main className="flex-1 min-w-0">
            {/* Top Toolbar: Result Count & Active Filter Pills */}
            <div className="bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm mb-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-300">
                  মোট <span className="text-orange-600 font-black">{filteredProducts.length}</span>টি মধুর মধ্যে{" "}
                  {filteredProducts.length === products.length ? (
                    "সবগুলো দেখানো হচ্ছে"
                  ) : (
                    <span>ফিল্টারকৃত মধু দেখানো হচ্ছে</span>
                  )}
                </div>

                {activeFiltersCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>ফিল্টার রিসেট করুন</span>
                  </button>
                )}
              </div>

              {/* Active Filter Chips */}
              {activeFiltersCount > 0 && (
                <div className="mt-3 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex flex-wrap items-center gap-2">
                  <span className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
                    সক্রিয় ফিল্টার:
                  </span>

                  {searchQuery && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 border border-amber-200 dark:border-amber-800">
                      সার্চ: &ldquo;{searchQuery}&rdquo;
                      <button
                        type="button"
                        onClick={() => setSearchQuery("")}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeCategoryName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                      ক্যাটেগরি: {activeCategoryName}
                      <button
                        type="button"
                        onClick={() => setSelectedCategory("all")}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {activeWeightName && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                      ওজন: {activeWeightName}
                      <button
                        type="button"
                        onClick={() => setSelectedWeight("all")}
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}

                  {(priceRange[0] > minPossiblePrice ||
                    priceRange[1] < maxPossiblePrice) && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 dark:bg-orange-950/60 text-orange-900 dark:text-orange-200 border border-orange-200 dark:border-orange-800">
                      দাম: ৳{priceRange[0].toLocaleString()} - ৳
                      {priceRange[1].toLocaleString()}
                      <button
                        type="button"
                        onClick={() =>
                          setPriceRange([minPossiblePrice, maxPossiblePrice])
                        }
                        className="hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* PRODUCT GRID OR EMPTY STATE */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white dark:bg-zinc-900 rounded-2xl p-8 sm:p-12 text-center border border-zinc-200 dark:border-zinc-800 shadow-sm max-w-lg mx-auto my-8">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-orange-50 dark:bg-orange-950/60 flex items-center justify-center text-orange-500">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                  কোনো মধু পাওয়া যায়নি
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-xs mx-auto">
                  আপনার নির্বাচিত ফিল্টার বা দামের সীমার সাথে মিল রেখে কোনো পণ্য খুঁজে পাওয়া যায়নি।
                </p>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>সব ফিল্টার রিসেট করুন</span>
                </button>
              </div>
            ) : (
              <ul
                className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6"
                data-testid="products-list"
              >
                {filteredProducts.map((product) => (
                  <li key={product.id}>
                    <ProductPreview product={product} region={region} />
                  </li>
                ))}
              </ul>
            )}
          </main>
        </div>
      </div>

      {/* MOBILE FILTER DRAWER */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileDrawerOpen(false)}
          />

          {/* Drawer Panel */}
          <div className="relative w-full max-w-sm bg-white dark:bg-zinc-900 h-full overflow-y-auto p-5 shadow-2xl flex flex-col justify-between z-10">
            <div className="space-y-5">
              {/* Drawer Header */}
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                  <SlidersHorizontal className="w-4 h-4 text-orange-500" />
                  <span className="font-extrabold text-base text-zinc-900 dark:text-zinc-100">
                    ফিল্টার ও সাজান
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsMobileDrawerOpen(false)}
                  className="p-1 rounded-full text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Price Range */}
              <PriceRangeSlider
                min={minPossiblePrice}
                max={maxPossiblePrice}
                value={priceRange}
                onChange={setPriceRange}
                step={50}
              />

              {/* Weight */}
              <WeightFilter
                selectedWeight={selectedWeight}
                onChange={setSelectedWeight}
                productCounts={weightCounts}
              />

              {/* Categories */}
              <CategoryFilter
                categories={categories}
                selectedCategory={selectedCategory}
                onChange={setSelectedCategory}
                productCounts={categoryCounts}
              />

              {/* Sort */}
              <SortFilter sortBy={sortBy} onChange={setSortBy} />
            </div>

            {/* Drawer Bottom Actions */}
            <div className="pt-5 mt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-3">
              <button
                type="button"
                onClick={handleResetFilters}
                className="flex-1 py-3 px-4 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 font-bold text-xs"
              >
                রিসেট
              </button>
              <button
                type="button"
                onClick={() => setIsMobileDrawerOpen(false)}
                className="flex-2 py-3 px-6 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-md"
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
