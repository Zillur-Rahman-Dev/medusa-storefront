import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, ShieldCheck, Sparkles, Award } from "lucide-react"

export default function PanoramaBanner() {
  return (
    <section className="py-6 sm:py-10 bg-zinc-50 dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-stone-900 via-zinc-900 to-stone-900 text-white p-8 sm:p-12 lg:p-14 border border-zinc-800 shadow-xl">
          {/* Ambient Warm Glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <Sparkles className="w-3.5 h-3.5" />
                <span>মৌচাকের অকৃত্রিম স্বাদ ও ঘ্রাণ</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-black tracking-tight text-white leading-tight">
                সুন্দরবনের ম্যানগ্রোভ থেকে সরাসরি আপনার টেবিলে
              </h2>

              <p className="text-xs sm:text-base text-zinc-300 leading-relaxed">
                কোনো প্রকার রাসায়নিক প্রসেসিং, হিটিং কিংবা কৃত্রিম সুগার সিরাপ ছাড়াই প্রতিটি ফোঁটা কাঁচা মধুর শতভাগ মৌলিক পুষ্টির সম্পূর্ণ নিশ্চয়তা।
              </p>

              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-amber-200 font-semibold">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  ১০০% ক্যাশ অন ডেলিভারি
                </span>
                <span className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-400" />
                  ফুড-গ্রেড বায়ুরোধী কাচের জার
                </span>
              </div>
            </div>

            <LocalizedClientLink
              href="/store"
              className="py-3.5 px-7 rounded-2xl font-black text-sm bg-amber-500 hover:bg-amber-400 text-zinc-950 shadow-lg hover:shadow-xl transition-all duration-200 active:scale-[0.98] flex items-center gap-2 shrink-0"
            >
              <span>সকল ফুলের মধু দেখুন</span>
              <ArrowRight className="w-4 h-4" />
            </LocalizedClientLink>
          </div>
        </div>
      </div>
    </section>
  )
}
