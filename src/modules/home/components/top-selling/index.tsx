"use client"

import React, { useRef } from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

const topSellingHoneys: HoneyProductItem[] = [
  {
    id: "top-1",
    title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু",
    handle: "sundarban-kholisha-honey",
    variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
    weight: "১ কেজি কাচের জার",
    price: 1350,
    rating: 5,
    reviewCount: 64,
    icon: "🌸",
    badge: "সেরা বিক্রি",
  },
  {
    id: "top-2",
    title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
    handle: "mustard-flower-honey",
    variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
    weight: "১ কেজি কাচের জার",
    price: 750,
    rating: 5,
    reviewCount: 92,
    icon: "🌼",
    badge: "সেরা বিক্রি",
  },
  {
    id: "top-3",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "black-seed-flower-honey",
    variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    rating: 5,
    reviewCount: 58,
    icon: "🌿",
    badge: "সেরা বিক্রি",
  },
  {
    id: "top-4",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "hill-wild-honey",
    variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
    weight: "১ কেজি কাচের জার",
    price: 1200,
    rating: 5,
    reviewCount: 46,
    icon: "⛰️",
    badge: "সেরা বিক্রি",
  },
  {
    id: "top-5",
    title: "লিচু ফুলের মিষ্টি মধু",
    handle: "litchi-flower-honey",
    variantId: "variant_01M6T7Q2TTB94FMQ7H2V3YWEDV",
    weight: "১ কেজি কাচের জার",
    price: 950,
    rating: 5,
    reviewCount: 54,
    icon: "🍯",
    badge: "সেরা বিক্রি",
  },
]

type TopSellingProps = {
  products?: HoneyProductItem[]
}

export default function TopSelling({ products }: TopSellingProps) {
  const displayProducts = products && products.length > 0 ? products : topSellingHoneys
  const scrollRef = useRef<HTMLDivElement>(null)

  const handleScroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = direction === "left" ? -260 : 260
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" })
    }
  }

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header with Mobile/Tablet Arrow Navigation */}
        <div className="flex items-end justify-between mb-6 pb-2 border-b border-zinc-200 dark:border-zinc-800 lg:border-none lg:mb-8 lg:pb-0 lg:block lg:text-center">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-1">
              জনপ্রিয় পছন্দ
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              সর্বাধিক বিক্রিত সেরা মধু
            </h2>
            <div className="w-14 h-1 bg-amber-500 rounded-full mt-2 lg:mx-auto" />
          </div>

          {/* Quick Slide Navigation for Mobile & Tablet */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={() => handleScroll("left")}
              aria-label="Previous"
              className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 active:scale-95 transition-all"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => handleScroll("right")}
              aria-label="Next"
              className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 flex items-center justify-center hover:bg-amber-50 hover:text-amber-600 active:scale-95 transition-all"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Responsive Layout:
            - Desktop: Exactly 5 items in a single 5-column grid (no horizontal scroll, perfectly balanced)
            - Tablet & Mobile: Smooth horizontal swipeable row with snap (NO 2nd row on tablet or 3rd row on mobile with empty spaces!)
        */}
        <div
          ref={scrollRef}
          className="flex lg:grid lg:grid-cols-5 gap-3 sm:gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 scrollbar-none snap-x snap-mandatory -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0"
        >
          {displayProducts.slice(0, 5).map((prod) => (
            <div
              key={prod.id}
              className="w-[180px] sm:w-[220px] md:w-[240px] lg:w-auto shrink-0 snap-start"
            >
              <HoneyProductCard product={prod} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
