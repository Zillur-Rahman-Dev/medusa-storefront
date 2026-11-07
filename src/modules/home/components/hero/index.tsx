import { ArrowRight, Star, CheckCircle, ShieldCheck } from "lucide-react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

const Hero = () => {
  return (
    <div className="relative overflow-hidden bg-gradient-to-b from-amber-50/60 via-white to-white dark:from-zinc-900 dark:via-zinc-950 dark:to-zinc-950 transition-colors duration-300 py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800">
      {/* Decorative Warm Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-amber-400/10 dark:bg-amber-500/5 blur-3xl pointer-events-none rounded-full" />

      <div className="content-container relative z-10">
        <div className="max-w-3xl mx-auto text-center flex flex-col items-center">
          {/* Trust Rating Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-100 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 text-amber-900 dark:text-amber-300 text-xs sm:text-sm font-medium mb-6 shadow-sm">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span>৪.৯/৫ রেটিং • ৫,০০০+ পরিবারে বিশ্বস্ত</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
            প্রকৃতির সেরা উপহার, <br className="hidden sm:inline" />
            সরাসরি মৌচাক থেকে <span className="text-amber-600 dark:text-amber-400">আপনার ঘরে</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-5 text-base sm:text-lg text-zinc-600 dark:text-zinc-300 max-w-2xl leading-relaxed">
            সুন্দরবন ও গ্রামবাংলার প্রাকৃতিক মৌচাক থেকে সংগৃহীত ১০০% ভেজালমুক্ত, ল্যাব-টেস্টেড এবং কাঁচা মধু। কোনো হিটিং বা প্রসেসিং ছাড়াই খাঁটি স্বাদের নিশ্চয়তা।
          </p>

          {/* Key Quick Bullet Points */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 font-medium">
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
              ২৪-৪৮ ঘণ্টায় হোম ডেলিভারি
            </span>
          </div>

          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
            <LocalizedClientLink
              href="/store"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl font-semibold text-white bg-amber-600 hover:bg-amber-700 dark:bg-amber-500 dark:hover:bg-amber-600 shadow-lg shadow-amber-500/25 transition-all duration-200 transform hover:-translate-y-0.5 active:translate-y-0 text-base"
            >
              <span>সকল পণ্য দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>

            <a
              href="https://wa.me/8801700000000?text=Hello,%20I%20want%20to%20order%20pure%20honey"
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
