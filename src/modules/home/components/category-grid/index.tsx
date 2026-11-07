import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Sparkles, Droplets } from "lucide-react"

type HoneyVariety = {
  id: string
  name: string
  flowerSource: string
  region: string
  flavorNote: string
  tag: string
  colorBadge: string
  accentBorder: string
  icon: string
  crystallizationNote: string
}

const honeyVarieties: HoneyVariety[] = [
  {
    id: "sundarban-kholisha",
    name: "খলিশা ও সুন্দরবনের অন্যান্য ফুল",
    flowerSource: "সুন্দরবনের খলিশা, গরান ও বাইন ফুল",
    region: "সুন্দরবন ম্যানগ্রোভ বন",
    flavorNote: "তীব্র প্রাকৃতিক সুবাস ও অতুলনীয় মিষ্টি বুনো স্বাদ",
    tag: "সর্বাধিক প্রিমিয়াম",
    colorBadge: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300",
    accentBorder: "hover:border-amber-500",
    icon: "🌸",
    crystallizationNote: "সাধারণত সহজে জমে না",
  },
  {
    id: "wild-forest-honey",
    name: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
    flowerSource: "গভীর বনের প্রাকৃতিক মৌচাকের মিশ্র ফুল",
    region: "গভীর সুন্দরবন",
    flavorNote: "গাঢ় স্বাদ, কিছুটা ঝাঁঝ ও বুনো প্রকৃতির বিশুদ্ধ অনুভূতি",
    tag: "বুনো মৌচাক",
    colorBadge: "bg-orange-100 text-orange-900 dark:bg-orange-950/80 dark:text-orange-300",
    accentBorder: "hover:border-orange-500",
    icon: "🌳",
    crystallizationNote: "তরল ও গাঢ় থাকে",
  },
  {
    id: "mustard-honey",
    name: "সরিষা ফুলের মধু",
    flowerSource: "হলুদ সরিষা ফুল",
    region: "টাঙ্গাইল, নাটোর ও পাবনা",
    flavorNote: "মিষ্টি ও ক্রিমি মাখনের মতো মসৃণ টেক্সচার",
    tag: "শীতের স্পেশাল",
    colorBadge: "bg-yellow-100 text-yellow-900 dark:bg-yellow-950/80 dark:text-yellow-300",
    accentBorder: "hover:border-yellow-500",
    icon: "🌼",
    crystallizationNote: "শীতকালে প্রাকৃতিকভাবে জমে ক্রিমের মতো হয়",
  },
  {
    id: "litchi-honey",
    name: "লিচু ফুলের মধু",
    flowerSource: "লিচু মুকুলের প্রাকৃতিক নেক্টার",
    region: "দিনাজপুর ও ঈশ্বরদী",
    flavorNote: "হালকা পাতলা, মিষ্টি লিচুর ফ্রুটি সুবাস",
    tag: "বাচ্চাদের অত্যন্ত প্রিয়",
    colorBadge: "bg-rose-100 text-rose-900 dark:bg-rose-950/80 dark:text-rose-300",
    accentBorder: "hover:border-rose-500",
    icon: "🍯",
    crystallizationNote: "স্বর্ণালী তরল, সহজে জমে না",
  },
  {
    id: "black-seed-honey",
    name: "কালোজিরা ফুলের মধু",
    flowerSource: "কালোজিরা ক্ষেতের ফুল",
    region: "মাদারীপুর ও ফরিদপুর",
    flavorNote: "গাঢ় বাদামী বর্ণ, ঔষধি ঝাঁঝালো সুবাস ও অনন্য স্বাদ",
    tag: "সর্বোচ্চ ঔষধি গুণ",
    colorBadge: "bg-zinc-800 text-amber-300 dark:bg-zinc-800 dark:text-amber-300",
    accentBorder: "hover:border-amber-400",
    icon: "🌿",
    crystallizationNote: "দীর্ঘদিন তরল থাকে",
  },
  {
    id: "coriander-honey",
    name: "ধনে ফুলের মধু",
    flowerSource: "ধনে ক্ষেতের সাদা ছোট ফুল",
    region: "ফরিদপুর ও শরীয়তপুর",
    flavorNote: "মৃদু ঝাঁঝালো, আকর্ষণীয় স্পাইসি ফ্লেভার ও মিষ্টি গন্ধ",
    tag: "হজমে উপকারী",
    colorBadge: "bg-emerald-100 text-emerald-900 dark:bg-emerald-950/80 dark:text-emerald-300",
    accentBorder: "hover:border-emerald-500",
    icon: "🌱",
    crystallizationNote: "হালকা দানাদার হতে পারে",
  },
  {
    id: "hill-wild-honey",
    name: "পাহাড়ে মৌচাকের মধু",
    flowerSource: "পাহাড়ি জঙ্গল ও ঝোপঝাড়ের শত ফুল",
    region: "বান্দরবান ও খাগড়াছড়ির বুনো পাহাড়",
    flavorNote: "অত্যন্ত ঘন, বহু ফুলের পুষ্টিগুণে সমৃদ্ধ প্রাকৃতিক মধু",
    tag: "প্রাকৃতিক দুর্লভ",
    colorBadge: "bg-stone-200 text-stone-900 dark:bg-stone-800 dark:text-stone-200",
    accentBorder: "hover:border-stone-500",
    icon: "⛰️",
    crystallizationNote: "স্বাভাবিকভাবে ঘন থাকে",
  },
  {
    id: "babla-kool-honey",
    name: "বাবলা ও কুল (বরই) ফুলের মধু",
    flowerSource: "কুল (বরই) ও বাবলা গাছের ফুল",
    region: "রাজশাহী ও বরেন্দ্র অঞ্চল",
    flavorNote: "গাঢ় লালচে সোনালী বর্ণ, সুস্বাদু মিষ্টি ও অনন্য অ্যারোমা",
    tag: "জনপ্রিয় কালেকশন",
    colorBadge: "bg-red-100 text-red-900 dark:bg-red-950/80 dark:text-red-300",
    accentBorder: "hover:border-red-500",
    icon: "🍒",
    crystallizationNote: "গাঢ় ঘন টেক্সচার",
  },
  {
    id: "sunflower-kusum-honey",
    name: "কুসুম, তিসি ও সূর্যমুখী ফুল",
    flowerSource: "কুসুম ফুল, তিসি ও সূর্যমুখী নেক্টার",
    region: "উপকূলীয় চরাঞ্চল",
    flavorNote: "স্বচ্ছ সোনালী বর্ণ, মৃদু মিষ্টি সুবাস ও অ্যান্টিঅক্সিডেন্টে ভরপুর",
    tag: "উচ্চ পুষ্টিগুণ",
    colorBadge: "bg-amber-100 text-amber-900 dark:bg-amber-950/80 dark:text-amber-300",
    accentBorder: "hover:border-amber-500",
    icon: "🌻",
    crystallizationNote: "ধীরে ধীরে জমতে পারে",
  },
  {
    id: "wildflower-honey",
    name: "বুনো ফুলের মধু",
    flowerSource: "গ্রামবাংলার বুনো লতাপাতা ও শত ফুলের পরাগ",
    region: "গ্রামবাংলার উন্মুক্ত প্রকৃতি",
    flavorNote: "বহুমুখী ফুলের মিশ্র স্বাদ, রোগ প্রতিরোধে চমৎকার সহায়ক",
    tag: "শত ফুলের নির্যাস",
    colorBadge: "bg-teal-100 text-teal-900 dark:bg-teal-950/80 dark:text-teal-300",
    accentBorder: "hover:border-teal-500",
    icon: "🌾",
    crystallizationNote: "প্রাকৃতিক কাঁচা মধু",
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-16 sm:py-24 bg-zinc-50/80 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="content-container">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 sm:mb-16 gap-6">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>আমাদের ১০টি খাঁটি মধুর সমাহার</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
              কোন ফুলের মধু আপনার পছন্দ?
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
              আমরা কোনো প্রকার কৃত্রিম চিনি ছাড়া ঋতুভিত্তিক বিভিন্ন ফুল ও বুনো মৌচাক থেকে সংগ্রহ করি শতভাগ খাঁটি কাঁচা মধু। প্রতিটি ভ্যারাইটির রয়েছে নিজস্ব অনন্য স্বাদ ও প্রাকৃতিক বৈশিষ্ট্য।
            </p>
          </div>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 group self-start md:self-auto shrink-0"
          >
            <span>সবগুলো অর্ডার করুন</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </LocalizedClientLink>
        </div>

        {/* Honey Varieties 10-Item Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-5">
          {honeyVarieties.map((honey) => (
            <LocalizedClientLink
              key={honey.id}
              href="/store"
              className={`group relative flex flex-col justify-between p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl ${honey.accentBorder} transition-all duration-300 hover:-translate-y-1`}
            >
              <div>
                {/* Top: Icon + Tag */}
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-amber-50 dark:bg-zinc-800 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform shadow-inner">
                    {honey.icon}
                  </div>
                  <span
                    className={`px-2 py-0.5 text-[10px] font-bold rounded-full border border-black/5 dark:border-white/5 ${honey.colorBadge}`}
                  >
                    {honey.tag}
                  </span>
                </div>

                {/* Title */}
                <h3 className="font-bold text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                  {honey.name}
                </h3>

                {/* Source & Region */}
                <div className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 space-y-1">
                  <div className="flex items-center gap-1 font-medium text-amber-700/90 dark:text-amber-400/90">
                    <Droplets className="w-3 h-3 shrink-0" />
                    <span className="truncate">{honey.region}</span>
                  </div>
                  <p className="line-clamp-2 text-zinc-600 dark:text-zinc-300 text-[11px] leading-relaxed pt-1">
                    {honey.flavorNote}
                  </p>
                </div>
              </div>

              {/* Bottom: Crystallization note & Action */}
              <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                <div className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-2 truncate">
                  {honey.crystallizationNote}
                </div>
                <div className="flex items-center justify-between text-xs font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  <span>অর্ডার করুন</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
