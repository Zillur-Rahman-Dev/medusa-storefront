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

  // Filter out dummy apparel categories
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
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
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
        <div className="pt-3 space-y-2">
          {/* All Honey Option */}
          <button
            type="button"
            onClick={() => onChange("all")}
            className="w-full flex items-center justify-between py-1.5 px-1 rounded-lg text-xs sm:text-sm text-left group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              {/* Checkbox square matching reference image */}
              <div
                className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-all ${
                  selectedCategory === "all"
                    ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                    : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-zinc-400"
                }`}
              >
                {selectedCategory === "all" && (
                  <Check className="w-3 h-3 stroke-[3]" />
                )}
              </div>
              <span
                className={`text-xs sm:text-sm ${
                  selectedCategory === "all"
                    ? "font-bold text-zinc-900 dark:text-zinc-100"
                    : "font-medium text-zinc-700 dark:text-zinc-300"
                }`}
              >
                সকল মধু
              </span>
            </div>

            {/* Circular count pill matching image */}
            {typeof productCounts["all"] === "number" && (
              <span className="w-5 h-5 rounded-full bg-blue-50/80 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
                {productCounts["all"]}
              </span>
            )}
          </button>

          {/* Individual Category Options with Checkbox Tick Mark */}
          {displayCategories.map((c) => {
            const isSelected =
              selectedCategory === c.id || selectedCategory === c.handle
            const count = productCounts[c.id] || productCounts[c.handle]
            const cleanName = c.name?.replace(/^\s+|\s+$/g, "") || ""

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => onChange(isSelected ? "all" : c.id)}
                className="w-full flex items-center justify-between py-1.5 px-1 rounded-lg text-xs sm:text-sm text-left group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
                  {/* Checkbox square matching reference image */}
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center shrink-0 transition-all ${
                      isSelected
                        ? "border-orange-500 bg-orange-500 text-white shadow-xs"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-zinc-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm truncate ${
                      isSelected
                        ? "font-bold text-zinc-900 dark:text-zinc-100"
                        : "font-medium text-zinc-700 dark:text-zinc-300"
                    }`}
                  >
                    {cleanName}
                  </span>
                </div>

                {/* Circular count pill matching reference image */}
                {typeof count === "number" && (
                  <span className="w-5 h-5 rounded-full bg-blue-50/80 dark:bg-zinc-800 text-orange-600 dark:text-orange-400 text-xs font-bold flex items-center justify-center shrink-0">
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
