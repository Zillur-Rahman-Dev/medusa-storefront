"use client"

import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight } from "lucide-react"
import HoneyProductCard, { HoneyProductItem } from "@modules/products/components/honey-product-card"

type HoneyShelfSection = {
  title: string
  subtitle: string
  products: HoneyProductItem[]
}

const shelvesData: HoneyShelfSection[] = [
  {
    title: "সুন্দরবন ও ম্যানগ্রোভের খাঁটি মধু",
    subtitle: "সুন্দরবনের গভীর ম্যানগ্রোভ ও বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধু",
    products: [
      {
        id: "sh-1",
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
        id: "sh-2",
        title: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
        handle: "wild-sundarban-forest-honey",
        variantId: "variant_01M6T7QCP8C5N2HWG0JD2DBWJD",
        weight: "১ কেজি কাচের জার",
        price: 1250,
        regularPrice: 1400,
        rating: 5,
        reviewCount: 42,
        icon: "🌳",
        badge: "১০০% বুনো",
      },
      {
        id: "sh-3",
        title: "সুন্দরবনের খাঁটি খলিশা মধু (৫০০ গ্রাম)",
        handle: "sundarban-kholisha-honey",
        variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
        weight: "৫০০ গ্রাম কাচের জার",
        price: 720,
        regularPrice: 850,
        rating: 5,
        reviewCount: 38,
        icon: "🌸",
        badge: "জনপ্রিয়",
      },
      {
        id: "sh-4",
        title: "বনের খাঁটি মধু (৫০০ গ্রাম)",
        handle: "wild-sundarban-forest-honey",
        variantId: "variant_01M6T7QCP8C5N2HWG0JD2DBWJD",
        weight: "৫০০ গ্রাম কাচের জার",
        price: 680,
        regularPrice: 780,
        rating: 5,
        reviewCount: 29,
        icon: "🌳",
        badge: "ন্যাচারাল",
      },
    ],
  },
  {
    title: "ফুলভিত্তিক প্রাকৃতিক মধু",
    subtitle: "সরিষা, লিচু, কালোজিরা ও ধনে ফুলের প্রাকৃতিক মধু",
    products: [
      {
        id: "sh-5",
        title: "খাঁটি সরিষা ফুলের প্রাকৃতিক মধু",
        handle: "mustard-flower-honey",
        variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
        weight: "১ কেজি কাচের জার",
        price: 750,
        regularPrice: 850,
        rating: 5,
        reviewCount: 92,
        icon: "🌼",
        badge: "সেরা বিক্রি",
      },
      {
        id: "sh-6",
        title: "কালোজিরা ফুলের ঔষধি মধু",
        handle: "black-seed-flower-honey",
        variantId: "variant_01M6T7PYQB451QEXYV8F07D3EV",
        weight: "১ কেজি কাচের জার",
        price: 1100,
        regularPrice: 1250,
        rating: 5,
        reviewCount: 58,
        icon: "🌿",
        badge: "ঔষধি গুণ",
      },
      {
        id: "sh-7",
        title: "লিচু ফুলের মিষ্টি মধু",
        handle: "litchi-flower-honey",
        variantId: "variant_01M6T7Q2TTB94FMQ7H2V3YWEDV",
        weight: "১ কেজি কাচের জার",
        price: 950,
        regularPrice: 1100,
        rating: 5,
        reviewCount: 51,
        icon: "🍯",
        badge: "বাচ্চাদের প্রিয়",
      },
      {
        id: "sh-8",
        title: "ধনে ফুলের সুবাসিত মধু",
        handle: "coriander-flower-honey",
        variantId: "variant_01M6T7Q5EXN9XCHW9K53SAD4KT",
        weight: "১ কেজি কাচের জার",
        price: 980,
        regularPrice: 1150,
        rating: 5,
        reviewCount: 36,
        icon: "🌱",
        badge: "হজমবান্ধব",
      },
    ],
  },
  {
    title: "পাহাড়ি ও বুনো মৌচাকের মধু",
    subtitle: "পাহাড়ের মৌচাক, বাবলা-কুল এবং কুসুম ও সূর্যমুখী ফুল",
    products: [
      {
        id: "sh-9",
        title: "পাহাড়ে মৌচাকের বুনো মধু",
        handle: "hill-wild-honey",
        variantId: "variant_01M6T7Q7GE2EQJR2RCHV4XXZFX",
        weight: "১ কেজি কাচের জার",
        price: 1200,
        regularPrice: 1400,
        rating: 5,
        reviewCount: 46,
        icon: "⛰️",
        badge: "সেরা বিক্রি",
      },
      {
        id: "sh-10",
        title: "বাবলা ও কুল (বরই) ফুলের মধু",
        handle: "babla-kool-flower-honey",
        variantId: "variant_01M6T7Q95Z9P7TAKDJZB8C05PY",
        weight: "১ কেজি কাচের জার",
        price: 950,
        regularPrice: 1100,
        rating: 5,
        reviewCount: 34,
        icon: "🍒",
        badge: "গাঢ় লালচে",
      },
      {
        id: "sh-11",
        title: "কুসুম, তিসি ও সূর্যমুখী ফুল",
        handle: "sunflower-kusum-honey",
        variantId: "variant_01M6T7QB6DG33BBCNXXPRW9SW7",
        weight: "১ কেজি কাচের জার",
        price: 900,
        regularPrice: 1050,
        rating: 5,
        reviewCount: 28,
        icon: "🌻",
        badge: "অ্যান্টিঅক্সিডেন্ট",
      },
      {
        id: "sh-12",
        title: "বুনো ফুলের শত পরাগের মধু",
        handle: "wildflower-honey",
        variantId: "variant_01M6T7QE2CE9N5DTSG5G1S78NP",
        weight: "১ কেজি কাচের জার",
        price: 850,
        regularPrice: 990,
        rating: 5,
        reviewCount: 41,
        icon: "🌾",
        badge: "শতফুল",
      },
    ],
  },
]

export default function HoneyShelves() {
  return (
    <div className="space-y-12 sm:space-y-16 py-8 sm:py-12 bg-white dark:bg-zinc-950 transition-colors">
      {shelvesData.map((shelf, shelfIdx) => (
        <section key={shelfIdx} className="content-container">
          {/* Header Row matching screenshot */}
          <div className="flex items-end justify-between mb-6 pb-3 border-b border-zinc-200 dark:border-zinc-800">
            <div>
              <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
                {shelf.title}
              </h2>
              <div className="w-12 h-1 bg-amber-500 rounded-full mt-1.5" />
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 hidden sm:block">
                {shelf.subtitle}
              </p>
            </div>

            <LocalizedClientLink
              href="/store"
              className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-amber-500 hover:text-amber-600 dark:text-amber-400 dark:hover:text-amber-300 uppercase tracking-wider transition-colors"
            >
              <span>সকল মধু দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>
          </div>

          {/* Exactly 4 Products Grid matching user screenshot */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {shelf.products.map((prod) => (
              <HoneyProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
