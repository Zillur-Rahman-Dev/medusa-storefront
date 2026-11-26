"use client"

import React from "react"
import { Compass, Filter, ShieldCheck, Truck, Sparkles } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type HarvestJourneyProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
}

const STEPS = [
  {
    step: "০১",
    title: "বুনো মৌচাক থেকে সংগ্রহ",
    desc: "সুন্দরবনের গভীর ম্যানগ্রোভ ও গ্রামবাংলার মৌয়ালদের হাত দিয়ে সনাতন পদ্ধতিতে মৌমাছি রক্ষা করে মধু সংগ্রহ।",
    icon: Compass,
    color: "bg-amber-500",
  },
  {
    step: "০২",
    title: "আনহিটেড কোল্ড ফিল্টার",
    desc: "কোনো প্রকার গরম বা প্রসেস না করে প্রাকৃতিক সূক্ষ্ম কাপড়ে ঠান্ডা ছেঁকে পরাগ ও এনজাইম অটুট রাখা হয়।",
    icon: Filter,
    color: "bg-emerald-600",
  },
  {
    step: "০৩",
    title: "বায়ুরোধী কাচের জারে সিল",
    desc: "প্লাস্টিকের ক্ষতিকর কেমিক্যাল এড়াতে নিরাপদ ফুড-গ্রেড এয়ার-টাইট কাচের জারে যত্নসহকারে সিল করা হয়।",
    icon: ShieldCheck,
    color: "bg-blue-600",
  },
  {
    step: "০৪",
    title: "দরজায় নিরাপদ ডেলিভারি",
    desc: "বাবল র‍্যাপ ও মজবুত প্যাকেজিংয়ে সারা বাংলাদেশে দ্রুততম হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি।",
    icon: Truck,
    color: "bg-orange-500",
  },
]

export default function HarvestJourney({
  products = [],
  title = "মৌচাক থেকে আপনার খাবার টেবিল: ৪টি স্বচ্ছ ধাপ",
  subtitle = "আমরা কীভাবে শতভাগ খাঁটি ও কাঁচা মধু আপনার কাছে পৌঁছে দিই তার সম্পূর্ণ যাত্রা",
}: HarvestJourneyProps) {
  if (!products || products.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-14 bg-zinc-50 dark:bg-zinc-900/60 border-y border-zinc-200 dark:border-zinc-800">
      <div className="content-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-700 dark:text-amber-400">
            <Sparkles className="w-3.5 h-3.5" />
            স্বচ্ছতা ও বিশুদ্ধতা
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* 4 Steps Timeline Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-12">
          {STEPS.map((s, idx) => {
            const Icon = s.icon
            return (
              <div
                key={idx}
                className="relative p-5 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col justify-between group hover:border-amber-400 dark:hover:border-amber-500 transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-black tracking-widest text-zinc-400 font-mono">
                      ধাপ {s.step}
                    </span>
                    <div className={`w-9 h-9 rounded-xl ${s.color} text-white flex items-center justify-center shadow-xs`}>
                      <Icon className="w-5 h-5" />
                    </div>
                  </div>
                  <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                    {s.title}
                  </h3>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                    {s.desc}
                  </p>
                </div>
              </div>
            )
          })}
        </div>

        {/* Honey Products Grid */}
        <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800">
          <h3 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-zinc-100 mb-4 text-center">
            তাজা সংগ্রহকৃত খাঁটি মধুসমূহ:
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
            {products.slice(0, 4).map((prod) => (
              <HoneyProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
