"use client"

import { useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, ShieldCheck, Sparkles, PhoneCall, Award, CheckCircle2 } from "lucide-react"
import QuickOrderModal from "@modules/common/components/quick-order-modal"

export default function Hero() {
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false)

  return (
    <section className="py-4 sm:py-6 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* GhorerBazar Exact Dual-Banner Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* Left Banner (8 Cols - Main Hero Banner) */}
          <div className="lg:col-span-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 text-white p-6 sm:p-10 lg:p-12 shadow-md flex flex-col justify-between min-h-[340px] sm:min-h-[400px]">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 -mr-16 -mt-16 w-72 h-72 rounded-full bg-white/15 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-16 -mb-16 w-72 h-72 rounded-full bg-black/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-extrabold bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                <span>সবার জন্য সেরা • ১০০% খাঁটি কাঁচা মধু</span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-[1.15] text-white">
                প্রকৃতির খাঁটি মধু <br />
                <span className="text-amber-100">সরাসরি মৌচাক থেকে</span>
              </h1>

              <p className="text-xs sm:text-base text-amber-50/95 leading-relaxed">
                সুন্দরবনের খলিশা, গ্রামবাংলার সরিষা, কালোজিরা, লিচু, ধনে ও পাহাড়ি বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধু পৌঁছে দিচ্ছি সারা বাংলাদেশে।
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-amber-100 font-semibold">
                <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  জিরো সুগার ফিডিং
                </span>
                <span className="flex items-center gap-1.5 bg-black/10 px-2.5 py-1 rounded-lg">
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  ক্যাশ অন ডেলিভারি
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="relative z-10 mt-6 pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={() => setIsQuickOrderOpen(true)}
                className="py-3 px-6 sm:px-8 rounded-2xl font-black text-sm bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center gap-2"
              >
                <span>এখনই অর্ডার করুন</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <LocalizedClientLink
                href="/store"
                className="py-3 px-5 sm:px-6 rounded-2xl font-bold text-sm bg-white/20 hover:bg-white/30 backdrop-blur-md text-white border border-white/40 transition-colors"
              >
                সকল মধু দেখুন
              </LocalizedClientLink>
            </div>
          </div>

          {/* Right Banner (4 Cols - Quality & Purity Card matching screenshot) */}
          <div className="lg:col-span-4 relative overflow-hidden rounded-3xl bg-zinc-900 text-white p-6 sm:p-8 shadow-md flex flex-col justify-between border border-zinc-800">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-400">
                <Award className="w-4 h-4" />
                <span>বিশুদ্ধতার নিশ্চয়তা</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white leading-snug">
                যে কারণে আমাদের মধু সবচেয়ে খাঁটি
              </h2>

              <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-300">
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-black">✓</span>
                  <span><strong>কোল্ড ফিল্ট্রেশন:</strong> কোনো তাপ বা হিটিং ছাড়াই ছাঁকা হয়</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-black">✓</span>
                  <span><strong>এনজাইম অক্ষত:</strong> প্রাকৃতিক পরাগ ও অ্যান্টিঅক্সিডেন্ট সুরক্ষিত</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-black">✓</span>
                  <span><strong>ফুড-গ্রেড কাচের জার:</strong> প্লাস্টিকের ক্ষতিকর রাসায়নিকমুক্ত</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-amber-400 font-black">✓</span>
                  <span><strong>টেস্ট করে পেমেন্ট:</strong> পার্সেল খুলে দেখে মূল্য পরিশোধের সুবিধা</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 pt-4 border-t border-zinc-800 flex items-center justify-between">
              <div>
                <div className="text-[11px] text-zinc-400">হোয়াটসঅ্যাপে দ্রুত অর্ডার</div>
                <div className="text-sm font-bold text-emerald-400">+৮৮০ ১৭১১-XXXXXX</div>
              </div>
              <a
                href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20খাঁটি%20মধু%20অর্ডার%20করতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-colors shadow-sm"
              >
                <PhoneCall className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Quick COD Order Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={{
          title: "সুন্দরবনের খাঁটি খলিশা ফুলের মধু (১ কেজি কাচের জার)",
          price: 1350,
          size: "১ কেজি",
        }}
      />
    </section>
  )
}
