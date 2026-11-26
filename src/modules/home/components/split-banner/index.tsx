"use client"

import React from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Sparkles } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type SplitBannerProps = {
  products?: HoneyProductItem[]
  bannerTitle?: string
  bannerSubtitle?: string
  bannerBadge?: string
  bannerImage?: string
  buttonText?: string
  buttonHref?: string
}

export default function SplitBanner({
  products = [],
  bannerTitle = "সুন্দরবনের গভীর অরণ্যের তাজা খলিশা মধু",
  bannerSubtitle = "ম্যানগ্রোভ বনের প্রাকৃতিক মৌচাক থেকে ঐতিহ্যবাহী মৌয়ালদের হাতে সংগৃহীত ১০০% অপরিশোধিত কাঁচা মধু।",
  bannerBadge = "সুন্দরবন স্পেশাল",
  bannerImage = "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg",
  buttonText = "সুন্দরবনের মধু দেখুন",
  buttonHref = "/store",
}: SplitBannerProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-12">
      <div className="content-container">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Left Column: Visual Story / Promo Banner (5 Cols) */}
          <div className="lg:col-span-5 relative rounded-3xl overflow-hidden min-h-[320px] lg:min-h-full flex flex-col justify-end p-6 sm:p-8 text-white shadow-xl group">
            {/* Background Image */}
            <Image
              src={bannerImage}
              alt={bannerTitle}
              fill
              className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
            />
            {/* Dark Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent" />

            {/* Banner Content */}
            <div className="relative z-10 space-y-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-900 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current" />
                {bannerBadge}
              </span>
              <h3 className="text-xl sm:text-2xl lg:text-3xl font-black leading-tight drop-shadow-md">
                {bannerTitle}
              </h3>
              <p className="text-xs sm:text-sm text-zinc-200 line-clamp-3 leading-relaxed">
                {bannerSubtitle}
              </p>
              <div className="pt-2">
                <LocalizedClientLink
                  href={buttonHref}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white text-zinc-900 hover:bg-amber-400 font-bold text-xs sm:text-sm transition-all shadow-md active:scale-95"
                >
                  <span>{buttonText}</span>
                  <ArrowRight className="w-4 h-4" />
                </LocalizedClientLink>
              </div>
            </div>
          </div>

          {/* Right Column: Matching Products (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between">
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-2 gap-3 sm:gap-4 h-full">
              {products.slice(0, 4).map((product) => (
                <div key={product.id} className="h-full">
                  <HoneyProductCard product={product} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
