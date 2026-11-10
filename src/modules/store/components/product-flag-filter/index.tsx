"use client"

import React, { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"

type ProductFlagFilterProps = {
  selectedFlag: string // 'all' | 'best_selling' | 'new_arrival'
  onChange: (flag: string) => void
  productCounts?: Record<string, number>
}

export default function ProductFlagFilter({
  selectedFlag,
  onChange,
  productCounts = {},
}: ProductFlagFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  const flags = [
    { id: "best_selling", label: "সর্বাধিক বিক্রিত (Best Selling)" },
    { id: "new_arrival", label: "নতুন আগমন (New Arrival)" },
  ]

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Title Header matching the reference image */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              স্পেশাল ট্যাগ / FLAG
            </span>
            {/* Orange underline */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label={isOpen ? "Collapse product flag" : "Expand product flag"}
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
          {flags.map((flag) => {
            const isSelected = selectedFlag === flag.id
            const count = productCounts[flag.id]

            return (
              <button
                key={flag.id}
                type="button"
                onClick={() => onChange(isSelected ? "all" : flag.id)}
                className="w-full flex items-center justify-between py-1 px-1 rounded-lg text-xs sm:text-sm text-left group cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors"
              >
                <div className="flex items-center gap-2.5 truncate pr-2">
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
                    {flag.label}
                  </span>
                </div>

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
