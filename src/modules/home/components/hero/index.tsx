"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface Slide {
  id: number
  image: string
  alt: string
  link: string
}

const slides: Slide[] = [
  {
    id: 1,
    image: "/images/hero/slider-kalijira-clean.jpg",
    alt: "১ কেজি হানিরাজ কালিজিরার ফুলের মধুর সাথে লিচু ফ্লাওয়ার হানি স্যাশে বক্স ফ্রি",
    link: "/products/black-seed-flower-honey",
  },
  {
    id: 2,
    image: "/images/hero/slider-sundarban.jpg",
    alt: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু - ১০০% প্রাকৃতিক কাঁচা মধু",
    link: "/products/sundarban-kholisha-honey",
  },
  {
    id: 3,
    image: "/images/hero/slider-mustard.jpg",
    alt: "সরিষা ও লিচু ফুলের প্রাকৃতিক মধু - পুষ্টি ও স্বাস্থ্য সুরক্ষায় সেরা",
    link: "/products/mustard-flower-honey",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Auto-play timer (5 seconds) with smooth horizontal slide
  useEffect(() => {
    if (isPaused) return
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [isPaused])

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  // Touch Swipe handlers for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.targetTouches[0].clientX
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX
  }

  const handleTouchEnd = () => {
    if (!touchStartX.current || !touchEndX.current) return
    const diff = touchStartX.current - touchEndX.current
    if (diff > 45) {
      nextSlide() // Swiped left -> Glide to Next
    } else if (diff < -45) {
      prevSlide() // Swiped right -> Glide to Prev
    }
    touchStartX.current = null
    touchEndX.current = null
  }

  return (
    <section className="py-2.5 sm:py-4 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Exact Layout Matching Screenshot: 2-Column Grid (Slider ~2/3 + Promo ~1/3) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 sm:gap-4 items-stretch">
          {/* ======================================================== */}
          {/* LEFT COLUMN: Pure Image Slider with Smooth Horizontal    */}
          {/* Slide Animation (8 Cols)                                 */}
          {/* ======================================================== */}
          <div
            className="lg:col-span-8 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 group select-none flex flex-col justify-center"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Aspect Ratio Container for Slider */}
            <div className="relative w-full aspect-[618/246] min-h-[175px] sm:min-h-[240px] lg:min-h-[260px] overflow-hidden">
              {/* Smooth Sliding Flex Track (Moves horizontally without blinking) */}
              <div
                className="flex h-full w-full transition-transform duration-700 ease-out will-change-transform"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {slides.map((slide, idx) => (
                  <div
                    key={slide.id}
                    className="w-full h-full shrink-0 relative"
                  >
                    <LocalizedClientLink
                      href={slide.link}
                      className="block relative w-full h-full cursor-pointer"
                    >
                      <Image
                        src={slide.image}
                        alt={slide.alt}
                        fill
                        priority={idx === 0}
                        className="object-cover object-center select-none"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                      />
                    </LocalizedClientLink>
                  </div>
                ))}
              </div>

              {/* Prev Navigation Arrow Button (Glide to left slide) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  prevSlide()
                }}
                aria-label="Previous Slide"
                className="absolute left-2 sm:left-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/95 hover:bg-white text-amber-600 rounded-md sm:rounded-lg shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-amber-100/80 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 stroke-[2.5]" />
              </button>

              {/* Next Navigation Arrow Button (Glide to right slide) */}
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  nextSlide()
                }}
                aria-label="Next Slide"
                className="absolute right-2 sm:right-3.5 top-1/2 -translate-y-1/2 z-20 w-7 h-7 sm:w-9 sm:h-9 bg-white/95 hover:bg-white text-amber-600 rounded-md sm:rounded-lg shadow-md flex items-center justify-center transition-all hover:scale-105 active:scale-95 border border-amber-100/80 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 stroke-[2.5]" />
              </button>

              {/* Bottom-Left Indicator Dots */}
              <div className="absolute bottom-2.5 sm:bottom-3.5 left-3 sm:left-4 z-20 flex items-center gap-1 sm:gap-1.5">
                {slides.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setCurrentSlide(i)
                    }}
                    aria-label={`Go to slide ${i + 1}`}
                    className={`h-1.5 sm:h-2 rounded-full transition-all duration-300 ${
                      i === currentSlide
                        ? "w-4 sm:w-5 bg-amber-500 shadow-xs"
                        : "w-1.5 sm:w-2 bg-white/70 hover:bg-white shadow-xs"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* ======================================================== */}
          {/* RIGHT COLUMN: Static Promo / Combo Offer Card (4 Cols)  */}
          {/* ======================================================== */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-2xl sm:rounded-3xl shadow-sm border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-zinc-900 group">
            <LocalizedClientLink
              href="/store"
              className="block relative w-full h-full aspect-[292/246] lg:aspect-auto min-h-[175px] sm:min-h-[240px] lg:min-h-[260px] overflow-hidden cursor-pointer"
            >
              <Image
                src="/images/hero/promo-combo-clean.jpg"
                alt="মধু স্পেশাল কম্বোপ্যাক-এ ৳১০০ ছাড়!"
                fill
                priority
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500 ease-out"
                sizes="(max-width: 1024px) 100vw, 34vw"
              />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
