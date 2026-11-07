import { ArrowRight, Star, CheckCircle, ShieldCheck } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const heroHoneyTags = [
  { name: "খলিশা ও সুন্দরবনের ফুল", icon: "🌸" },
  { name: "সরিষা ফুল", icon: "🌼" },
  { name: "কালোজিরা ফুল", icon: "🌿" },
  { name: "লিচু ফুল", icon: "🍯" },
  { name: "ধনে ফুল", icon: "🌱" },
  { name: "বাবলা ও কুল (বরই)", icon: "🍒" },
  { name: "পাহাড়ে মৌচাকের মধু", icon: "⛰️" },
  { name: "বনের খাঁটি মধু", icon: "🌳" },
  { name: "কুসুম, তিসি ও সূর্যমুখী", icon: "🌻" },
  { name: "বুনো ফুলের মধু", icon: "🌾" },
]

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-emerald-50/60 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 transition-colors duration-300 py-12 sm:py-20 border-b border-zinc-200 dark:border-zinc-800">
      {/* Decorative Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-emerald-500/10 dark:bg-emerald-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="content-container relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Trust Rating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm font-semibold mb-6 shadow-sm">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span>৪.৯/৫ রেটিং • ৫,০০০+ পরিবারের বিশ্বস্ত কাঁচা মধু</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            গ্রামবাংলা ও সুন্দরবনের <br className="hidden sm:inline" />
            <span className="text-emerald-700 dark:text-emerald-400">খাঁটি ফুলের মধু</span> সরাসরি আপনার টেবিলে
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            সুন্দরবনের খলিশা, উত্তরের সরিষা ও লিচু, পদ্মাপাড়ের কালোজিরা ও ধনে ফুল, বরেন্দ্রের কুল-বাবলা এবং পাহাড়ি বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধুর নির্ভরযোগ্য অনলাইন শপ।
          </p>

          {/* 10 Honey Variety Quick Chips / Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {heroHoneyTags.map((tag, idx) => (
              <LocalizedClientLink
                key={idx}
                href="/store"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-emerald-600 dark:hover:border-emerald-500 text-zinc-700 dark:text-zinc-300 hover:text-emerald-700 dark:hover:text-emerald-400 shadow-sm transition-all"
              >
                <span>{tag.icon}</span>
                <span>{tag.name}</span>
              </LocalizedClientLink>
            ))}
          </div>

          {/* Key Quick Bullet Points */}
          <div className="mt-7 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              কোনো চিনি বা প্রিজারভেটিভ নেই
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              টেস্ট করে মূল্য পরিশোধের সুবিধা
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              ফুড-গ্রেড কাচের জারে নিরাপদ প্যাকেজিং
            </span>
          </div>

          {/* GhorerBazar CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <LocalizedClientLink
              href="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-white bg-emerald-700 hover:bg-emerald-800 shadow-lg shadow-emerald-700/25 transition-all duration-200 active:scale-[0.98] text-base"
            >
              <span>সকল ফুলের মধু দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>

            <a
              href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20খাঁটি%20মধু%20অর্ডার%20করতে%20চাই।"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-2xl font-bold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 text-base shadow-sm"
            >
              <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
