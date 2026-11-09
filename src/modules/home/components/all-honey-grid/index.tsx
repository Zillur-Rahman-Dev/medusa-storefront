"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

const justForYouProducts: HoneyProductItem[] = [
  {
    id: "jfy-1",
    title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু",
    handle: "sundarban-kholisha-honey",
    variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
    weight: "১ কেজি কাচের জার",
    price: 1350,
    regularPrice: 1550,
    rating: 5,
    reviewCount: 64,
    icon: "🌸",
    badge: "সেরা বিক্রি",
  },
  {
    id: "jfy-2",
    title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
    handle: "mustard-flower-honey",
    variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
    weight: "১ কেজি কাচের জার",
    price: 750,
    regularPrice: 850,
    rating: 5,
    reviewCount: 92,
    icon: "🌼",
    badge: "জনপ্রিয়",
  },
  {
    id: "jfy-3",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "black-seed-flower-honey",
    variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    regularPrice: 1250,
    rating: 5,
    reviewCount: 58,
    icon: "🌿",
    badge: "পছন্দের",
  },
  {
    id: "jfy-4",
    title: "লিচু ফুলের মিষ্টি মধু",
    handle: "litchi-flower-honey",
    variantId: "variant_01M6T7Q2TTB94FMQ7H2V3YWEDV",
    weight: "১ কেজি কাচের জার",
    price: 950,
    regularPrice: 1100,
    rating: 5,
    reviewCount: 51,
    icon: "🍯",
    badge: "মিষ্টি স্বাদ",
  },
  {
    id: "jfy-5",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "hill-wild-honey",
    variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
    weight: "১ কেজি কাচের জার",
    price: 1200,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 46,
    icon: "⛰️",
    badge: "হট আইটেম",
  },
  {
    id: "jfy-6",
    title: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
    handle: "wild-sundarban-forest-honey",
    variantId: "variant_01M6T7QCP8C5N2HWG0JD2DBWJD",
    weight: "১ কেজি কাচের জার",
    price: 1250,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 42,
    icon: "🌳",
    badge: "১০০% খাঁটি",
  },
  {
    id: "jfy-7",
    title: "বাবলা ও কুল (বরই) ফুলের মধু",
    handle: "babla-kool-flower-honey",
    variantId: "variant_01M6T7Q95Z9P7TAKDJZB8C05PY",
    weight: "১ কেজি কাচের জার",
    price: 950,
    regularPrice: 1100,
    rating: 5,
    reviewCount: 34,
    icon: "🍒",
    badge: "বিশেষ",
  },
  {
    id: "jfy-8",
    title: "ধনে ফুলের সুবাসিত মধু",
    handle: "coriander-flower-honey",
    variantId: "variant_01M6T7Q5EXN9XCHW9K53SAD4KT",
    weight: "১ কেজি কাচের জার",
    price: 980,
    regularPrice: 1150,
    rating: 5,
    reviewCount: 36,
    icon: "🌱",
    badge: "১০০% খাঁটি",
  },
]

type AllHoneyGridProps = {
  products?: HoneyProductItem[]
}

export default function AllHoneyGrid({ products }: AllHoneyGridProps) {
  const displayProducts = products && products.length > 0 ? products : justForYouProducts

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
              আপনার জন্য বিশেষ বাছাই
            </h2>
            <div className="w-12 h-1 bg-amber-500 rounded-full mt-1.5" />
          </div>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 uppercase tracking-wider transition-colors"
          >
            <span>সকল মধু দেখুন</span>
            <ArrowRight className="w-4 h-4" />
          </LocalizedClientLink>
        </div>

        {/* 4 Products per row grid matching user screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {displayProducts.map((prod) => (
            <HoneyProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  )
}
