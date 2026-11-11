"use client"

import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react"

interface Slide {
  id: number
  type: "image" | "banner"
  image?: string
  alt?: string
  link: string
  badge?: string
  title?: string
  subtitle?: string
  desc?: string
  ctaText?: string
  tag?: string
  bgGradient?: string
}

const slides: Slide[] = [
  {
    id: 1,
    type: "image",
    image: "/images/hero/slider-kalijira-clean.jpg",
    alt: "১ কেজি হানিরাজ কালিজিরার ফুলের মধুর সাথে লিচু ফ্লাওয়ার হানি স্যাশে বক্স ফ্রি",
    link: "/store",
  },
  {
    id: 2,
    type: "banner",
    badge: "সুন্দরবনের শতভাগ প্রাকৃতিক",
    title: "খাঁটি খলিশা ফুলের মধু",
    subtitle: "প্রাকৃতিক রোগ প্রতিরোধ ক্ষমতা ও শক্তি বৃদ্ধির মহৌষধ",
    desc: "সুন্দরবনের গভীর ম্যানগ্রোভের বুনো মৌচাক থেকে সংগৃহীত। কোনো হিটিং, প্রসেসিং বা চিনি ছাড়া শতভাগ কাঁচা মধু।",
    ctaText: "এখনই কিনুন",
    link: "/store",
    tag: "সীমিত সময়ের অফার",
    bgGradient: "from-amber-600 via-amber-500 to-amber-700",
  },
  {
    id: 3,
    type: "banner",
    badge: "হানিরাজ সেরা কম্বো প্যাক",
    title: "৩টি ভিন্ন স্বাদের মধু একসাথে",
    subtitle: "সুন্দরবন + কালোজিরা + সরিষা ফুল",
    desc: "পরিবারের পুষ্টি ও সুস্বাস্থ্যের জন্য প্রতিদিন এক চামচ খাঁটি প্রাকৃতিক মধু পৌঁছে দিচ্ছি সারা বাংলাদেশে।",
    ctaText: "কম্বো অফার দেখুন",
    link: "/store",
    tag: "বিশেষ ছাড়",
    bgGradient: "from-orange-600 via-amber-600 to-amber-700",
  },
]

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
  const touchStartX = useRef<number | null>(null)
  const touchEndX = useRef<number | null>(null)

  // Auto-play timer (5 seconds)
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
    if (diff > 50) {
      nextSlide() // Swiped left -> Next
    } else if (diff < -50) {
      prevSlide() // Swiped right -> Prev
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
          {/* LEFT COLUMN: Main Slider / Carousel (8 Cols)            */}
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
              {slides.map((slide, idx) => (
                <div
                  key={slide.id}
                  className={`absolute inset-0 w-full h-full transition-opacity duration-500 ease-in-out ${
                    idx === currentSlide
                      ? "opacity-100 z-10 pointer-events-auto"
                      : "opacity-0 z-0 pointer-events-none"
                  }`}
                >
                  <LocalizedClientLink
                    href={slide.link}
                    className="block relative w-full h-full cursor-pointer"
                  >
                    {slide.type === "image" && slide.image ? (
                      <div className="relative w-full h-full">
                        <Image
                          src={slide.image}
                          alt={slide.alt || "Honey Banner"}
                          fill
                          priority={idx === 0}
                          className="object-cover object-center"
                          sizes="(max-width: 1024px) 100vw, 66vw"
                        />
                      </div>
                    ) : (
                      /* Rich Styled Banner Slide */
                      <div
                        className={`relative w-full h-full bg-gradient-to-r ${slide.bgGradient} text-white p-4 sm:p-8 lg:p-10 flex flex-col justify-between overflow-hidden`}
                      >
                        {/* Ambient Glow Orbs */}
                        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 rounded-full bg-white/20 blur-3xl pointer-events-none" />
                        <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 rounded-full bg-black/15 blur-2xl pointer-events-none" />

                        <div className="relative z-10 max-w-lg space-y-2 sm:space-y-3">
                          {slide.badge && (
                            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-black bg-white/25 backdrop-blur-md text-white border border-white/40">
                              <Sparkles className="w-3 h-3 text-amber-200" />
                              <span>{slide.badge}</span>
                            </div>
                          )}

                          <h2 className="text-xl sm:text-3xl lg:text-4xl font-black tracking-tight leading-tight text-white drop-shadow-sm">
                            {slide.title}
                          </h2>

                          {slide.subtitle && (
                            <p className="text-xs sm:text-base font-bold text-amber-100">
                              {slide.subtitle}
                            </p>
                          )}

                          {slide.desc && (
                            <p className="hidden sm:block text-xs sm:text-sm text-amber-50/90 leading-relaxed max-w-md">
                              {slide.desc}
                            </p>
                          )}
                        </div>

                        {/* CTA Button */}
                        <div className="relative z-10 pt-2 flex items-center gap-3">
                          <span className="inline-flex items-center gap-1.5 py-1.5 sm:py-2.5 px-3.5 sm:px-6 rounded-xl sm:rounded-2xl font-black text-xs sm:text-sm bg-zinc-950 text-white hover:bg-zinc-800 shadow-md transition-all active:scale-95">
                            <span>{slide.ctaText || "অর্ডার করুন"}</span>
                            <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                          </span>

                          {slide.tag && (
                            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-100 bg-black/15 px-2.5 py-1 rounded-lg">
                              <CheckCircle2 className="w-3.5 h-3.5 text-amber-300" />
                              {slide.tag}
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                  </LocalizedClientLink>
                </div>
              ))}

              {/* Prev Navigation Arrow Button (Styled matching screenshot: White pill/square with orange arrow) */}
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

              {/* Next Navigation Arrow Button (Styled matching screenshot: White pill/square with orange arrow) */}
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

              {/* Bottom-Left Indicator Dots (Styled matching screenshot: Active orange pill, inactive dots) */}
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
