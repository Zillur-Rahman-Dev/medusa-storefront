"use client"

import { useState } from "react"
import { Check, HeartPulse, Info, ShieldCheck, Sparkles, Droplets } from "lucide-react"

type HoneyDetail = {
  id: string
  name: string
  source: string
  color: string
  texture: string
  taste: string
  bestFor: string
  healthBenefits: string[]
  icon: string
}

const honeyDetails: HoneyDetail[] = [
  {
    id: "kholisha",
    name: "খলিশা ও সুন্দরবনের অন্যান্য ফুল",
    source: "সুন্দরবনের গভীর ম্যানগ্রোভ বন (খলিশা, গরান, পশুর ফুল)",
    color: "স্বচ্ছ হালকা অ্যাম্বার / লালচে সোনালী",
    texture: "তরল, মসৃণ ও সহজে জমে না",
    taste: "অত্যন্ত মিষ্টি, মৃদু ঝাঁঝ ও অনন্য প্রাকৃতিক বুনো সুবাস",
    bestFor: "উন্নত রুচি, দৈনন্দিন শক্তি ও পরিবারের সেরা পুষ্টি",
    healthBenefits: [
      "উচ্চমাত্রার প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও এনজাইম",
      "শারীরিক দুর্বলতা দূর করে দ্রুত শক্তি জোগায়",
      "হজমক্রিয়া উন্নত করে এবং রোগ প্রতিরোধ ক্ষমতা বৃদ্ধি করে",
    ],
    icon: "🌸",
  },
  {
    id: "wild-forest",
    name: "বনের খাঁটি মধু (সুন্দরবনের মধু)",
    source: "গভীর বনের প্রাকৃতিক পাহাড়ি ও ম্যানগ্রোভ মৌচাক",
    color: "গাঢ় লালচে বাদামী",
    texture: "গাঢ় ঘন ও সান্দ্র",
    taste: "তীব্র সুবাসিত ও বুনো প্রকৃতির মৌলিক স্বাদ",
    bestFor: "অকৃত্রিম কাঁচা মধুর আসল স্বাদ ও শক্তি বৃদ্ধি",
    healthBenefits: [
      "রক্তে হিমোগ্লোবিন বৃদ্ধিতে সহায়ক",
      "প্রাকৃতিক অ্যান্টিব্যাকটেরিয়াল ও অ্যান্টিফাঙ্গাল উপাদান",
      "ক্লান্তি ও মানসিক অবসাদ দূর করতে কার্যকরী",
    ],
    icon: "🌳",
  },
  {
    id: "mustard",
    name: "সরিষা ফুলের মধু",
    source: "টাঙ্গাইল, মানিকগঞ্জ ও নাটোরের হলুদ সরিষা ফুল",
    color: "হালকা সোনালী হলুদ (জমে গেলে হালকা সাদাটে)",
    texture: "শীতকালে প্রাকৃতিকভাবে ঘি বা ক্রিমের মতো জমে যায়",
    taste: "খুব মিষ্টি ও মাখনের মতো মসৃণ টেক্সচার",
    bestFor: "চা, রুটি বা টোস্টে স্প্রেড হিসেবে এবং নিয়মিত ব্যবহারের জন্য",
    healthBenefits: [
      "শীতকালীন সর্দি, কাশি ও গলার খুসখুস দূর করে",
      "শরীরের তাপ বৃদ্ধি করে এবং উষ্ণতা বজায় রাখে",
      "শিশুদের দ্রুত শক্তি যোগাতে অত্যন্ত কার্যকর",
    ],
    icon: "🌼",
  },
  {
    id: "litchi",
    name: "লিচু ফুলের মধু",
    source: "দিনাজপুর, রাজশাহী ও নাটোরের লিচু বাগান",
    color: "স্বর্ণালী উজ্জ্বল অ্যাম্বার",
    texture: "হালকা পাতলা ও মিষ্টি তরল",
    taste: "চমৎকার ফ্রুটি সুবাস ও মিষ্টি স্বাদ (কোনো ঝাঁঝ নেই)",
    bestFor: "ছোট বাচ্চাদের খাওয়ানোর জন্য এবং মিষ্টি হিসেবে",
    healthBenefits: [
      "শিশুদের খাওয়ার অরুচি দূর করে ও ক্ষুধা বাড়ায়",
      "সহজে হজম হয় এবং পেটের সমস্যা সৃষ্টি করে না",
      "ভিটামিন-সি ও খনিজের ভালো প্রাকৃতিক উৎস",
    ],
    icon: "🍯",
  },
  {
    id: "black-seed",
    name: "কালোজিরা ফুলের মধু",
    source: "মাদারীপুর ও ফরিদপুরের কালোজিরা ক্ষেতের ফুল",
    color: "গাঢ় বাদামী থেকে প্রায় কালো",
    texture: "ঘন ও দীর্ঘদিন তরল থাকে",
    taste: "ঝাঁঝালো, তীব্র ঔষধি গন্ধ ও বিশেষ স্বাদ",
    bestFor: "রোগ প্রতিরোধ ক্ষমতা ও সর্দি-কাশি-অ্যাজমা উপশম",
    healthBenefits: [
      "কালোজিরার বিশ্বখ্যাত রোগপ্রতিরোধী উপাদানে সমৃদ্ধ",
      "শ্বাসকষ্ট ও দীর্ঘমেয়াদী কাশির উপশমে অত্যন্ত কার্যকর",
      "রক্তচাপ ও সুগার নিয়ন্ত্রণে প্রাকৃতিক সহায়ক",
    ],
    icon: "🌿",
  },
  {
    id: "coriander",
    name: "ধনে ফুলের মধু",
    source: "ফরিদপুর ও শরীয়তপুরের ধনে ক্ষেতের সাদা ফুল",
    color: "হালকা অ্যাম্বার সোনালী",
    texture: "মধ্যম ঘন, কিছুটা হালকা দানাদার হতে পারে",
    taste: "মৃদু ঝাঁঝ ও স্পাইসি মিষ্টি ঘ্রাণ",
    bestFor: "পেটের গ্যাস, অ্যাসিডিটি ও হজমের সমস্যায়",
    healthBenefits: [
      "গ্যাস্ট্রিক ও অ্যাসিডিটির উপশমে মহৌষধ হিসেবে পরিচিত",
      "পাকস্থলীর কার্যক্ষমতা বাড়াতে বিশেষভাবে সাহায্য করে",
      "মুখের দুর্গন্ধ দূর করে এবং রুচি বাড়ায়",
    ],
    icon: "🌱",
  },
  {
    id: "hill-wild",
    name: "পাহাড়ে মৌচাকের মধু",
    source: "বান্দরবান ও খাগড়াছড়ির বুনো পাহাড়ের বড় মৌচাক",
    color: "গাঢ় লালচে সোনালী",
    texture: "অত্যন্ত ঘন ও প্রাকৃতিক মোমযুক্ত কাঁচা মধু",
    taste: "বহু পাহাড়ি ফুলের মিশ্রণে তৈরি অনন্য স্বাদ",
    bestFor: "প্রাকৃতিক অ্যান্টিঅক্সিডেন্ট ও শারীরিক সহনশীলতা বৃদ্ধি",
    healthBenefits: [
      "পাহাড়ি শত ভেষজ উদ্ভিদের পরাগ থাকায় পুষ্টিমান সর্বোচ্চ",
      "হাড়ের জোর ও মাংসপেশির দৃঢ়তা বৃদ্ধিতে সহায়ক",
      "ত্বক উজ্জ্বল করতে ও বয়সের ছাপ প্রতিরোধে দারুণ",
    ],
    icon: "⛰️",
  },
  {
    id: "babla-kool",
    name: "বাবলা ও কুল (বরই) ফুলের মধু",
    source: "রাজশাহী ও বরেন্দ্র অঞ্চলের কুল ও বাবলার বাগান",
    color: "গাঢ় তামাটে লালচে বর্ণ",
    texture: "ঘন সান্দ্র ও সহজে নষ্ট না হওয়া টেক্সচার",
    taste: "গাঢ় মিষ্টি ও আকর্ষণীয় নিজস্ব সুবাস",
    bestFor: "লিভারের সুরক্ষা ও শারীরিক রক্তস্বল্পতা দূর করতে",
    healthBenefits: [
      "রক্তস্বল্পতা দূর করে শরীরে নতুন রক্তকণিকা তৈরিতে সাহায্য করে",
      "লিভার ও কিডনির স্বাভাবিক কার্যকারিতায় সহায়তা করে",
      "উচ্চ শক্তির প্রাকৃতিক যোগানদাতা",
    ],
    icon: "🍒",
  },
  {
    id: "sunflower-kusum",
    name: "কুসুম, তিসি ও সূর্যমুখী ফুল",
    source: "উপকূলীয় চরাঞ্চলের সূর্যমুখী ও কুসুম ক্ষেত",
    color: "উজ্জ্বল কাঁচা সোনালী বর্ণ",
    texture: "স্বচ্ছ ও তেলজাতীয় প্রাকৃতিক আর্দ্রতাযুক্ত",
    taste: "মৃদু মিষ্টি ও হালকা স্নিগ্ধ অনুভূতি",
    bestFor: "হৃদযন্ত্রের সুরক্ষা ও কোলেস্টেরল নিয়ন্ত্রণে",
    healthBenefits: [
      "হার্ট ভালো রাখতে এবং ক্ষতিকর চর্বি কমাতে সহায়ক",
      "ভিটামিন-ই সমৃদ্ধ হওয়ায় ত্বক ও চুলের পুষ্টি জোগায়",
      "শরীরের প্রদাহ কমাতে সাহায্য করে",
    ],
    icon: "🌻",
  },
  {
    id: "wildflower",
    name: "বুনো ফুলের মধু",
    source: "গ্রামবাংলার উন্মুক্ত মাঠ ও বুনো লতাপাতা",
    color: "সোনালী বাদামী",
    texture: "প্রাকৃতিক কাঁচা তরল",
    taste: "নানা ফুলের পরাগের সম্মিলিত মিষ্টি স্বাদ",
    bestFor: "সবার জন্য প্রতিদিন সকালে কুসুম গরম পানিতে খাওয়ার জন্য",
    healthBenefits: [
      "সকালে লেবু মধুর সাথে মেদ কমাতে অত্যন্ত সহায়ক",
      "ঘুমের সমস্যা ও অনিদ্রা দূর করতে সাহায্য করে",
      "শরীরের সার্বিক ইমিউনিটি বাড়ায়",
    ],
    icon: "🌾",
  },
]

