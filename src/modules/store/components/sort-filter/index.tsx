"use client"

import React, { useState } from "react"
import { Minus, Plus } from "lucide-react"

export type StoreSortOption = "created_at" | "price_asc" | "price_desc" | "title_asc"

type SortFilterProps = {
  sortBy: StoreSortOption
  onChange: (sort: StoreSortOption) => void
}

const SORT_OPTIONS: { id: StoreSortOption; label: string }[] = [
  { id: "created_at", label: "সর্বশেষ মধু (Newest)" },
  { id: "price_asc", label: "দাম: কম থেকে বেশি (Low → High)" },
  { id: "price_desc", label: "দাম: বেশি থেকে কম (High → Low)" },
  { id: "title_asc", label: "নাম অনুযায়ী (Name: ক - ঁ)" },
]

export default function SortFilter({ sortBy, onChange }: SortFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Title Header matching the reference image */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              SORT BY
            </span>
            {/* Orange underline */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
            aria-label={isOpen ? "Collapse sort" : "Expand sort"}
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
          {SORT_OPTIONS.map((opt) => {
            const isSelected = sortBy === opt.id

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange(opt.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs sm:text-sm font-medium transition-all text-left ${
                  isSelected
                    ? "bg-orange-50 text-orange-700 dark:bg-orange-950/50 dark:text-orange-300 font-bold border border-orange-200 dark:border-orange-900"
                    : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                }`}
              >
                <span
                  className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                    isSelected
                      ? "border-orange-500 bg-orange-500"
                      : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                  }`}
                >
                  {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-white" />}
                </span>
                <span className="truncate">{opt.label}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
