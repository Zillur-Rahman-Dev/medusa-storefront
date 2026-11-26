"use client"

import React from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Calendar, Truck, ArrowRight, ShieldCheck } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type PreOrderBannerProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
  harvestDate?: string
  benefitBadge?: string
}

export default function PreOrderBanner({
  products = [],
  title = "নতুন মৌসুমের তাজা খলিশা মধু: প্রি-অর্ডার চলছে!",
  subtitle = "সুন্দরবনের প্রথম মৌসুমের তাজা কাঁচা মধু বুকিং করুন। সীমিত পরিমাণ সংগ্রহ করা হয়, স্টক শেষ হওয়ার আগেই অর্ডার নিশ্চিত করুন।",
  harvestDate = "ডেলিভারি শুরু হবে ১৫ই এপ্রিল থেকে",
  benefitBadge = "🚚 অগ্রিম অর্ডারে পাচ্ছেন সম্পূর্ণ ফ্রি হোম ডেলিভারি",
}: PreOrderBannerProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-12 bg-gradient-to-r from-emerald-950 via-zinc-900 to-amber-950 text-white border-y border-emerald-900/60">
      <div className="content-container">
        {/* Banner Announcement Top */}
        <div className="max-w-3xl mx-auto text-center space-y-3 mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
            <Calendar className="w-3.5 h-3.5" />
            <span>{harvestDate}</span>
          </div>

          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white leading-tight">
            {title}
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 max-w-xl mx-auto leading-relaxed">
            {subtitle}
          </p>

          <div className="pt-2">
            <span className="inline-block px-4 py-1.5 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-300 text-xs font-bold">
              {benefitBadge}
            </span>
          </div>
        </div>

        {/* Pre-Order Product Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {products.slice(0, 4).map((prod) => (
            <div key={prod.id} className="relative">
              <span className="absolute top-2 left-2 z-20 px-2 py-0.5 rounded-md text-[10px] font-black bg-emerald-600 text-white shadow-md">
                প্রি-অর্ডার
              </span>
              <HoneyProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
