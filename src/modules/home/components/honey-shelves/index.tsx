"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, ShoppingBag, Truck } from "lucide-react"
import QuickOrderModal from "@modules/common/components/quick-order-modal"

type ShelfProduct = {
  id: string
  title: string
  size: string
  price: number
  regularPrice: number
  icon: string
}

type Shelf = {
  title: string
  subtitle: string
  products: ShelfProduct[]
}

const shelves: Shelf[] = [
  {
    title: "সুন্দরবন ও বনের খাঁটি মধু",
    subtitle: "সুন্দরবনের গভীর ম্যানগ্রোভ ও বুনো মৌচাকের কাঁচা মধু",
    products: [
      { id: "s-1", title: "সুন্দরবনের খলিশা মধু (১ কেজি)", size: "১ কেজি", price: 1350, regularPrice: 1550, icon: "🌸" },
      { id: "s-2", title: "সুন্দরবনের খলিশা মধু (৫০০ গ্রাম)", size: "৫০০ গ্রাম", price: 720, regularPrice: 850, icon: "🌸" },
      { id: "s-3", title: "বনের খাঁটি মধু (সুন্দরবনের মধু - ১ কেজি)", size: "১ কেজি", price: 1250, regularPrice: 1400, icon: "🌳" },
      { id: "s-4", title: "বনের খাঁটি মধু (৫০০ গ্রাম)", size: "৫০০ গ্রাম", price: 680, regularPrice: 750, icon: "🌳" },
      { id: "s-5", title: "সুন্দরবনের খলিশা মধু (২৫০ গ্রাম)", size: "২৫০ গ্রাম", price: 390, regularPrice: 450, icon: "🌸" },
    ],
  },
  {
    title: "ফুলভিত্তিক প্রাকৃতিক মধু",
    subtitle: "সরিষা, লিচু, কালোজিরা ও ধনে ফুলের খাঁটি মধু",
    products: [
      { id: "s-6", title: "খাঁটি সরিষা ফুলের মধু (১ কেজি)", size: "১ কেজি", price: 750, regularPrice: 850, icon: "🌼" },
      { id: "s-7", title: "লিচু ফুলের মিষ্টি মধু (১ কেজি)", size: "১ কেজি", price: 950, regularPrice: 1100, icon: "🍯" },
      { id: "s-8", title: "কালোজিরা ফুলের ঔষধি মধু (১ কেজি)", size: "১ কেজি", price: 1100, regularPrice: 1250, icon: "🌿" },
      { id: "s-9", title: "ধনে ফুলের সুবাসিত মধু (১ কেজি)", size: "১ কেজি", price: 980, regularPrice: 1150, icon: "🌱" },
      { id: "s-10", title: "সরিষা ফুলের মধু (৫০০ গ্রাম)", size: "৫০০ গ্রাম", price: 400, regularPrice: 480, icon: "🌼" },
    ],
  },
  {
    title: "পাহাড়ি বুনো ও বিরল ফুলের মধু",
    subtitle: "পাহাড়ের মৌচাক, বাবলা-কুল এবং কুসুম ও সূর্যমুখী ফুল",
    products: [
      { id: "s-11", title: "পাহাড়ে মৌচাকের মধু (১ কেজি)", size: "১ কেজি", price: 1200, regularPrice: 1400, icon: "⛰️" },
      { id: "s-12", title: "বাবলা ও কুল (বরই) ফুলের মধু (১ কেজি)", size: "১ কেজি", price: 950, regularPrice: 1100, icon: "🍒" },
      { id: "s-13", title: "কুসুম, তিসি ও সূর্যমুখী মধু (১ কেজি)", size: "১ কেজি", price: 900, regularPrice: 1050, icon: "🌻" },
      { id: "s-14", title: "বুনো ফুলের শত পরাগের মধু (১ কেজি)", size: "১ কেজি", price: 850, regularPrice: 990, icon: "🌾" },
      { id: "s-15", title: "পাহাড়ে মৌচাকের মধু (৫০০ গ্রাম)", size: "৫০০ গ্রাম", price: 650, regularPrice: 750, icon: "⛰️" },
    ],
  },
]

export default function HoneyShelves() {
  const [selectedProduct, setSelectedProduct] = useState<ShelfProduct | null>(null)

  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12 bg-white dark:bg-zinc-950 transition-colors">
      {shelves.map((shelf, shelfIdx) => (
        <section key={shelfIdx} className="content-container">
          {/* Header Row matching screenshot */}
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {shelf.title}
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 hidden sm:block">
                {shelf.subtitle}
              </p>
            </div>

            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-1 text-xs sm:text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-700 dark:hover:text-amber-300"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>
          </div>

          {/* 5-Column Grid matching screenshot */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            {shelf.products.map((prod) => (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between p-3.5 sm:p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500/60 shadow-sm hover:shadow-md transition-all duration-200"
              >
                {/* In Stock Badge */}
                <div className="absolute top-2.5 right-2.5 z-10">
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                    ইন স্টক
                  </span>
                </div>

                <div>
                  {/* Image Container */}
                  <LocalizedClientLink
                    href="/store"
                    className="block aspect-square w-full rounded-xl bg-zinc-50 dark:bg-zinc-800/50 p-4 flex items-center justify-center text-5xl sm:text-6xl group-hover:scale-105 transition-transform"
                  >
                    <span className="select-none">{prod.icon}</span>
                  </LocalizedClientLink>

                  {/* Title & Size */}
                  <LocalizedClientLink href="/store" className="block mt-3">
                    <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 line-clamp-2 transition-colors">
                      {prod.title}
                    </h3>
                  </LocalizedClientLink>
                  <div className="text-[11px] text-zinc-400 mt-0.5">
                    {prod.size}
                  </div>

                  {/* Price */}
                  <div className="mt-2 flex items-baseline gap-1.5">
                    <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
                      ৳{prod.price}
                    </span>
                    <span className="text-[11px] text-zinc-400 line-through">
                      ৳{prod.regularPrice}
                    </span>
                  </div>
                </div>

                {/* Single Full-width Orange "অর্ডার করুন" Button */}
                <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                  <button
                    type="button"
                    onClick={() => setSelectedProduct(prod)}
                    className="w-full py-2 px-3 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] transition-all flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>অর্ডার করুন</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}

      {/* Quick COD Order Modal */}
      {selectedProduct && (
        <QuickOrderModal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          product={{
            title: selectedProduct.title,
            price: selectedProduct.price,
            size: selectedProduct.size,
          }}
        />
      )}
    </div>
  )
}
