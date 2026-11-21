"use client"

import React, { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"

type BrandFilterProps = {
  selectedBrand: string
  onChange: (brand: string) => void
  productCounts?: Record<string, number>
}

export const DEFAULT_BRANDS = [
  { id: "all", label: "সব ব্র্যান্ড (All Brands)" },
  { id: "purehoney", label: "Pure Honey BD", keywords: ["pure", "honey", "খাঁটি"] },
  { id: "sundarban", label: "Sundarban Organic", keywords: ["sundarban", "সুন্দরবন", "kholisha", "খলিশা"] },
  { id: "hill_wild", label: "Hill Natural Honey", keywords: ["hill", "wild", "পাহাড়ি", "বুনো"] },
  { id: "ghorerbazar", label: "Ghorer Bazar", keywords: ["ghorer", "bazar", "বাজার"] },
  { id: "applied_nutrition", label: "Applied Nutrition", keywords: ["nutrition", "applied"] },
  { id: "shosti", label: "Shosti Food", keywords: ["shosti", "শান্তি"] },
]

export default function BrandFilter({
  selectedBrand,
  onChange,
  productCounts = {},
}: BrandFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[6px] p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
      {/* Title Header matching Image 4 */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-bold tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              BRANDS
            </span>
            <div className="absolute left-0 bottom-0 w-full h-[2px] bg-[#f26522] rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label={isOpen ? "Collapse brands" : "Expand brands"}
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
          {DEFAULT_BRANDS.map((b) => {
            const isSelected = selectedBrand === b.id
            const count = productCounts[b.id]

            return (
              <button
                key={b.id}
                type="button"
                onClick={() => onChange(isSelected && b.id !== "all" ? "all" : b.id)}
                className="w-full flex items-center justify-between py-1.5 px-1 rounded-[4px] text-xs sm:text-sm text-left group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-all ${
                      isSelected
                        ? "border-[#f26522] bg-[#f26522] text-white shadow-2xs"
                        : "border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 group-hover:border-zinc-400"
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                  </div>
                  <span
                    className={`text-xs sm:text-sm ${
                      isSelected
                        ? "font-bold text-[#f26522]"
                        : "text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900"
                    }`}
                  >
                    {b.label}
                  </span>
                </div>
                {typeof count === "number" && count > 0 && (
                  <span className="text-[11px] font-semibold text-zinc-400">
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
