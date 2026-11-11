import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

interface FeaturedCategoriesProps {
  categories?: HttpTypes.StoreProductCategory[]
}

// Helper to choose a matching emoji icon based on category name/handle
function getCategoryIcon(name: string = "", handle: string = ""): string {
  const text = `${name} ${handle}`.toLowerCase()
  if (text.includes("sundarban") || text.includes("সুন্দরবন") || text.includes("ম্যানগ্রোভ")) return "🌳"
  if (text.includes("kholisha") || text.includes("খলিশা")) return "🌸"
  if (text.includes("mustard") || text.includes("সরিষা")) return "🌼"
  if (text.includes("black-seed") || text.includes("kalijira") || text.includes("কালোজিরা") || text.includes("কালিজিরা")) return "🌿"
  if (text.includes("litchi") || text.includes("লিচু")) return "🍯"
  if (text.includes("coriander") || text.includes("ধনে")) return "🌱"
  if (text.includes("hill") || text.includes("পাহাড়ি") || text.includes("বুনো")) return "⛰️"
  if (text.includes("flower") || text.includes("ফুল")) return "🌺"
  if (text.includes("combo") || text.includes("কম্বো")) return "🎁"
  if (text.includes("top-selling") || text.includes("সেরা")) return "⭐"
  return "🍯"
}

// Fallback demo categories if dashboard is empty
const defaultCategories = [
  { name: "খলিশা মধু", handle: "sundarban-honey", icon: "🌸", tag: "সুন্দরবন" },
  { name: "কালোজিরা মধু", handle: "black-seed-flower-honey", icon: "🌿", tag: "ঔষধি গুণ" },
  { name: "সরিষা ফুল মধু", handle: "mustard-flower-honey", icon: "🌼", tag: "শীতকালীন" },
  { name: "লিচু ফুল মধু", handle: "litchi-flower-honey", icon: "🍯", tag: "প্রাকৃতিক মিষ্টি" },
  { name: "ধনে ফুল মধু", handle: "coriander-flower-honey", icon: "🌱", tag: "হজমবান্ধব" },
  { name: "পাহাড়ি বুনো মধু", handle: "wild-hill-honey", icon: "⛰️", tag: "বুনো মৌচাক" },
  { name: "হানি কম্বো প্যাক", handle: "combo", icon: "🎁", tag: "বিশেষ অফার" },
]

export default function FeaturedCategories({ categories = [] }: FeaturedCategoriesProps) {
  // Filter out demo apparel categories (shirts, pants, merch)
  const ignoredHandles = ["shirts", "sweatshirts", "pants", "merch"]
  const activeCategories = categories.filter(
    (c) => !ignoredHandles.includes(c.handle?.toLowerCase() || "")
  )

  const displayList =
    activeCategories.length > 0
      ? activeCategories.map((c) => ({
          name: c.name?.trim(),
          handle: c.handle,
          icon: getCategoryIcon(c.name, c.handle),
          tag: c.description || (c.products && c.products.length > 0 ? `${c.products.length}টি পণ্য` : "১০০% খাঁটি"),
        }))
      : defaultCategories

  return (
    <section className="py-7 sm:py-9 bg-white dark:bg-zinc-950 transition-colors border-b border-zinc-150 dark:border-zinc-850">
      <div className="content-container">
        {/* Title in Bengali */}
        <div className="text-center mb-5 sm:mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200/60 dark:border-amber-800/40 mb-2">
            <span>প্রকৃতির বিশুদ্ধ উপহার</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            জনপ্রিয় মধুর ক্যাটাগরি
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-md mx-auto">
            ফুলের উৎস ও প্রকৃতি অনুযায়ী আপনার পছন্দের খাঁটি কাঁচা মধু বেছে নিন
          </p>
          <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mt-2" />
        </div>

        {/* Categories Icon Row (Live from Medusa Dashboard) */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 justify-start md:justify-center">
          {displayList.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href={`/store?category=${cat.handle}`}
              className="group flex flex-col items-center gap-1.5 sm:gap-2 p-3 sm:p-4 rounded-2xl bg-zinc-50/90 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all duration-200 shrink-0 min-w-[90px] sm:min-w-[115px] text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 group-hover:shadow transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                {cat.name}
              </span>
              <span className="text-[10px] text-zinc-400 font-medium -mt-0.5 whitespace-nowrap">
                {cat.tag}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
