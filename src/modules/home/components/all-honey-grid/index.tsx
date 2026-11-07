"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Truck } from "lucide-react"
import QuickOrderModal from "@modules/common/components/quick-order-modal"

type HoneyItem = {
  id: string
  title: string
  weight: string
  price: number
  regularPrice: number
  icon: string
  discountBadge: string
}

const allTenHoneys: HoneyItem[] = [
  { id: "h-1", title: "সুন্দরবনের খাঁটি খলিশা মধু", weight: "১ কেজি কাচের জার", price: 1350, regularPrice: 1550, icon: "🌸", discountBadge: "Save ৳200" },
  { id: "h-2", title: "সরিষা ফুলের প্রাকৃতিক মধু", weight: "১ কেজি কাচের জার", price: 750, regularPrice: 850, icon: "🌼", discountBadge: "Save ৳100" },
  { id: "h-3", title: "কালোজিরা ফুলের ঔষধি মধু", weight: "১ কেজি কাচের জার", price: 1100, regularPrice: 1250, icon: "🌿", discountBadge: "Save ৳150" },
  { id: "h-4", title: "লিচু ফুলের মিষ্টি মধু", weight: "১ কেজি কাচের জার", price: 950, regularPrice: 1100, icon: "🍯", discountBadge: "Save ৳150" },
  { id: "h-5", title: "ধনে ফুলের সুবাসিত মধু", weight: "১ কেজি কাচের জার", price: 980, regularPrice: 1150, icon: "🌱", discountBadge: "Save ৳170" },
  { id: "h-6", title: "পাহাড়ে মৌচাকের মধু", weight: "১ কেজি কাচের জার", price: 1200, regularPrice: 1400, icon: "⛰️", discountBadge: "Save ৳200" },
  { id: "h-7", title: "বাবলা ও কুল (বরই) ফুলের মধু", weight: "১ কেজি কাচের জার", price: 950, regularPrice: 1100, icon: "🍒", discountBadge: "Save ৳150" },
  { id: "h-8", title: "কুসুম, তিসি ও সূর্যমুখী ফুল", weight: "১ কেজি কাচের জার", price: 900, regularPrice: 1050, icon: "🌻", discountBadge: "Save ৳150" },
  { id: "h-9", title: "বনের খাঁটি মধু (সুন্দরবন)", weight: "১ কেজি কাচের জার", price: 1250, regularPrice: 1400, icon: "🌳", discountBadge: "Save ৳150" },
  { id: "h-10", title: "বুনো ফুলের শত পরাগের মধু", weight: "১ কেজি কাচের জার", price: 850, regularPrice: 990, icon: "🌾", discountBadge: "Save ৳140" },
]

export default function AllHoneyGrid() {
  const [selectedHoney, setSelectedHoney] = useState<HoneyItem | null>(null)

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header matching screenshot */}
        <div className="flex items-end justify-between mb-8 pb-3 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
              সম্পূর্ণ মধুর সমাহার
            </div>
            <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-0.5">
              Just For You
            </h2>
          </div>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
          >
            <span>View All</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* 10 Items (2 Rows of 5) matching screenshot */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {allTenHoneys.map((honey) => (
            <div
              key={honey.id}
              className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all duration-200"
            >
              {/* Discount Tag */}
              <div className="absolute top-2.5 right-2.5 z-10">
                <span className="px-2 py-0.5 text-[9px] font-bold rounded-md bg-amber-500 text-white shadow-sm">
                  {honey.discountBadge}
                </span>
              </div>

              <div>
                {/* Product Image Box */}
                <LocalizedClientLink
                  href="/store"
                  className="block aspect-square w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 flex items-center justify-center text-5xl sm:text-6xl group-hover:scale-105 transition-transform"
                >
                  <span className="select-none">{honey.icon}</span>
                </LocalizedClientLink>

                {/* Title */}
                <LocalizedClientLink href="/store" className="block mt-3">
                  <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 transition-colors">
                    {honey.title}
                  </h3>
                </LocalizedClientLink>

                <div className="text-[11px] text-zinc-400 mt-0.5">
                  {honey.weight}
                </div>

                {/* Price */}
                <div className="mt-2 flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                    ৳{honey.price}
                  </span>
                  <span className="text-[11px] text-zinc-400 line-through">
                    ৳{honey.regularPrice}
                  </span>
                </div>
              </div>

              {/* Order Button */}
              <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                <button
                  type="button"
                  onClick={() => setSelectedHoney(honey)}
                  className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>অর্ডার করুন</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Order Modal */}
      {selectedHoney && (
        <QuickOrderModal
          isOpen={!!selectedHoney}
          onClose={() => setSelectedHoney(null)}
          product={{
            title: selectedHoney.title,
            price: selectedHoney.price,
            size: selectedHoney.weight,
          }}
        />
      )}
    </section>
  )
}
