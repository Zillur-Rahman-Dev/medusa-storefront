import LocalizedClientLink from "@modules/common/components/localized-client-link"

const categories = [
  { name: "সকল মধু", href: "/store", icon: "🍯", isSpecial: false },
  { name: "খলিশা ও সুন্দরবন", href: "/categories/sundarban-honey", icon: "🌸", isSpecial: false },
  { name: "সরিষা ফুল", href: "/categories/flower-honey", icon: "🌼", isSpecial: false },
  { name: "কালোজিরা ফুল", href: "/categories/flower-honey", icon: "🌿", isSpecial: false },
  { name: "লিচু ফুল", href: "/categories/flower-honey", icon: "🍯", isSpecial: false },
  { name: "ধনে ফুল", href: "/categories/flower-honey", icon: "🌱", isSpecial: false },
  { name: "পাহাড়ে মৌচাক", href: "/categories/wild-hill-honey", icon: "⛰️", isSpecial: false },
  { name: "বাবলা ও কুল (বরই)", href: "/categories/wild-hill-honey", icon: "🍒", isSpecial: false },
  { name: "কুসুম ও সূর্যমুখী", href: "/categories/wild-hill-honey", icon: "🌻", isSpecial: false },
  { name: "বুনো ফুলের মধু", href: "/categories/wild-hill-honey", icon: "🌾", isSpecial: false },
]

export default function CategoryBar() {
  return (
    <div className="bg-emerald-900 text-emerald-100 border-t border-emerald-800/80 hidden md:block">
      <div className="content-container">
        <div
          className="flex items-center gap-1 overflow-x-auto py-2 scrollbar-none no-scrollbar text-xs font-semibold"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
          }}
        >
          {categories.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href={cat.href}
              className="px-3 py-1.5 rounded-lg whitespace-nowrap hover:bg-emerald-800 hover:text-white transition-colors flex items-center gap-1.5"
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </div>
  )
}
