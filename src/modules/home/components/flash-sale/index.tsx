"use client"

import React, { useState, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Clock, Zap, ArrowRight, Flame } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type FlashSaleProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
  badge?: string
  countdownEnd?: string
  viewAllHref?: string
}

export default function FlashSale({
  products = [],
  title = "রমজান স্পেশাল ফ্ল্যাশ সেল!",
  subtitle = "সীমিত সময়ের জন্য বাছাইকৃত খাঁটি মধুতে অবিশ্বাস্য ছাড়",
  badge = "ফ্ল্যাশ ডিল",
  countdownEnd,
  viewAllHref = "/store",
}: FlashSaleProps) {
  // 12-hour default countdown if not provided
  const targetTime = countdownEnd
    ? new Date(countdownEnd).getTime()
    : Date.now() + 1000 * 60 * 60 * 12

  const [timeLeft, setTimeLeft] = useState({
    hours: 11,
    minutes: 45,
    seconds: 30,
  })

  useEffect(() => {
    const updateCountdown = () => {
      const difference = targetTime - Date.now()
      if (difference <= 0) {
        setTimeLeft({ hours: 0, minutes: 0, seconds: 0 })
        return
      }

      const hours = Math.floor(difference / (1000 * 60 * 60))
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((difference % (1000 * 60)) / 1000)

      setTimeLeft({ hours, minutes, seconds })
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)
    return () => clearInterval(interval)
  }, [targetTime])

  const formatDigit = (n: number) => {
    const str = String(n).padStart(2, "0")
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"]
    return str.replace(/\d/g, (d) => bnDigits[parseInt(d)])
  }

  if (!products || products.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-12 bg-gradient-to-b from-amber-500/10 via-orange-500/5 to-transparent border-y border-amber-200/60 dark:border-amber-900/40">
      <div className="content-container">
        {/* Header with Title and Countdown Timer */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-amber-200/70 dark:border-amber-900/50">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-600 text-white shadow-xs animate-pulse">
                <Flame className="w-3.5 h-3.5 fill-current" />
                {badge}
              </span>
              <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">
                সীমিত সময়ের অফার
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <span>⚡</span> {title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-1">
              {subtitle}
            </p>
          </div>

          {/* Countdown Clock Display */}
          <div className="flex items-center gap-2 bg-white dark:bg-zinc-900 p-2 sm:p-2.5 rounded-2xl border border-red-200 dark:border-red-900/60 shadow-sm self-start md:self-auto">
            <Clock className="w-4 h-4 text-red-600 animate-spin-slow shrink-0" />
            <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">অফার শেষ হতে:</span>
            <div className="flex items-center gap-1 font-mono font-black text-sm sm:text-base text-white">
              <span className="px-2 py-1 bg-red-600 rounded-lg shadow-2xs">
                {formatDigit(timeLeft.hours)}
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">:</span>
              <span className="px-2 py-1 bg-red-600 rounded-lg shadow-2xs">
                {formatDigit(timeLeft.minutes)}
              </span>
              <span className="text-red-600 dark:text-red-400 font-bold">:</span>
              <span className="px-2 py-1 bg-red-600 rounded-lg shadow-2xs">
                {formatDigit(timeLeft.seconds)}
              </span>
            </div>
          </div>
        </div>

        {/* Product Cards Row */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5 mt-6">
          {products.slice(0, 4).map((product) => (
            <div key={product.id} className="relative group">
              <HoneyProductCard product={product} />
              {/* Urgency Stock Bar */}
              <div className="mt-2 px-1">
                <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-500 mb-1">
                  <span>স্টক সীমিত</span>
                  <span className="text-red-600 font-bold">৮০% শেষ</span>
                </div>
                <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-red-500 rounded-full w-4/5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {viewAllHref && (
          <div className="mt-6 text-center">
            <LocalizedClientLink
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-700 dark:text-amber-400 hover:text-amber-800 transition-colors"
            >
              <span>ফ্ল্যাশ সেলের সব মধু দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>
          </div>
        )}
      </div>
    </section>
  )
}
