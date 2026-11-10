"use client"

import React, { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"
import { HttpTypes } from "@medusajs/types"

type CategoryFilterProps = {
  categories: HttpTypes.StoreProductCategory[]
  selectedCategory: string
  onChange: (categoryId: string) => void
  productCounts?: Record<string, number>
}

const IGNORED_HANDLES = new Set(["shirts", "sweatshirts", "pants", "merch"])

export default function CategoryFilter({
  categories,
  selectedCategory,
  onChange,
  productCounts = {},
}: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  // Filter out only default starter apparel categories (Shirts/Sweatshirts/Pants/Merch)
  // Any new category created in admin will automatically show up!
  const displayCategories = categories.filter((c) => {
    const handle = c.handle?.toLowerCase() || ""
    const name = c.name?.toLowerCase() || ""
    return !IGNORED_HANDLES.has(handle) && !IGNORED_HANDLES.has(name)
  })

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Title Header matching the reference image */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              CATEGORIES
            </span>
            {/* Orange underline */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label={isOpen ? "Collapse categories" : "Expand categories"}
          >
            {isOpen ? (
              <Minus className="w-4 h-4 stroke-[2.5]" />
            ) : (
              <Plus className="w-4 h-4 stroke-[2.5]" />
            )}
          </button>
        </div>
      </div>

      {isOpen && (
        <div className="pt-3 space-y-1">
          {/* All category */}
          <button
            type="button"
            onClick={() => onChange("all")}
            className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all ${
              selectedCategory === "all"
                ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900"
                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  selectedCategory === "all" ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-700"
                }`}
              />
              <span>সকল মধু</span>
            </div>
            {typeof productCounts["all"] === "number" && (
              <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                {productCounts["all"]}
              </span>
            )}
          </button>

          {/* Individual categories */}
          {displayCategories.map((c) => {
            const isSelected = selectedCategory === c.id || selectedCategory === c.handle
            const count = productCounts[c.id] || productCounts[c.handle]

            // Clean title of any tab characters
            const cleanName = c.name?.replace(/^\s+|\s+$/g, "") || ""

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(isSelected ? "all" : c.id)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isSelected ? "bg-orange-500" : "bg-zinc-300 dark:bg-zinc-700"
                    }`}
                  />
                  <span className="truncate">{cleanName}</span>
                </div>
                {typeof count === "number" && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 shrink-0 ml-2">
                    {count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
