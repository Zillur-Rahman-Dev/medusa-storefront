"use client"

import React, { useState } from "react"
import { Activity, ShieldCheck, Heart, Sparkles, Zap } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type BenefitCategory = {
  id: string
  label: string
  icon: string
  desc: string
  productKeywords: string[]
}

const BENEFIT_CATEGORIES: BenefitCategory[] = [
  {
    id: "diabetes",
    label: "ডায়াবেটিস ফ্রেন্ডলি কাঁচা মধু",
    icon: "🩺",
    desc: "প্রাকৃতিক ফ্রুক্টোজ সমৃদ্ধ অপরিশোধিত র মধু যা পরিমিত মাত্রায় শরীরের চিনি নিয়ন্ত্রণ ও ইনসুলিন ব্যালান্সে সহায়ক।",
    productKeywords: ["খলিশা", "kholisha", "sundarban"],
  },
  {
    id: "immunity",
    label: "সর্দি-কাশি ও রোগ প্রতিরোধ",
    icon: "👶",
    desc: "কালোজিরা ফুলের অ্যান্টি-ব্যাকটেরিয়াল উপাদান শিশুদের ও বড়দের ঠান্ডাজনিত সমস্যা দূর করে ইমিউনিটি বাড়ায়।",
    productKeywords: ["কালোজিরা", "black-seed", "kalijira"],
  },
  {
    id: "fitness",
    label: "এনার্জি ও ওজন নিয়ন্ত্রণ",
    icon: "⚡",
    desc: "সকালে কুসুম গরম পানিতে খাঁটি সরিষা ও লেবুর রস মিশিয়ে খেলে মেটাবলিজম বাড়ে এবং মেদ কমাতে সাহায্য করে।",
    productKeywords: ["সরিষা", "mustard", "sorisha"],
  },
  {
    id: "digestion",
    label: "হজম শক্তি ও ত্বকের যত্ন",
    icon: "💆",
    desc: "প্রাকৃতিক এনজাইম সমৃদ্ধ হালকা মিষ্টি মধু পেটের গ্যাস্ট্রিক ও অ্যাসিডিটি দূর করে ত্বক উজ্জ্বল রাখে।",
    productKeywords: ["লিচু", "litchi", "flower"],
  },
]

type ProblemSolutionProps = {
  products?: HoneyProductItem[]
  title?: string
  subtitle?: string
}

export default function ProblemSolution({
  products = [],
  title = "আপনার স্বাস্থ্যের প্রয়োজনে সঠিক খাঁটি মধু",
  subtitle = "আপনার প্রয়োজন বা শারীরিক লক্ষ্য অনুযায়ী ডাক্তার ও পুষ্টিবিদদের পরামর্শকৃত মধু বেছে নিন",
}: ProblemSolutionProps) {
  const [activeTab, setActiveTab] = useState<string>("diabetes")

  const selectedCategory = BENEFIT_CATEGORIES.find((c) => c.id === activeTab) || BENEFIT_CATEGORIES[0]

  // Filter products matching current category keywords
  const matchedProducts = products.filter((p) => {
    const text = `${p.title} ${p.handle}`.toLowerCase()
    return selectedCategory.productKeywords.some((kw) => text.includes(kw.toLowerCase()))
  })

  const displayProducts = matchedProducts.length > 0 ? matchedProducts : products.slice(0, 4)

  if (!products || products.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-12 bg-white dark:bg-zinc-950">
      <div className="content-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <Heart className="w-3.5 h-3.5 fill-current" />
            স্বাস্থ্য ও সুস্থতা গাইড
          </span>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-zinc-900 dark:text-zinc-100">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* Tab Pills */}
        <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-6">
          {BENEFIT_CATEGORIES.map((cat) => {
            const isActive = cat.id === activeTab
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-amber-500 text-zinc-950 shadow-md scale-[1.02]"
                    : "bg-zinc-100 dark:bg-zinc-850 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            )
          })}
        </div>

        {/* Category Description Banner */}
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 dark:bg-zinc-900 border border-amber-300/60 dark:border-zinc-800 mb-6 flex items-start gap-3">
          <span className="text-2xl">💡</span>
          <div>
            <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
              পুষ্টিগুণের বিশেষ তথ্য:
            </h4>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 leading-relaxed">
              {selectedCategory.desc}
            </p>
          </div>
        </div>

        {/* Matched Products */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {displayProducts.slice(0, 4).map((prod) => (
            <HoneyProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  )
}
