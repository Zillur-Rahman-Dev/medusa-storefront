import { Metadata } from "next"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShieldCheck, Sparkles, HeartHandshake, Trees, ArrowRight, Award, Droplets } from "lucide-react"

export const metadata: Metadata = {
  title: "আমাদের সম্পর্কে ও মধুর গল্প • PURE HONEY",
  description:
    "সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে ১০টি অনন্য ফুলের খাঁটি মধু আপনার টেবিলে পৌঁছে দেওয়ার গল্প।",
}

const flowers = [
  { name: "খলিশা ও সুন্দরবনের অন্যান্য ফুল", desc: "সুন্দরবনের গভীর ম্যানগ্রোভের অমূল্য উপহার" },
  { name: "বনের খাঁটি মধু", desc: "গভীর বুনো অরণ্যের প্রাকৃতিক মৌচাকের কাঁচা মধু" },
  { name: "সরিষা ফুলের মধু", desc: "টাঙ্গাইল ও নাটোরের শীতে প্রাকৃতিকভাবে জমা ক্রিমি মধু" },
  { name: "লিচু ফুলের মধু", desc: "দিনাজপুরের সুমিষ্ট ও সুবাসিত মিষ্টি মধু" },
  { name: "কালোজিরা ফুলের মধু", desc: "মাদারীপুরের গাঢ়, ঝাঁঝালো ও ঔষধি মহাগুণসম্পন্ন মধু" },
  { name: "ধনে ফুলের মধু", desc: "ফরিদপুরের স্পাইসি সুবাস ও হজমবান্ধব মধু" },
  { name: "পাহাড়ে মৌচাকের মধু", desc: "বান্দরবানের দুর্গম পাহাড়ের বুনো শত ফুলের মধু" },
  { name: "বাবলা ও কুল (বরই) ফুলের মধু", desc: "রাজশাহীর বরেন্দ্র অঞ্চলের লালচে সোনালী বরই মধু" },
  { name: "কুসুম, তিসি ও সূর্যমুখী ফুল", desc: "স্বর্ণালী আভা ও উচ্চ অ্যান্টিঅক্সিডেন্টযুক্ত মধু" },
  { name: "বুনো ফুলের মধু", desc: "গ্রামবাংলার উন্মুক্ত মাঠ ও প্রকৃতির বিচিত্র ফুলের নির্যাস" },
]

