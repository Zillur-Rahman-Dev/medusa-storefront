"use client"

import React, { useState } from "react"
import { Minus, Plus, Tag, Zap, Check } from "lucide-react"
import { formatSize } from "@lib/util/money"

type OfferAvailabilityFilterProps = {
  onlyDiscount: boolean
  onChangeDiscount: (active: boolean) => void
  onlyInStock: boolean
  onChangeInStock: (active: boolean) => void
  discountCount?: number
  inStockCount?: number
}

export default function OfferAvailabilityFilter({
  onlyDiscount,
  onChangeDiscount,
  onlyInStock,
  onChangeInStock,
  discountCount = 0,
  inStockCount = 0,
}: OfferAvailabilityFilterProps) {
  const [isOpen, setIsOpen] = useState(true)

  return (
    <div className="w-full bg-white dark:bg-zinc-900 rounded-[6px] p-4 border border-zinc-200/80 dark:border-zinc-800 shadow-2xs">
      {/* Title Header matching the reference design */}
      <div className="pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center justify-between">
          <div className="relative inline-block pb-1">
            <span className="text-xs sm:text-sm font-black tracking-wider text-zinc-900 dark:text-zinc-100 uppercase">
              অফার ও প্রাপ্যতা / OFFERS & STATUS
            </span>
            {/* Orange underline */}
            <div className="absolute left-0 bottom-0 w-full h-[2.5px] bg-orange-500 rounded-full" />
          </div>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors cursor-pointer"
            aria-label={isOpen ? "Collapse offers filter" : "Expand offers filter"}
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
          {/* Discount Deals Option */}
          <button
            type="button"
            onClick={() => onChangeDiscount(!onlyDiscount)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer ${
              onlyDiscount
                ? "bg-orange-50 dark:bg-orange-950/40 border-orange-500 text-orange-600 dark:text-orange-400 shadow-2xs"
                : "bg-zinc-50/70 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${
                  onlyDiscount
                    ? "bg-orange-500 border-orange-500 text-white"
                    : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                }`}
              >
                {onlyDiscount && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-orange-500" />
                <span>ছাড়যুক্ত বিশেষ অফার</span>
              </span>
            </div>
            {discountCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300">
                {formatSize(String(discountCount))}
              </span>
            )}
          </button>

          {/* In-Stock Only Option */}
          <button
            type="button"
            onClick={() => onChangeInStock(!onlyInStock)}
            className={`w-full flex items-center justify-between p-2.5 rounded-lg border text-xs font-semibold transition-all duration-150 cursor-pointer ${
              onlyInStock
                ? "bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-600 dark:text-emerald-400 shadow-2xs"
                : "bg-zinc-50/70 dark:bg-zinc-800/60 border-zinc-200/80 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            }`}
          >
            <div className="flex items-center gap-2">
              <div
                className={`w-4 h-4 rounded-[3px] border flex items-center justify-center transition-colors ${
                  onlyInStock
                    ? "bg-emerald-500 border-emerald-500 text-white"
                    : "border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900"
                }`}
              >
                {onlyInStock && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>রেডি স্টক (তাৎক্ষণিক ডেলিভারি)</span>
              </span>
            </div>
            {inStockCount > 0 && (
              <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300">
                {formatSize(String(inStockCount))}
              </span>
            )}
          </button>
        </div>
      )}
    </div>
  )
}
