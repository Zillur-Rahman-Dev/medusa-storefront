"use client"

import React, { useState } from "react"
import { Minus, Plus, Check } from "lucide-react"

export type WeightOption = {
  id: string
  label: string
  sublabel?: string
  badge?: string
  matches: (title: string, weightMetadata?: string) => boolean
}

export const WEIGHT_OPTIONS: WeightOption[] = [
  {
    id: "all",
    label: "সকল ওজন",
    matches: () => true,
  },
  {
    id: "500g",
    label: "৫০০ গ্রাম",
    sublabel: "500gm",
    matches: (title: string, weight?: string) => {
      const t = `${title} ${weight || ""}`.toLowerCase()
      return t.includes("500") || t.includes("৫০০")
    },
  },
  {
    id: "1kg",
    label: "১ কেজি",
    sublabel: "1kg",
    badge: "সেরা",
    matches: (title: string, weight?: string) => {
      const t = `${title} ${weight || ""}`.toLowerCase()
      return (
        t.includes("1kg") ||
        t.includes("1 kg") ||
        t.includes("১ কেজি") ||
        t.includes("1 কেজি")
      )
    },
  },
  {
    id: "2kg",
    label: "২ কেজি",
    sublabel: "2kg",
    matches: (title: string, weight?: string) => {
      const t = `${title} ${weight || ""}`.toLowerCase()
      return (
        t.includes("2kg") ||
        t.includes("2 kg") ||
        t.includes("২ কেজি") ||
        t.includes("2 কেজি")
      )
    },
  },
  {
    id: "3kg",
    label: "৩ কেজি",
    sublabel: "3kg",
    matches: (title: string, weight?: string) => {
      const t = `${title} ${weight || ""}`.toLowerCase()
      return (
        t.includes("3kg") ||
        t.includes("3 kg") ||
        t.includes("৩ কেজি") ||
        t.includes("3 কেজি")
      )
    },
  },
  {
    id: "5kg",
    label: "৫ কেজি",
    sublabel: "5kg",
    matches: (title: string, weight?: string) => {
      const t = `${title} ${weight || ""}`.toLowerCase()
      return (
        t.includes("5kg") ||
        t.includes("5 kg") ||
        t.includes("৫ কেজি") ||
        t.includes("5 কেজি")
      )
    },
  },
]

type WeightFilterProps = {
  selectedWeight: string
  onChange: (weightId: string) => void
  productCounts?: Record<string, number>
}

export default function WeightFilter({
  selectedWeight,
  onChange,
  productCounts = {},
}: WeightFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-xl p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
      {/* Title Header matching the reference image */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              PACK SIZE / WEIGHT
            </span>
            {/* Orange underline */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label={isOpen ? "Collapse weight filter" : "Expand weight filter"}
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
        <div className="pt-3 flex flex-wrap gap-1.5">
          {WEIGHT_OPTIONS.map((opt) => {
            const isSelected = selectedWeight === opt.id
            const count = productCounts[opt.id]

            return (
              <button
                key={opt.id}
                type="button"
                onClick={() =>
                  onChange(isSelected && opt.id !== "all" ? "all" : opt.id)
                }
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all duration-150 cursor-pointer ${
                  isSelected
                    ? "bg-orange-500 text-white border border-orange-600 shadow-xs"
                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200/80 dark:border-zinc-700/80"
                }`}
              >
                {isSelected && (
                  <Check className="w-3 h-3 stroke-[3] shrink-0" />
                )}
                <span>{opt.label}</span>

                {opt.badge && !isSelected && (
                  <span className="text-[9px] px-1 py-0.2 bg-amber-200/70 text-amber-900 dark:bg-amber-950 dark:text-amber-300 rounded font-bold">
                    {opt.badge}
                  </span>
                )}

                {typeof count === "number" && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      isSelected
                        ? "bg-orange-600 text-white"
                        : "bg-zinc-200/80 dark:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
                    }`}
                  >
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
