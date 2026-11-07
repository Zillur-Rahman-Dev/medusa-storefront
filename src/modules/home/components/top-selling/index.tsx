"use client"

import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

const topSellingHoneys: HoneyProductItem[] = [
  {
    id: "top-1",
    title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু",
    handle: "sundarban-kholisha-honey",
    variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
    weight: "১ কেজি কাচের জার",
    price: 1350,
    regularPrice: 1550,
    rating: 5,
    reviewCount: 64,
    icon: "🌸",
    badge: "BEST SELLING",
  },
  {
    id: "top-2",
    title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
    handle: "mustard-flower-honey",
    variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
    weight: "১ কেজি কাচের জার",
    price: 750,
    regularPrice: 850,
    rating: 5,
    reviewCount: 92,
    icon: "🌼",
    badge: "BEST SELLING",
  },
  {
    id: "top-3",
    title: "কালোজিরা ফুলের ঔষধি মধু",
    handle: "black-seed-flower-honey",
    variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
    weight: "১ কেজি কাচের জার",
    price: 1100,
    regularPrice: 1250,
    rating: 5,
    reviewCount: 58,
    icon: "🌿",
    badge: "BEST SELLING",
  },
  {
    id: "top-4",
    title: "পাহাড়ে মৌচাকের বুনো মধু",
    handle: "hill-wild-honey",
    variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
    weight: "১ কেজি কাচের জার",
    price: 1200,
    regularPrice: 1400,
    rating: 5,
    reviewCount: 46,
    icon: "⛰️",
    badge: "BEST SELLING",
  },
]

export default function TopSelling() {
  return (
    <section className="py-10 sm:py-14 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Section Header matching screenshot */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Top Selling Products
          </h2>
          <div className="w-14 h-1 bg-amber-500 rounded-full mx-auto mt-2" />
        </div>

        {/* Exactly 4 Products in a Row matching user screenshot */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
          {topSellingHoneys.map((prod) => (
            <HoneyProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>
    </section>
  )
}
