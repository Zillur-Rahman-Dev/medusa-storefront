"use client"

import { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

const naturalHoneyProducts: HoneyProductItem[] = [
  {
    id: "nat-1",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "black-seed-flower-honey",
    variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    regularPrice: 1250,
    rating: 5,
    reviewCount: 68,
    icon: "🌿",
    badge: "১২% ছাড়",
  },
  {
    id: "nat-2",
    title: "লিচু ফুলের মিষ্টি মধু",
    handle: "litchi-flower-honey",
    variantId: "variant_01M6T7Q2TTB94FMQ7H2V3YWEDV",
    weight: "১ কেজি কাচের জার",
    price: 950,
    regularPrice: 1100,
    rating: 5,
    reviewCount: 54,
    icon: "🍯",
    badge: "১৪% ছাড়",
  },
  {
    id: "nat-3",
    title: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
    handle: "wild-sundarban-forest-honey",
    variantId: "variant_01M6T7QCP8C5N2HWG0JD2DBWJD",
    weight: "১ কেজি কাচের জার",
    price: 1250,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 47,
    icon: "🌳",
    badge: "সেরা বিক্রি",
  },
  {
    id: "nat-4",
    title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু",
    handle: "sundarban-kholisha-honey",
    variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
    weight: "১ কেজি কাচের জার",
    price: 1350,
    regularPrice: 1550,
    rating: 5,
    reviewCount: 82,
    icon: "🌸",
    badge: "নতুন মধু",
  },
  {
    id: "nat-5",
    title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
    handle: "mustard-flower-honey",
    variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
    weight: "১ কেজি কাচের জার",
    price: 750,
    regularPrice: 850,
    rating: 5,
    reviewCount: 96,
    icon: "🌼",
    badge: "১২% ছাড়",
  },
  {
    id: "nat-6",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "hill-wild-honey",
    variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
    weight: "১ কেজি কাচের জার",
    price: 1200,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 46,
    icon: "⛰️",
    badge: "বিশেষ বাছাই",
  },
  {
    id: "nat-7",
    title: "ধনে ফুলের সুবাসিত মধু",
    handle: "coriander-flower-honey",
    variantId: "variant_01M6T7Q5EXN9XCHW9K53SAD4KT",
    weight: "১ কেজি কাচের জার",
    price: 980,
    regularPrice: 1150,
    rating: 5,
    reviewCount: 39,
    icon: "🌱",
    badge: "১০০% খাঁটি",
  },
  {
    id: "nat-8",
    title: "বাবলা ও কুল (বরই) ফুলের মধু",
    handle: "babla-kool-flower-honey",
    variantId: "variant_01M6T7Q95Z9P7TAKDJZB8C05PY",
    weight: "১ কেজি কাচের জার",
    price: 950,
    regularPrice: 1100,
    rating: 5,
    reviewCount: 35,
    icon: "🍒",
    badge: "১৪% ছাড়",
  },
]

export default function NaturalHoneySlider() {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const totalDots = 5 // Exactly 5 pagination dots matching reference screenshot: o o [===] o o

  // Auto-slide every 3.5 seconds with pause-on-hover
  useEffect(() => {
    if (isPaused) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= totalDots - 1 ? 0 : prev + 1))
    }, 3500)

    return () => clearInterval(timer)
  }, [isPaused, totalDots])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? totalDots - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= totalDots - 1 ? 0 : prev + 1))
  }

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header matching exact user screenshot */}
        <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold mb-1">
              প্রকৃতির সেরা উপহার
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
              ১০০% খাঁটি ও প্রাকৃতিক মধু
            </h2>
            <div className="w-14 h-1 bg-amber-500 rounded-full mt-2" />
          </div>

          {/* VIEW ALL ITEMS -> Link matching screenshot */}
          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 uppercase tracking-wider transition-colors"
          >
            <span>সকল মধু দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* Carousel Slider Container */}
        <div
          className="relative group/slider"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Navigation Arrows (Visible on Desktop / Hover) */}
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous slide"
            className="absolute -left-3 sm:-left-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md text-zinc-700 dark:text-zinc-200 hover:text-amber-600 hover:border-amber-500 flex items-center justify-center transition-all opacity-80 group-hover/slider:opacity-100 hover:scale-105"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={handleNext}
            aria-label="Next slide"
            className="absolute -right-3 sm:-right-5 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-md text-zinc-700 dark:text-zinc-200 hover:text-amber-600 hover:border-amber-500 flex items-center justify-center transition-all opacity-80 group-hover/slider:opacity-100 hover:scale-105"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Carousel Track with Responsive Items Per View */}
          <div className="overflow-hidden py-2 -mx-2 px-2">
            <div
              className="flex transition-transform duration-500 ease-out [--items-per-view:1] sm:[--items-per-view:2] md:[--items-per-view:3] lg:[--items-per-view:4]"
              style={{
                transform: `translateX(calc(-1 * ${currentIndex} * (100% / var(--items-per-view))))`,
              }}
            >
              {naturalHoneyProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="w-full sm:w-1/2 md:w-1/3 lg:w-1/4 shrink-0 px-2 sm:px-3"
                >
                  <HoneyProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Pagination Dots matching screenshot: o o [===] o o */}
          <div className="mt-8 flex items-center justify-center gap-2">
            {[...Array(totalDots)].map((_, dotIdx) => {
              const isActive = dotIdx === currentIndex
              return (
                <button
                  key={dotIdx}
                  type="button"
                  onClick={() => setCurrentIndex(dotIdx)}
                  aria-label={`Go to slide ${dotIdx + 1}`}
                  className={`transition-all duration-300 ${
                    isActive
                      ? "w-8 h-2.5 rounded-full bg-amber-500 shadow-sm"
                      : "w-2.5 h-2.5 rounded-full border-2 border-amber-500 bg-transparent hover:bg-amber-400/20"
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}
