"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Star, ShoppingBag, Truck } from "lucide-react"
import QuickOrderModal from "@modules/common/components/quick-order-modal"

type TopProduct = {
  id: string
  title: string
  handle: string
  weight: string
  price: number
  regularPrice: number
  rating: number
  reviewCount: number
  icon: string
  badge: string
}

const topProducts: TopProduct[] = [
  {
    id: "top-1",
    title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু",
    handle: "store",
    weight: "১ কেজি কাচের জার",
    price: 1350,
    regularPrice: 1550,
    rating: 5,
    reviewCount: 64,
    icon: "🌸",
    badge: "Best Selling",
  },
  {
    id: "top-2",
    title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
    handle: "store",
    weight: "১ কেজি কাচের জার",
    price: 750,
    regularPrice: 850,
    rating: 5,
    reviewCount: 92,
    icon: "🌼",
    badge: "Best Selling",
  },
  {
    id: "top-3",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "store",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    regularPrice: 1250,
    rating: 5,
    reviewCount: 58,
    icon: "🌿",
    badge: "Best Selling",
  },
  {
    id: "top-4",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "store",
    weight: "১ কেজি কাচের জার",
    price: 1200,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 46,
    icon: "⛰️",
    badge: "Best Selling",
  },
]

export default function TopSelling() {
  const [selectedProduct, setSelectedProduct] = useState<TopProduct | null>(null)

  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header matching screenshot */}
        <div className="text-center mb-10 sm:mb-12">
          <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Top Selling Products
          </h2>
          <div className="w-14 h-1 bg-amber-500 rounded-full mx-auto mt-2" />
        </div>

        {/* 4 Large Top Selling Cards Grid (2x2 or 4 cols) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {topProducts.map((prod) => (
            <div
              key={prod.id}
              className="relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-500/80 transition-all duration-300"
            >
              {/* Best Selling Badge */}
              <div className="absolute top-4 right-4 z-10">
                <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-sm">
                  {prod.badge}
                </span>
              </div>

              <div>
                {/* Visual Image / Container */}
                <LocalizedClientLink
                  href="/store"
                  className="block aspect-square w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/60 p-6 flex items-center justify-center text-7xl hover:scale-105 transition-transform"
                >
                  <span className="select-none">{prod.icon}</span>
                </LocalizedClientLink>

                {/* Rating & Review */}
                <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">
                    ({prod.reviewCount})
                  </span>
                </div>

                {/* Title */}
                <LocalizedClientLink href="/store" className="block mt-2">
                  <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 hover:text-amber-600 dark:hover:text-amber-400 transition-colors line-clamp-2">
                    {prod.title}
                  </h3>
                </LocalizedClientLink>

                <div className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                  {prod.weight}
                </div>

                {/* Price (Strikethrough regular + bold current price) */}
                <div className="mt-3 flex items-baseline gap-2">
                  <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
                    ৳{prod.price}
                  </span>
                  <span className="text-xs sm:text-sm text-zinc-400 line-through">
                    ৳{prod.regularPrice}
                  </span>
                </div>
              </div>

              {/* Dual Action Buttons matching screenshot */}
              <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
                <LocalizedClientLink
                  href="/store"
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-200 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-1"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                  <span>কার্ট-এ যোগ</span>
                </LocalizedClientLink>

                <button
                  type="button"
                  onClick={() => setSelectedProduct(prod)}
                  className="flex-1 py-2.5 px-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] shadow-sm transition-all flex items-center justify-center gap-1"
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
      {selectedProduct && (
        <QuickOrderModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={{
            title: selectedProduct.title,
            price: selectedProduct.price,
            size: selectedProduct.weight,
          }}
        />
      )}
    </section>
  )
}
