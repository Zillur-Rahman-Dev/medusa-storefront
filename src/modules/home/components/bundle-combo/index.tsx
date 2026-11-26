"use client"

import React, { useState } from "react"
import Image from "next/image"
import { Gift, CheckCircle2, ShoppingCart, Loader2 } from "lucide-react"
import { formatPrice } from "@lib/util/money"
import { addToCart } from "@lib/data/cart"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

type BundleComboProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
  discountBadge?: string
  comboPrice?: number
  originalPrice?: number
  freeGiftNote?: string
}

export default function BundleCombo({
  products = [],
  title = "ফ্যামিলি মেগা কম্বো প্যাক (৩টি সেরা মধু)",
  subtitle = "খলিশা + সরিষা + কালোজিরা মধুর পূর্ণাঙ্গ স্বাস্থ্য প্যাকেজ",
  discountBadge = "১৫% স্পেশাল সাশ্রয়",
  comboPrice,
  originalPrice,
  freeGiftNote = "🎁 সাথে পাচ্ছেন ১টি প্রিমিয়াম কাঠের মধুর চামচ সম্পূর্ণ ফ্রি!",
}: BundleComboProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)

  if (!products || products.length === 0) return null

  // Calculate prices dynamically if not provided
  const items = products.slice(0, 3)
  const calcOriginal = originalPrice || items.reduce((acc, it) => acc + (it.regularPrice || it.price || 1000), 0)
  const calcCombo = comboPrice || Math.round(calcOriginal * 0.85)
  const savings = calcOriginal - calcCombo

  const handleAddBundle = async () => {
    try {
      setIsAdding(true)
      // Add each item in the bundle to the cart
      for (const item of items) {
        if (item.variantId) {
          await addToCart({
            variantId: item.variantId,
            quantity: 1,
            countryCode: "bd",
          })
        }
      }
      setIsAdded(true)
      // Broadcast cart event
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:item-added"))
      }
      setTimeout(() => setIsAdded(false), 3000)
    } catch (err) {
      console.error("Bundle add error:", err)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <section className="w-full py-8 sm:py-12 bg-amber-500/5 dark:bg-zinc-900/40 border-y border-amber-200/50 dark:border-zinc-800">
      <div className="content-container">
        <div className="max-w-4xl mx-auto rounded-3xl bg-white dark:bg-zinc-900 border border-amber-200 dark:border-amber-900/60 p-5 sm:p-8 shadow-xl">
          {/* Header */}
          <div className="text-center max-w-xl mx-auto space-y-2 mb-8">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-600 text-white shadow-xs">
              <Gift className="w-3.5 h-3.5" />
              {discountBadge}
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-100">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              {subtitle}
            </p>
          </div>

          {/* Bundle Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
            {items.map((prod, idx) => (
              <div
                key={prod.id}
                className="relative flex items-center gap-3 sm:flex-col sm:text-center p-3 sm:p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-850 border border-zinc-200/80 dark:border-zinc-800"
              >
                <div className="w-16 h-16 sm:w-24 sm:h-24 relative rounded-xl overflow-hidden bg-white shrink-0 p-1">
                  <Image
                    src={prod.thumbnail || "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"}
                    alt={prod.title}
                    fill
                    className="object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400 block mb-0.5">
                    আইটেম #{idx + 1}
                  </span>
                  <h4 className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 truncate">
                    {prod.title}
                  </h4>
                  <span className="text-xs text-zinc-500 font-medium">
                    {prod.weight || "১ কেজি"}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Pricing & Order Card */}
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 dark:from-zinc-850 dark:to-zinc-800 rounded-2xl p-4 sm:p-6 border border-amber-200/80 dark:border-zinc-700 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-center sm:text-left">
              <div className="flex items-baseline justify-center sm:justify-start gap-2">
                <span className="text-2xl sm:text-3xl font-black text-amber-700 dark:text-amber-400">
                  {formatPrice(calcCombo)}
                </span>
                <span className="text-sm sm:text-base text-zinc-400 line-through">
                  {formatPrice(calcOriginal)}
                </span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md">
                  সাশ্রয় {formatPrice(savings)}!
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 font-medium">
                {freeGiftNote}
              </p>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={handleAddBundle}
              disabled={isAdding}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-orange-500 hover:bg-orange-600 active:scale-95 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              {isAdding ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span>কার্টে যোগ হচ্ছে...</span>
                </>
              ) : isAdded ? (
                <>
                  <CheckCircle2 className="w-5 h-5 text-white" />
                  <span>কম্বো কার্টে যোগ হয়েছে!</span>
                </>
              ) : (
                <>
                  <ShoppingCart className="w-5 h-5" />
                  <span>সম্পূর্ণ কম্বো কার্টে যোগ করুন</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