export default function AboutPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Hero Header */}
      <section className="relative py-20 sm:py-28 overflow-hidden bg-gradient-to-b from-amber-500/10 via-amber-500/5 to-transparent border-b border-zinc-200/80 dark:border-zinc-850">
        <div className="content-container text-center max-w-3xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>প্রকৃতির খাঁটি ফুল ও বুনো মৌচাকের গল্প</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
            ১০টি অনন্য ফুলের খাঁটি মধু, একটি বিশ্বস্ত প্রতিশ্রুতি
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-600 dark:text-zinc-400 leading-relaxed">
            ভেজাল ও কৃত্রিম চিনির ভিড়ে আমরা বিশ্বাস করি—প্রকৃতি যেভাবে দেয়, ঠিক সেভাবেই কাঁচা মধু মানুষের কাছে পৌঁছানো উচিত। কোনো হিটিং ছাড়া, কোনো সুগার ফিডিং ছাড়া।
          </p>
        </div>
      </section>

      {/* Brand Story Section */}
      <section className="py-16 sm:py-24">
        <div className="content-container max-w-4xl space-y-14">
          <div className="space-y-6 text-zinc-700 dark:text-zinc-300 text-base sm:text-lg leading-relaxed">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-100">
              কীভাবে শুরু হলো আমাদের পথচলা?
            </h2>
            <p>
              বর্তমান বাজারে খাঁটি মধু পাওয়া এক বিরাট চ্যালেঞ্জ। অধিকাংশ প্রক্রিয়াজাত মধুই উচ্চ তাপমাত্রায় ফুটিয়ে ফিল্টার করা হয়, যার ফলে মধুর ভেতরে থাকা সমস্ত প্রয়োজনীয় এনজাইম, পোলেন এবং অ্যান্টিঅক্সিডেন্ট নষ্ট হয়ে যায়।
            </p>
            <p>
              এই সমস্যার স্থায়ী সমাধানের লক্ষ্যে <strong>PURE HONEY</strong> এর যাত্রা শুরু। আমরা ঋতুভিত্তিক ফুলের ফোটার ক্যালেন্ডার অনুযায়ী দেশের সেরা অঞ্চল থেকে নির্দিষ্ট ফুলের মধু সংগ্রহ করি—যেমন শীতে সরিষা, বসন্তে খলিশা ও লিচু, বর্ষা পরবর্তী সময়ে পাহাড়ি মৌচাক ও কালোজিরা ফুল।
            </p>
          </div>

          {/* 10 Flowers Showcase Box */}
          <div className="p-6 sm:p-8 rounded-3xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 space-y-5">
            <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-bold text-lg">
              <Droplets className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              <span>আমাদের সংগৃহীত ১০টি বিশেষ ফুলের মধু</span>
            </div>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              আমরা কোনো সাধারণ মিশ্রণ তৈরি করি না। প্রতিটি ফুলের নেক্টারের নিজস্ব স্বাদ ও বৈশিষ্ট্য অক্ষত রাখা হয়:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              {flowers.map((fl, i) => (
                <div
                  key={i}
                  className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70 text-xs sm:text-sm"
                >
                  <div className="font-bold text-zinc-900 dark:text-zinc-100">
                    {i + 1}. {fl.name}
                  </div>
                  <div className="text-zinc-500 dark:text-zinc-400 text-xs mt-0.5">
                    {fl.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Core Values 4 Grid */}
          <div>
            <h3 className="text-xl sm:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-6">
              আমাদের ৪টি অনড় অঙ্গীকার
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
                  সুন্দরবনের ম্যানগ্রোভ ও বিশ্বস্ত মৌয়ালদের কাছ থেকে কোনো মধ্যস্বত্বভোগী ছাড়া সরাসরি সংগ্রহ।
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
                  কৃত্রিম সুগার সিরাপ, প্রিজারভেটিভ বা রঙমুক্ত ১০০% কাঁচা (Raw) ও অপরিবর্তিত মধুর নিশ্চয়তা।
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
                  প্লাস্টিকের মাইক্রো-কণা ও ক্ষতিকর রাসায়নিক প্রভাব এড়াতে ফুড-গ্রেড বায়ুরোধী কাচের জার।
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
                  সুন্দরবনের সাহসী মৌয়াল ভাইদের ন্যায্য পারিশ্রমিক ও টেকসই মৌমাছি সংরক্ষণে আমরা বদ্ধপরিকর।
                </p>
              </div>
            </div>
          </div>

          {/* Future Expansion Vision */}
          <div className="p-8 sm:p-10 rounded-3xl bg-zinc-900 text-white dark:bg-zinc-900/90 border border-zinc-800 space-y-4">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">
              আমাদের ভবিষ্যৎ ভিশন
            </span>
            <h3 className="text-xl sm:text-3xl font-extrabold tracking-tight">
              বর্তমান খাঁটি মধু থেকে ভবিষ্যৎ সুস্থ প্রাকৃতিক জীবনধারা
            </h3>
            <p className="text-sm sm:text-base text-zinc-300 leading-relaxed">
              আপাতত আমরা এই ১০টি খাঁটি মধু নিয়ে যাত্রা শুরু করেছি যাতে মানের সাথে কোনো আপস না হয়। পরবর্তীতে আপনাদের ভালোবাসায় আমাদের প্ল্যাটফর্মে যুক্ত হবে দেশি গাওয়া ঘি, কোল্ড প্রেসড তেল, কাজু-আমন্ড বাদাম ও খাঁটি মসলা।
            </p>
            <div className="pt-2">
              <LocalizedClientLink
                href="/store"
                className="inline-flex items-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm bg-amber-500 text-zinc-950 hover:bg-amber-400 transition-colors"
              >
                <span>আমাদের মধুর কালেকশন দেখুন</span>
                <ArrowRight className="w-4 h-4" />
              </LocalizedClientLink>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
