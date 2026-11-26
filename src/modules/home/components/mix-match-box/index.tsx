"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Package, Plus, Check, ShoppingCart, Loader2, Trash2, Sparkles } from "lucide-react"
import { formatPrice } from "@lib/util/money"
import { addToCart } from "@lib/data/cart"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

type MixMatchBoxProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
  badge?: string
  boxSize?: number // default 3 items
  discountPercent?: number // e.g. 15%
  discountAmount?: number // e.g. 300 taka
}

export default function MixMatchBox({
  products = [],
  title = "নিজের পছন্দমতো ৩টি মধুর কম্বো বক্স তৈরি করুন",
  subtitle = "যেকোনো ৩টি খাঁটি মধু নিজের ইচ্ছামতো পছন্দ করুন এবং উপভোগ করুন বিশেষ কম্বো ছাড়!",
  badge = "কম্বো অফার / Buy X Get Y",
  boxSize = 3,
  discountPercent = 15,
  discountAmount,
}: MixMatchBoxProps) {
  const [selectedJars, setSelectedJars] = useState<HoneyProductItem[]>([])
  const [isAdding, setIsAdding] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  if (!products || products.length === 0) return null

  const handleToggleJar = (item: HoneyProductItem) => {
    if (selectedJars.some((j) => j.id === item.id)) {
      // Remove
      setSelectedJars((prev) => prev.filter((j) => j.id !== item.id))
    } else {
      // Add if space available
      if (selectedJars.length < boxSize) {
        setSelectedJars((prev) => [...prev, item])
      }
    }
  }

  const handleRemoveSlot = (index: number) => {
    setSelectedJars((prev) => prev.filter((_, i) => i !== index))
  }

  const rawSubtotal = selectedJars.reduce((acc, it) => acc + (it.price || 1000), 0)
  const isBoxFull = selectedJars.length === boxSize

  // Calculate discount based on Amount or Percent
  let discountedTotal = rawSubtotal
  let savings = 0

  if (isBoxFull) {
    if (discountAmount && discountAmount > 0) {
      savings = discountAmount
      discountedTotal = Math.max(0, rawSubtotal - discountAmount)
    } else {
      discountedTotal = Math.round(rawSubtotal * (1 - discountPercent / 100))
      savings = rawSubtotal - discountedTotal
    }
  }

  const handleAddBoxToCart = async () => {
    if (!isBoxFull) return
    try {
      setIsAdding(true)
      for (const item of selectedJars) {
        if (item.variantId) {
          await addToCart({
            variantId: item.variantId,
            quantity: 1,
            countryCode: "bd",
          })
        }
      }
      setIsSuccess(true)
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:item-added"))
      }
      setTimeout(() => {
        setIsSuccess(false)
        setSelectedJars([])
      }, 3500)
    } catch (err) {
      console.error("Box add error:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section className="w-full py-8 sm:py-14 bg-gradient-to-b from-orange-50/50 via-amber-50/30 to-transparent dark:from-zinc-900/60 dark:to-zinc-950 border-y border-amber-200/50 dark:border-zinc-800">
      <div className="content-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-orange-600 text-white shadow-xs">
            <Package className="w-3.5 h-3.5" />
            {badge}
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* Visual Box Slots */}
        <div className="max-w-2xl mx-auto mb-8 p-4 sm:p-6 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-dashed border-amber-300 dark:border-amber-800 shadow-sm">
          <div className="flex items-center justify-between mb-3 text-xs font-bold text-zinc-600 dark:text-zinc-400">
            <span>আপনার বক্সের অবস্থা: ({selectedJars.length}/{boxSize})</span>
            {isBoxFull ? (
              <span className="text-emerald-600 font-bold flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                বক্সটি সম্পূর্ণ হয়েছে!
              </span>
            ) : (
              <span className="text-amber-600">আর {boxSize - selectedJars.length}টি মধু সিলেক্ট করুন</span>
            )}
          </div>

          <div className="grid grid-cols-3 gap-2.5 sm:gap-4">
            {Array.from({ length: boxSize }).map((_, idx) => {
              const jar = selectedJars[idx]
              return (
                <div
                  key={idx}
                  className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center p-2 text-center transition-all ${
                    jar
                      ? "bg-amber-50 dark:bg-zinc-800 border-2 border-amber-500 shadow-xs"
                      : "bg-zinc-100/70 dark:bg-zinc-850/60 border-2 border-dashed border-zinc-300 dark:border-zinc-700 text-zinc-400"
                  }`}
                >
                  {jar ? (
                    <>
                      <button
                        type="button"
                        onClick={() => handleRemoveSlot(idx)}
                        className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-red-500 hover:bg-red-600 text-white flex items-center justify-center shadow-xs cursor-pointer z-10"
                        title="সরিয়ে ফেলুন"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                      <div className="w-12 h-12 sm:w-16 sm:h-16 relative mb-1">
                        <Image
                          src={jar.thumbnail || "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"}
                          alt={jar.title}
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-[10px] sm:text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate w-full px-1">
                        {jar.title}
                      </span>
                    </>
                  ) : (
                    <div className="flex flex-col items-center gap-1">
                      <Plus className="w-5 h-5 text-zinc-400" />
                      <span className="text-[10px] sm:text-xs font-semibold">জার #{idx + 1}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Checkout Bar inside Box */}
          <div className="mt-5 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-black text-amber-700 dark:text-amber-400">
                  {formatPrice(discountedTotal)}
                </span>
                {isBoxFull && savings > 0 && (
                  <>
                    <span className="text-xs sm:text-sm text-zinc-400 line-through">
                      {formatPrice(rawSubtotal)}
                    </span>
                    <span className="text-xs font-bold text-emerald-700 bg-emerald-100 dark:bg-emerald-950/60 dark:text-emerald-300 px-2 py-0.5 rounded-md">
                      {discountAmount ? `৳${discountAmount} ছাড়!` : `${discountPercent}% ছাড়!`}
                    </span>
                  </>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddBoxToCart}
              disabled={!isBoxFull || isAdding}
              className={`w-full sm:w-auto px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                isBoxFull
                  ? "bg-amber-600 hover:bg-amber-700 text-white active:scale-95"
                  : "bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed shadow-none"
              }`}
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>কার্টে যোগ হচ্ছে...</span>
                </>
              ) : isSuccess ? (
                <span>🎉 বক্স সফলভাবে যোগ হয়েছে!</span>
              ) : (
                <>
                  <ShoppingCart className="w-4 h-4" />
                  <span>{isBoxFull ? "কাস্টম কম্বো বক্স কার্টে নিন" : `আরও ${boxSize - selectedJars.length}টি জার বাছুন`}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Honey Picker Carousel / Grid */}
        <div className="space-y-3">
          <h4 className="text-xs sm:text-sm font-bold text-zinc-700 dark:text-zinc-300 text-center">
            নিচ থেকে আপনার পছন্দের ৩টি মধু ক্লিক করে বক্সে যোগ করুন:
          </h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {products.slice(0, 10).map((prod) => {
              const isSelected = selectedJars.some((j) => j.id === prod.id)
              return (
                <div
                  key={prod.id}
                  onClick={() => handleToggleJar(prod)}
                  className={`p-3 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? "bg-amber-50 dark:bg-zinc-800/80 border-amber-500 ring-2 ring-amber-500/30"
                      : "bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:border-amber-300"
                  }`}
                >
                  <div className="aspect-square relative w-full mb-2 bg-zinc-50 dark:bg-zinc-800 rounded-xl overflow-hidden p-1">
                    <Image
                      src={prod.thumbnail || "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"}
                      alt={prod.title}
                      fill
                      className="object-contain"
                    />
                  </div>
                  <div>
                    <h5 className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate mb-1">
                      {prod.title}
                    </h5>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-amber-700 dark:text-amber-400">
                        {formatPrice(prod.price)}
                      </span>
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isSelected
                            ? "bg-amber-600 text-white"
                            : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500"
                        }`}
                      >
                        {isSelected ? <Check className="w-3 h-3" /> : "+"}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
