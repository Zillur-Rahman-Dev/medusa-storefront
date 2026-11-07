import { Suspense } from "react"

import SkeletonProductGrid from "@modules/skeletons/templates/skeleton-product-grid"
import RefinementList from "@modules/store/components/refinement-list"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"
import PaginatedProducts from "./paginated-products"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Sparkles, ShieldCheck } from "lucide-react"

const honeyCategories = [
  "সকল মধু",
  "খলিশা ও সুন্দরবন",
  "সরিষা ফুল",
  "কালোজিরা ফুল",
  "লিচু ফুল",
  "ধনে ফুল",
  "পাহাড়ে মৌচাক",
  "বাবলা ও বরই (কুল)",
  "কুসুম ও সূর্যমুখী",
  "বুনো ফুল",
]

const StoreTemplate = ({
  sortBy,
  page,
  countryCode,
}: {
  sortBy?: SortOptions
  page?: string
  countryCode: string
}) => {
  const pageNumber = page ? parseInt(page) : 1
  const sort = sortBy || "created_at"

  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      {/* GhorerBazar Style Store Banner */}
      <section className="bg-gradient-to-b from-emerald-900/10 via-emerald-800/5 to-transparent border-b border-zinc-200/80 dark:border-zinc-800 py-10 sm:py-14">
        <div className="content-container text-center max-w-3xl">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>১০০% খাঁটি ও কাঁচা মধুর বিশ্বস্ত সমাহার</span>
          </div>
          <h1
            className="text-2xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight"
            data-testid="store-page-title"
          >
            আমাদের সকল ফুলের খাঁটি মধু
          </h1>
          <p className="mt-2.5 text-xs sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            সুন্দরবনের খলিশা, উত্তরের সরিষা ও লিচু, পদ্মাপাড়ের কালোজিরা ও ধনে ফুল, বরেন্দ্র অঞ্চলের কুল-বাবলা ও পাহাড়ি বুনো মৌচাকের প্রাকৃতিক মধু।
          </p>

          {/* Variety Filter Chips */}
          <div className="flex items-center justify-center flex-wrap gap-2 pt-6">
            {honeyCategories.map((cat, idx) => (
              <LocalizedClientLink
                key={idx}
                href="/store"
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  idx === 0
                    ? "bg-emerald-700 text-white shadow-sm"
                    : "bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-500"
                }`}
              >
                {cat}
              </LocalizedClientLink>
            ))}
          </div>
        </div>
      </section>

      {/* Main Store Content */}
      <div
        className="content-container py-10 flex flex-col small:flex-row small:items-start gap-8"
        data-testid="category-container"
      >
        <div className="shrink-0 w-full small:w-64">
          <RefinementList sortBy={sort} />
        </div>
        <div className="flex-1 w-full">
          <Suspense fallback={<SkeletonProductGrid />}>
            <PaginatedProducts
              sortBy={sort}
              page={pageNumber}
              countryCode={countryCode}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default StoreTemplate
