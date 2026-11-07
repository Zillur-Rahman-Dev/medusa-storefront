import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  { name: "খলিশা মধু", icon: "🌸", tag: "সুন্দরবন" },
  { name: "সরিষা ফুল", icon: "🌼", tag: "শীতকালীন" },
  { name: "কালোজিরা", icon: "🌿", tag: "ঔষধি" },
  { name: "লিচু ফুল", icon: "🍯", tag: "মিষ্টি" },
  { name: "ধনে ফুল", icon: "🌱", tag: "হজমবান্ধব" },
  { name: "পাহাড়ি মধু", icon: "⛰️", tag: "বুনো মৌচাক" },
  { name: "বরই ও বাবলা", icon: "🍒", tag: "গাঢ় লালচে" },
  { name: "কুসুম-সূর্যমুখী", icon: "🌻", tag: "অ্যান্টিঅক্সিডেন্ট" },
  { name: "বনের মধু", icon: "🌳", tag: "ম্যানগ্রোভ" },
  { name: "বুনো ফুল", icon: "🌾", tag: "শতফুল" },
]

export default function FeaturedCategories() {
  return (
    <section className="py-8 sm:py-10 bg-white dark:bg-zinc-950 transition-colors border-b border-zinc-150 dark:border-zinc-850">
      <div className="content-container">
        {/* Title matching screenshot */}
        <div className="text-center mb-6">
          <h2 className="text-lg sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            Featured Categories
          </h2>
          <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mt-1.5" />
        </div>

        {/* Categories Icon Row */}
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto scrollbar-none pb-2 justify-start lg:justify-center">
          {categories.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href="/store"
              className="group flex flex-col items-center gap-2 p-3 sm:p-4 rounded-2xl bg-zinc-50/80 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 hover:border-amber-500 dark:hover:border-amber-400 hover:shadow-md transition-all duration-200 shrink-0 min-w-[85px] sm:min-w-[105px] text-center"
            >
              <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-2xl sm:text-3xl shadow-sm border border-zinc-100 dark:border-zinc-700 group-hover:scale-110 group-hover:shadow transition-transform">
                {cat.icon}
              </div>
              <span className="text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors whitespace-nowrap">
                {cat.name}
              </span>
              <span className="text-[10px] text-zinc-400 -mt-1 hidden sm:block">
                {cat.tag}
              </span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
