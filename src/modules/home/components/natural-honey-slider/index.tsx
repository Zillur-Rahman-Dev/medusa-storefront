"use client"

import { useState, useEffect, useRef } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

const naturalHoneyProducts: HoneyProductItem[] = [
  {
    id: "nat-1",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "black-seed-flower-honey",
    variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    rating: 5,
    reviewCount: 68,
    icon: "🌿",
    badge: "ঔষধি মধু",
  },
  {
    id: "nat-2",
    title: "লিচু ফুলের মিষ্টি মধু",
    handle: "litchi-flower-honey",
    variantId: "variant_01M6T7Q2TTB94FMQ7H2V3YWEDV",
    weight: "১ কেজি কাচের জার",
    price: 950,
    rating: 5,
    reviewCount: 54,
    icon: "🍯",
    badge: "প্রাকৃতিক",
  },
  {
    id: "nat-3",
    title: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
    handle: "wild-sundarban-forest-honey",
    variantId: "variant_01M6T7QCP8C5N2HWG0JD2DBWJD",
    weight: "১ কেজি কাচের জার",
    price: 1250,
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
    rating: 5,
    reviewCount: 96,
    icon: "🌼",
    badge: "জনপ্রিয়",
  },
  {
    id: "nat-6",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "hill-wild-honey",
    variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
    weight: "১ কেজি কাচের জার",
    price: 1200,
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
    rating: 5,
    reviewCount: 31,
    icon: "🐝",
    badge: "মৌসুমী মধু",
  },
]

type NaturalHoneySliderProps = {
  products?: HoneyProductItem[]
}

export default function NaturalHoneySlider({ products }: NaturalHoneySliderProps) {
  const displayProducts = products && products.length > 0 ? products : naturalHoneyProducts
  const [currentIndex, setCurrentIndex] = useState(0)
  const [itemsPerView, setItemsPerView] = useState(5)

  // Drag & Swipe states
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const startXRef = useRef(0)
  const isMouseDownRef = useRef(false)
  const hasMovedRef = useRef(false)

  useEffect(() => {
    const updateItemsPerView = () => {
      if (typeof window === "undefined") return
      if (window.innerWidth >= 1024) {
        setItemsPerView(5)
      } else if (window.innerWidth >= 768) {
        setItemsPerView(3)
      } else {
        setItemsPerView(2)
      }
    }
    updateItemsPerView()
    window.addEventListener("resize", updateItemsPerView)
    return () => window.removeEventListener("resize", updateItemsPerView)
  }, [])

  const maxIndex = Math.max(0, displayProducts.length - itemsPerView)
  const totalDots = Math.min(maxIndex + 1, 6)

  // Clamp currentIndex if out of bounds on viewport resize
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(maxIndex)
    }
  }, [maxIndex, currentIndex])

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
  }

  // Smooth Auto-slide every 3.5 seconds (only pauses during active drag)
  useEffect(() => {
    if (isDragging || maxIndex <= 0) return

    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1))
    }, 3500)

    return () => clearInterval(timer)
  }, [isDragging, maxIndex])

  // Touch Swipe handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDragging(true)
    startXRef.current = e.touches[0].clientX
    setDragOffset(0)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging) return
    const diff = e.touches[0].clientX - startXRef.current
    setDragOffset(diff)
  }

  const handleTouchEnd = () => {
    if (!isDragging) return
    setIsDragging(false)
    if (dragOffset < -40) {
      handleNext()
    } else if (dragOffset > 40) {
      handlePrev()
    }
    setDragOffset(0)
  }

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    isMouseDownRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.clientX
    setDragOffset(0)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMouseDownRef.current) return
    const diff = e.clientX - startXRef.current
    if (Math.abs(diff) > 5) {
      hasMovedRef.current = true
      setIsDragging(true)
      setDragOffset(diff)
    }
  }

  const handleMouseUp = () => {
    if (!isMouseDownRef.current) return
    isMouseDownRef.current = false
    if (hasMovedRef.current) {
      if (dragOffset < -40) {
        handleNext()
      } else if (dragOffset > 40) {
        handlePrev()
      }
    }
    setIsDragging(false)
    setDragOffset(0)
    hasMovedRef.current = false
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

        {/* Carousel Slider Container (Side buttons removed - Drag & Auto-slide enabled) */}
        <div className="relative">
          {/* Carousel Track with Mouse Drag & Touch Swipe */}
          <div
            className="overflow-hidden py-2 -mx-1.5 sm:-mx-2 px-1.5 sm:px-2 cursor-grab active:cursor-grabbing select-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className={`flex ease-out [--items-per-view:2] sm:[--items-per-view:2] md:[--items-per-view:3] lg:[--items-per-view:5] xl:[--items-per-view:5] ${
                isDragging ? "transition-none" : "transition-transform duration-500"
              }`}
              style={{
                transform: `translateX(calc(-1 * ${currentIndex} * (100% / var(--items-per-view)) + ${dragOffset}px))`,
              }}
            >
              {displayProducts.map((prod) => (
                <div
                  key={prod.id}
                  className="w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/5 xl:w-1/5 shrink-0 px-1.5 sm:px-2"
                >
                  <HoneyProductCard product={prod} />
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Pagination Dots (Preserved below products) */}
          {totalDots > 1 && (
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
          )}
        </div>
      </div>
    </section>
  )
}
