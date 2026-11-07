import { ArrowRight, Star, CheckCircle, ShieldCheck, Sparkles } from "lucide-react"
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
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/70 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 transition-colors duration-300 py-14 sm:py-20 border-b border-zinc-200 dark:border-zinc-800">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-400/10 dark:bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="content-container relative z-10">
        <div className="max-w-4xl mx-auto text-center flex flex-col items-center">
          {/* Trust Rating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span>৪.৯/৫ রেটিং • ৫,০০০+ পরিবারে বিশ্বস্ত কাঁচা মধু</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            গ্রামবাংলা ও সুন্দরবনের <br className="hidden sm:inline" />
            <span className="text-amber-600 dark:text-amber-400">খাঁটি ফুলের মধু</span> সরাসরি আপনার টেবিলে
          </h1>

          {/* Subtitle */}
          <p className="mt-4 text-sm sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            সুন্দরবনের খলিশা, উত্তরের সরিষা ও লিচু, পদ্মাপাড়ের কালোজিরা ও ধনে ফুল, বরেন্দ্রের কুল-বাবলা এবং পাহাড়ি বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধুর নির্ভরযোগ্য ঠিকানা।
          </p>

          {/* 10 Honey Variety Quick Chips / Badges */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-3xl">
            {heroHoneyTags.map((tag, idx) => (
              <LocalizedClientLink
                key={idx}
                href="/store"
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-white/90 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 hover:border-amber-400 dark:hover:border-amber-500 text-zinc-700 dark:text-zinc-300 hover:text-amber-600 dark:hover:text-amber-400 shadow-sm transition-all"
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
              ফুড-গ্রেড কাচের জারে নিরাপদ ডেলিভারি
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <LocalizedClientLink
              href="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <span>সকল ফুলের মধু দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>

            <a
              href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20খাঁটি%20মধু%20অর্ডার%20করতে%20চাই।"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all duration-200 text-base shadow-sm"
            >
              <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Hero
