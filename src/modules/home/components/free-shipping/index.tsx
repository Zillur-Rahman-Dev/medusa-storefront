"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Truck, ShieldCheck, Zap, ArrowRight, Gift, CheckCircle2 } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type FreeShippingProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
  badge?: string
  thresholdText?: string
  couponCode?: string
  viewAllHref?: string
}

export default function FreeShippingPromotion({
  products = [],
  title = "সারা দেশে ফ্রি হোম ডেলিভারি অফার!",
  subtitle = "সীমিত সময়ের অফার: যেকোনো ২টি মধু অর্ডার করলেই ডেলিভারি চার্জ সম্পূর্ণ ফ্রি। কোনো হিডেন চার্জ ছাড়াই ক্যাশ অন ডেলিভারিতে নিন।",
  badge = "ফ্রি ডেলিভারি",
  thresholdText = "২টি বা তার বেশি মধু অর্ডারে",
  couponCode = "অটোমেটিক প্রযোজ্য",
  viewAllHref = "/store",
}: FreeShippingProps) {
  return (
    <section className="w-full py-8 sm:py-12 bg-gradient-to-b from-emerald-500/10 via-teal-500/5 to-transparent border-y border-emerald-200/60 dark:border-emerald-900/40">
      <div className="content-container">
        {/* Main Banner Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-6 sm:p-10 lg:p-12 shadow-xl">
          {/* Ambient Lighting */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="max-w-2xl space-y-3 sm:space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30 shadow-xs">
                <Truck className="w-4 h-4 text-amber-300 animate-bounce" />
                <span>{badge}</span>
                <span className="bg-amber-400 text-zinc-950 px-2 py-0.5 rounded-full text-[10px] font-black">
                  {thresholdText}
                </span>
              </div>

              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white leading-tight">
                {title}
              </h2>

              <p className="text-xs sm:text-sm lg:text-base text-emerald-100 leading-relaxed max-w-xl">
                {subtitle}
              </p>

              {/* Key Service Highlights */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 pt-2 text-xs font-semibold text-emerald-100">
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/15">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>💵 ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/15">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>🔒 নিরাপদ গ্লাস জার প্যাকিং</span>
                </div>
                <div className="flex items-center gap-1.5 bg-white/10 backdrop-blur-xs px-2.5 py-1.5 rounded-xl border border-white/15 col-span-2 sm:col-span-1">
                  <Zap className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>⚡ ৪৮ ঘণ্টায় দ্রুত ডেলিভারি</span>
                </div>
              </div>
            </div>

            {/* Action Box */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-3.5 shrink-0">
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-amber-400 text-zinc-950 flex items-center justify-center font-black">
                  <Gift className="w-5 h-5 text-zinc-900" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-emerald-200 font-bold">
                    ডেলিভারি চার্জ
                  </div>
                  <div className="text-base sm:text-lg font-mono font-black text-white">
                    ৳০ (একদম ফ্রি)
                  </div>
                  <div className="text-[10px] text-emerald-200 font-medium">
                    {couponCode}
                  </div>
                </div>
              </div>

              <LocalizedClientLink
                href={viewAllHref}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-bold text-xs sm:text-sm bg-amber-400 hover:bg-amber-300 text-zinc-950 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-95 cursor-pointer"
              >
                <span>অফারটি এখনই উপভোগ করুন</span>
                <ArrowRight className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>

        {/* Featured Eligible Products Grid (if products are present) */}
        {products && products.length > 0 && (
          <div className="mt-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                <Truck className="w-4 h-4 text-emerald-600" />
                <span>ফ্রি ডেলিভারি অফারের জনপ্রিয় মধুসমূহ</span>
              </h3>
              {viewAllHref && (
                <LocalizedClientLink
                  href={viewAllHref}
                  className="text-xs font-bold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
                >
                  <span>সব দেখুন</span>
                  <ArrowRight className="w-3 h-3" />
                </LocalizedClientLink>
              )}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="relative group">
                  <HoneyProductCard product={product} />
                  <div className="absolute top-2 right-2 z-10">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white shadow-xs">
                      <Truck className="w-2.5 h-2.5" />
                      ফ্রি শিপিং
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
