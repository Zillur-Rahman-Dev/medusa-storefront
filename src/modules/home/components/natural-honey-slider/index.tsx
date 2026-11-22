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
  viewAllHref?: string
}

export default function NaturalHoneySlider({
  products,
  viewAllHref = "/collections/featured-honey",
}: NaturalHoneySliderProps) {
  const displayProducts = products && products.length > 0 ? products : naturalHoneyProducts
  const sliderRef = useRef<HTMLDivElement>(null)
  const [itemsPerView, setItemsPerView] = useState(5)
  const [activeDot, setActiveDot] = useState(0)
  const [isInteracting, setIsInteracting] = useState(false)

  // Mouse Drag state (Rock-solid scrollLeft clamping)
  const isDownRef = useRef(false)
  const startXRef = useRef(0)
  const scrollLeftRef = useRef(0)
  const hasMovedRef = useRef(false)

  // Responsive itemsPerView
  useEffect(() => {
    const update = () => {
      if (typeof window === "undefined") return
      if (window.innerWidth >= 1024) setItemsPerView(5)
      else if (window.innerWidth >= 768) setItemsPerView(3)
      else setItemsPerView(2)
    }
    update()
    window.addEventListener("resize", update)
    return () => window.removeEventListener("resize", update)
  }, [])

  const maxIndex = Math.max(0, displayProducts.length - itemsPerView)
  const totalDots = maxIndex > 0 ? Math.min(maxIndex + 1, 6) : 0

  // Track active dot on scroll
  const handleScroll = () => {
    if (!sliderRef.current || totalDots <= 1) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    const maxScroll = scrollWidth - clientWidth
    if (maxScroll <= 0) return

    const progress = Math.max(0, Math.min(1, scrollLeft / maxScroll))
    const currentDot = Math.min(Math.round(progress * (totalDots - 1)), totalDots - 1)
    setActiveDot(currentDot)
  }

  // Scroll to dot
  const scrollToDot = (dotIdx: number) => {
    if (!sliderRef.current || totalDots <= 1) return
    const { scrollWidth, clientWidth } = sliderRef.current
    const maxScroll = scrollWidth - clientWidth
    const targetScroll = (dotIdx / (totalDots - 1)) * maxScroll
    sliderRef.current.scrollTo({ left: targetScroll, behavior: "smooth" })
  }

  // Continuous Auto-slide every 3.5 seconds
  useEffect(() => {
    if (isInteracting || maxIndex <= 0) return

    const timer = setInterval(() => {
      if (!sliderRef.current) return
      const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
      const maxScroll = scrollWidth - clientWidth
      if (maxScroll <= 10) return // All items visible on desktop, no need to scroll

      const cardWidth = clientWidth / itemsPerView
      let nextLeft = scrollLeft + cardWidth
      if (nextLeft >= maxScroll - 5) {
        nextLeft = 0 // loop back smoothly
      }
      sliderRef.current.scrollTo({ left: nextLeft, behavior: "smooth" })
    }, 3500)

    return () => clearInterval(timer)
  }, [isInteracting, maxIndex, itemsPerView])

  // Mouse Drag handlers
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!sliderRef.current) return
    isDownRef.current = true
    hasMovedRef.current = false
    startXRef.current = e.pageX - sliderRef.current.offsetLeft
    scrollLeftRef.current = sliderRef.current.scrollLeft
    setIsInteracting(true)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDownRef.current || !sliderRef.current) return
    const x = e.pageX - sliderRef.current.offsetLeft
    const walk = (x - startXRef.current) * 1.4 // natural drag multiplier
    if (Math.abs(walk) > 4) {
      hasMovedRef.current = true
      sliderRef.current.scrollLeft = scrollLeftRef.current - walk
    }
  }

  const handleMouseUp = () => {
    if (!isDownRef.current) return
    isDownRef.current = false
    setTimeout(() => {
      setIsInteracting(false)
      hasMovedRef.current = false
    }, 2000)
  }

  // Touch Swipe handlers
  const handleTouchStart = () => {
    setIsInteracting(true)
  }

  const handleTouchEnd = () => {
    setTimeout(() => {
      setIsInteracting(false)
    }, 2000)
  }

  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header */}
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

          <LocalizedClientLink
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 uppercase tracking-wider transition-colors"
          >
            <span>সকল মধু দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* Carousel Slider Container (Side buttons removed - Drag & Auto-slide enabled) */}
        <div className="relative">
          {/* Scroll Container: Bounded strictly by browser (never shifts or leaves empty blank spaces!) */}
          <div
            ref={sliderRef}
            onScroll={handleScroll}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchEnd={handleTouchEnd}
            className="flex overflow-x-auto scrollbar-none no-scrollbar py-2 -mx-1.5 sm:-mx-2 px-1.5 sm:px-2 select-none cursor-grab active:cursor-grabbing snap-x snap-mandatory scroll-smooth"
            style={{
              WebkitOverflowScrolling: "touch",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            {displayProducts.map((prod) => (
              <div
                key={prod.id}
                className="w-1/2 sm:w-1/2 md:w-1/3 lg:w-1/5 shrink-0 px-1.5 sm:px-2 snap-start"
              >
                <HoneyProductCard product={prod} />
              </div>
            ))}
          </div>

          {/* Bottom Pagination Dots (Preserved below products) */}
          {totalDots > 1 && (
            <div className="mt-8 flex items-center justify-center gap-2">
              {[...Array(totalDots)].map((_, dotIdx) => {
                const isActive = dotIdx === activeDot
                return (
                  <button
                    key={dotIdx}
                    type="button"
                    onClick={() => scrollToDot(dotIdx)}
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
