import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShieldCheck, Sparkles, HeartHandshake, Trees, ArrowRight, Award, CheckCircle } from "lucide-react"

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে • PURE HONEY",
  description:
    "সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে শতভাগ খাঁটি মধু ও প্রাকৃতিক খাবার আপনার পরিবারে পৌঁছে দেওয়ার গল্প।",
}

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-zinc-200/80 dark:border-zinc-850">
        <div className="content-container text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>প্রকৃতির বিশুদ্ধ উপহার</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            বিশুদ্ধতার সন্ধানে আমাদের আত্মিক যাত্রা
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            ভেজাল ও কৃত্রিম চিনির ভিড়ে আমরা বিশ্বাস করি—প্রকৃতি যেভাবে দেয়, ঠিক সেভাবেই খাঁটি খাদ্য মানুষের কাছে পৌঁছানো উচিত। কোনো আপস ছাড়া, কোনো কেমিক্যাল ছাড়া।
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 sm:py-24">
        <div className="content-container max-w-4xl space-y-12">
          <div className="space-y-6 text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              কীভাবে শুরু হলো আমাদের পথচলা?
            </h2>
            <p>
              বর্তমান বাজারে খাঁটি মধু পাওয়া এক বিরাট চ্যালেঞ্জ। অধিকাংশ প্রক্রিয়াজাত মধুই উচ্চ তাপমাত্রায় ফুটিয়ে ফিল্টার করা হয়, যার ফলে মধুর ভেতরে থাকা সমস্ত প্রয়োজনীয় এনজাইম, পোলেন এবং অ্যান্টিঅক্সিডেন্ট নষ্ট হয়ে যায়। অনেক ক্ষেত্রে চিনির সিরাপ মিশিয়ে কৃত্রিম ঘন মধু তৈরি করা হয়।
            </p>
            <p>
              এই সমস্যার স্থায়ী সমাধানের লক্ষ্যে <strong>PURE HONEY</strong> এর যাত্রা শুরু। সুন্দরবনের গভীর ম্যানগ্রোভ এবং গ্রামবাংলার বিশ্বস্ত মৌয়ালদের সাথে সরাসরি সম্পৃক্ত হয়ে আমরা নিশ্চিত করি প্রতিটি ফোঁটা মধুর মৌলিক খাঁটি গুণ।
            </p>
          </div>

          {/* Core Values 4 Grid */}
          <div className="pt-6">
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              আমাদের ৪টি মূল স্তম্ভ
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Trees className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  সরাসরি প্রাকৃতিক উৎস
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  কোনো বাণিজ্যিক মধ্যস্বত্বভোগী ছাড়াই সরাসরি মৌচাক থেকে সংগ্রহ করে দ্রুত কোল্ড ফিল্ট্রেশন করা হয়।
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  শূন্য চিনি ও কেমিক্যাল
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  কৃত্রিম সুগার সিরাপ, প্রিজারভেটিভ বা বাড়তি রঙমুক্ত ১০০% কাঁচা (Raw) ও অপরিবর্তিত মধুর নিশ্চয়তা।
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <Award className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  কাচের জারে নিরাপদ প্যাকেজিং
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  প্লাস্টিকের মাইক্রো-কণা ও ক্ষতিকর কেমিক্যাল প্রতিরোধে আমরা ব্যবহার করি ফুড-গ্রেড শক্ত বায়ুরোধী কাচের জার।
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 space-y-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <HeartHandshake className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base sm:text-lg text-zinc-900 dark:text-zinc-100">
                  মৌয়ালদের ন্যায্য মূল্যায়ন
                </h4>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  সুন্দরবনের সাহসী মৌয়াল ভাইদের ন্যায্য পারিশ্রমিক ও নিরাপদ মৌমাছি চাষে আমরা অঙ্গীকারবদ্ধ।
                </p>
              </div>
            </div>
          </div>

          {/* Future Vision */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              আমাদের ভবিষ্যৎ পরিকল্পনা
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              শুধু মধু নয়, সকল প্রকার খাঁটি প্রাকৃতিক পণ্যের বিশ্বস্ত প্ল্যাটফর্ম
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              আমরা মধু দিয়ে যাত্রা শুরু করলেও খুব শীঘ্রই দেশি গরুর খাঁটি দানাদার গাওয়া ঘি, কোল্ড প্রেসড ঘানিভাঙা সরিষার তেল, প্রিমিয়াম কাজু-কাঠবাদাম, খাঁটি মশলা এবং স্বাস্থ্যকর সুপারফুড নিয়ে আসছি। আমাদের একমাত্র লক্ষ্য—একটি সুস্থ ও নির্ভরযোগ্য অর্গানিক লাইফস্টাইল গড়ে তোলা।
            </p>
            <div className="pt-2">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
              >
                <span>আমাদের পণ্যসমূহ দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