export default function HoneyGuide() {
  const [selectedId, setSelectedId] = useState<string>("kholisha")
  const activeHoney = honeyDetails.find((h) => h.id === selectedId) || honeyDetails[0]

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
            <HeartPulse className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>স্বাস্থ্য নির্দেশিকা ও সঠিক মধু নির্বাচন</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            কোন ফুলের মধুর কী বৈশিষ্ট্য ও উপকারিতা?
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            মৌমাছি যে ফুল থেকে নেক্টার সংগ্রহ করে, মধুর রং, স্বাদ এবং ঔষধি গুণাগুণ ঠিক সে ফুলের বৈশিষ্ট্যের ওপর নির্ভর করে। নিচের তালিকা থেকে আপনার পছন্দের মধুটির বিস্তারিত জেনে নিন।
          </p>
        </div>

        {/* Tab Buttons (Horizontal scrollable on mobile) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 scrollbar-none mb-8 justify-start lg:justify-center">
          {honeyDetails.map((h) => {
            const isSelected = h.id === selectedId
            return (
              <button
                key={h.id}
                type="button"
                onClick={() => setSelectedId(h.id)}
                className={`whitespace-nowrap px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                  isSelected
                    ? "bg-amber-600 text-white border-amber-600 shadow-md shadow-amber-500/20"
                    : "bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-200/60 dark:hover:bg-zinc-800"
                }`}
              >
                <span>{h.icon}</span>
                <span>{h.name}</span>
              </button>
            )
          })}
        </div>

        {/* Active Honey Details Card */}
        <div className="rounded-3xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 p-6 sm:p-10 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Column (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 dark:bg-amber-500/20 flex items-center justify-center text-4xl shadow-inner">
                  {activeHoney.icon}
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-extrabold text-zinc-900 dark:text-zinc-100">
                    {activeHoney.name}
                  </h3>
                  <p className="text-xs sm:text-sm text-amber-700 dark:text-amber-400 font-medium flex items-center gap-1.5 mt-1">
                    <Droplets className="w-4 h-4" />
                    <span>{activeHoney.source}</span>
                  </p>
                </div>
              </div>

              {/* Characteristic Attributes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-zinc-400 font-medium">রং ও বর্ণ</div>
                  <div className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5">
                    {activeHoney.color}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60">
                  <div className="text-zinc-400 font-medium">টেক্সচার ও স্বভাব</div>
                  <div className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5">
                    {activeHoney.texture}
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/60 sm:col-span-2">
                  <div className="text-zinc-400 font-medium">স্বাদ ও সুবাস</div>
                  <div className="text-zinc-900 dark:text-zinc-200 font-semibold mt-0.5">
                    {activeHoney.taste}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60">
                <span className="text-[11px] font-bold text-amber-800 dark:text-amber-300 uppercase tracking-wider block">
                  কার জন্য সবচেয়ে উপযুক্ত:
                </span>
                <span className="text-xs sm:text-sm font-semibold text-zinc-900 dark:text-zinc-100 mt-1 block">
                  {activeHoney.bestFor}
                </span>
              </div>
            </div>

            {/* Right Column (7 cols): Health Benefits */}
            <div className="lg:col-span-7 space-y-6">
              <div>
                <h4 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                  <span>প্রধান স্বাস্থ্য উপকারিতাসমূহ</span>
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  শতভাগ অপরিশোধিত ও কাঁচা মধু হওয়ায় এ মধুর সক্রিয় খাদ্যগুণ সম্পূর্ণ অক্ষত থাকে।
                </p>
              </div>

              <div className="space-y-3">
                {activeHoney.healthBenefits.map((benefit, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/70 dark:border-zinc-800/70"
                  >
                    <div className="w-6 h-6 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                    <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 font-medium leading-relaxed">
                      {benefit}
                    </p>
                  </div>
                ))}
              </div>

              {/* Order Action Banner */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white shadow-md">
                <div>
                  <h5 className="font-bold text-sm sm:text-base">
                    {activeHoney.name} সংগ্রহ করতে চান?
                  </h5>
                  <p className="text-xs text-amber-100">
                    সারা দেশে ক্যাশ অন ডেলিভারিতে কাচের জারে দ্রুত ডেলিভারি নিন।
                  </p>
                </div>

                <a
                  href={`https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20${encodeURIComponent(activeHoney.name)}%20অর্ডার%20করতে%20চাই।`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-white text-zinc-950 hover:bg-zinc-100 transition-colors shrink-0 text-center shadow-sm"
                >
                  সরাসরি অর্ডার করুন →
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
