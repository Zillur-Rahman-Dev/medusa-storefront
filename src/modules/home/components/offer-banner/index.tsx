import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ArrowRight, Gift, Percent, ShieldCheck, Truck } from "lucide-react"

export default function OfferBanner() {
  return (
    <section className="py-12 sm:py-16 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-amber-600 via-amber-500 to-amber-700 text-white p-8 sm:p-12 lg:p-14 shadow-xl">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-black/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
            <div className="max-w-2xl space-y-4">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-white/20 backdrop-blur-md text-white border border-white/30">
                <Gift className="w-4 h-4" />
                <span>সীমিত সময়ের স্পেশাল অফার</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
                আপনার প্রথম কেনাকাটায় উপভোগ করুন সরাসরি ১০% অতিরিক্ত ছাড়!
              </h2>

              <p className="text-sm sm:text-base text-amber-50/90 leading-relaxed">
                কুপন কোড ব্যবহার করে সংগ্রহ করুন সুন্দরবনের খাঁটি খলিশা, কালোজিরা কিংবা সরিষা ফুলের প্রাকৃতিক মধু। ক্যাশ অন ডেলিভারিতে নিশ্চিন্তে গ্রহণ করুন।
              </p>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-4 pt-2 text-xs sm:text-sm font-medium text-amber-100">
                <div className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-white" />
                  <span>সারা দেশে ক্যাশ অন ডেলিভারি</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-white" />
                  <span>১০০% মান ফেরতের নিশ্চয়তা</span>
                </div>
              </div>
            </div>

            {/* Promo Code Box & Action */}
            <div className="flex flex-col sm:flex-row lg:flex-col items-start sm:items-center lg:items-end gap-4 shrink-0">
              <div className="flex items-center gap-3 p-3 sm:p-4 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 shadow-inner">
                <div className="w-10 h-10 rounded-xl bg-white text-amber-700 flex items-center justify-center font-bold">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-amber-100 font-medium">
                    কুপন কোড
                  </div>
                  <div className="text-lg sm:text-xl font-mono font-extrabold text-white tracking-widest">
                    PURE10
                  </div>
                </div>
              </div>

              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl font-bold text-sm bg-zinc-950 text-white hover:bg-zinc-800 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <span>অফারটি এখনই নিন</span>
                <ArrowRight className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
