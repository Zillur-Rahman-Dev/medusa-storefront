import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Flame, Sparkles } from "lucide-react"

type CategoryItem = {
  title: string
  subtitle: string
  tag: string
  href: string
  icon: string
  isAvailable: boolean
  accentColor: string
}

const categories: CategoryItem[] = [
  {
    title: "খাঁটি প্রাকৃতিক মধু",
    subtitle: "সুন্দরবনের খলিশা, কালোজিরা, সরিষা ও লিচু ফুলের বুনো মধু",
    tag: "বেস্ট সেলার",
    href: "/store",
    icon: "🍯",
    isAvailable: true,
    accentColor: "from-amber-500/20 to-amber-500/5",
  },
  {
    title: "গাওয়া ঘি ও প্রাকৃতিক তেল",
    subtitle: "দেশি গরুর খাঁটি দানাদার গাওয়া ঘি ও ঘানিভাঙা খাঁটি সরিষার তেল",
    tag: "নতুন কালেকশন",
    href: "/store",
    icon: "🧈",
    isAvailable: true,
    accentColor: "from-yellow-500/20 to-yellow-500/5",
  },
  {
    title: "প্রিমিয়াম বাদাম ও ড্রাই ফ্রুটস",
    subtitle: "কাজু, কাঠবাদাম, পেস্তা, কিশমিশ এবং মদিনার প্রিমিয়াম খেজুর",
    tag: "স্বাস্থ্যকর",
    href: "/store",
    icon: "🥜",
    isAvailable: true,
    accentColor: "from-orange-500/20 to-orange-500/5",
  },
  {
    title: "অর্গানিক মসলা ও সুপারফুড",
    subtitle: "কেমিক্যালমুক্ত হলুদ, কালোজিরা, চিয়া সিড ও প্রাকৃতিক ঔষধি বীজ",
    tag: "১০০% অর্গানিক",
    href: "/store",
    icon: "🌿",
    isAvailable: true,
    accentColor: "from-emerald-500/20 to-emerald-500/5",
  },
]

export default function CategoryGrid() {
  return (
    <section className="py-14 sm:py-20 bg-zinc-50 dark:bg-zinc-900/40 border-y border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="content-container">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 sm:mb-12 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span>প্রাকৃতিক ও স্বাস্থ্যকর কালেকশন</span>
            </div>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
              পণ্য ক্যাটাগরি ব্রাউজ করুন
            </h2>
            <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
              খাঁটি মধু ছাড়াও আপনার প্রতিদিনের সুস্থতায় খাঁটি ঘি, বাদাম, এবং অর্গানিক সুপারফুড সরাসরি বাড়ি পৌঁছে দিচ্ছি।
            </p>
          </div>

          <LocalizedClientLink
            href="/store"
            className="inline-flex items-center gap-2 text-sm font-semibold text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 group self-start md:self-auto"
          >
            <span>সকল পণ্য এক্সপ্লোর করুন</span>
            <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
          </LocalizedClientLink>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {categories.map((cat, idx) => (
            <LocalizedClientLink
              key={idx}
              href={cat.href}
              className="group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-xl hover:border-amber-400/80 dark:hover:border-amber-500/50 transition-all duration-300"
            >
              <div>
                {/* Header: Icon & Tag */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {cat.icon}
                  </div>
                  <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/50">
                    {cat.tag}
                  </span>
                </div>

                {/* Title & Description */}
                <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {cat.title}
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {cat.subtitle}
                </p>
              </div>

              {/* Bottom CTA */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/60 flex items-center justify-between text-xs font-semibold text-zinc-700 dark:text-zinc-300 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                <span>ব্রাউজ করুন</span>
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </div>
            </LocalizedClientLink>
          ))}
        </div>
      </div>
    </section>
  )
}
