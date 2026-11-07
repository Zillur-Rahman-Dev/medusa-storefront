"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import { FileText, Truck, ShieldCheck, Sparkles, CheckCircle2, RotateCcw } from "lucide-react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "shipping" | "purity" | "usage">("info")

  const tabs = [
    {
      id: "info",
      label: "পণ্যের বিবরণ ও তথ্য",
      sublabel: "Product Information",
      icon: FileText,
    },
    {
      id: "shipping",
      label: "ডেলিভারি ও রিটার্ন পলিসি",
      sublabel: "Shipping & Returns",
      icon: Truck,
    },
    {
      id: "purity",
      label: "বিশুদ্ধতার নিশ্চয়তা",
      sublabel: "Purity & Quality",
      icon: ShieldCheck,
    },
    {
      id: "usage",
      label: "খাওয়ার নিয়ম ও সংরক্ষণ",
      sublabel: "Usage & Storage",
      icon: Sparkles,
    },
  ]

  return (
    <div className="w-full">
      {/* Horizontal Tabs Navigation Header */}
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-2 sm:pb-3">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all duration-200 shrink-0 ${
                  isActive
                    ? "bg-emerald-700 text-white shadow-md shadow-emerald-700/20"
                    : "bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-emerald-600 dark:text-emerald-400"}`} />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels Content */}
      <div className="py-6 sm:py-8">
        {/* 1. Product Information Tab */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-fade-in">
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <p className="whitespace-pre-line text-sm sm:text-base">
                {product.description ||
                  "সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে সরাসরি সংগৃহীত ১০০% খাঁটি কাঁচা মধু। কোনো প্রকার সুগার ফিডিং, কেমিক্যাল বা কৃত্রিম তাপ ছাড়া প্রাকৃতিক পুষ্টি ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।"}
              </p>
            </div>

            {/* Specifications Table */}
            <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-zinc-50/60 dark:bg-zinc-900/50">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">পণ্যের ধরন</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">১০০% কাঁচা প্রাকৃতিক মধু</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">উৎস অঞ্চল</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">সুন্দরবন ও গ্রামবাংলা</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">প্যাকেজিং জার</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">ফুড-গ্রেড বায়ুরোধী কাচ</span>
                  </div>
                </div>

                <div className="p-4 sm:p-5 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">ভেজাল / চিনি</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">০% (সম্পূর্ণ ভেজালমুক্ত)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">ফিল্ট্রেশন পদ্ধতি</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">আনহিটেড কোল্ড ফিল্টার</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-500 dark:text-zinc-400">শেলফ লাইফ (মেয়াদ)</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">প্রাকৃতিকভাবে অনির্দিষ্টকাল</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 2. Shipping & Returns Tab */}
        {activeTab === "shipping" && (
          <div className="space-y-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {/* Delivery Details */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                  <Truck className="w-5 h-5" />
                  <span>হোম ডেলিভারি ও সময়সীমা</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>ঢাকা সিটির ভেতরে:</strong> ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ডেলিভারি চার্জ মাত্র <strong>৳৭০</strong>।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>ঢাকার বাইরে সারা বাংলাদেশে:</strong> ২ থেকে ৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে ডেলিভারি। ডেলিভারি চার্জ মাত্র <strong>৳১৩০</strong>।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>ক্যাশ অন ডেলিভারি (COD):</strong> কোনো অগ্রিম পেমেন্ট ছাড়াই পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।</span>
                  </li>
                </ul>
              </div>

              {/* Return Policy */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-bold text-base">
                  <RotateCcw className="w-5 h-5" />
                  <span>৭ দিনের সহজ রিটার্ন বা রিপ্লেসমেন্ট</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>নিরাপদ গ্লাস জার প্যাকেজিং:</strong> আমরা বাবল র‍্যাপ ও বিশেষ থার্মোকল সুরক্ষায় কাচের জার প্যাকিং করি।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>ভাঙা বা নষ্ট হলে:</strong> পরিবহনে কোনো কারণে জার ক্ষতিগ্রস্ত হলে সাথে সাথে সম্পূর্ণ ফ্রিতে নতুন প্রোডাক্ট প্রতিস্থাপন করে দেওয়া হবে।</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span><strong>১০০% মানি-ব্যাক:</strong> আমাদের খাঁটি মধুর গুণমানে কোনো প্রকার অসন্তুষ্টি থাকলে সম্পূর্ণ মূল্য ফেরতের সুবিধা রয়েছে।</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. Purity & Quality Tab */}
        {activeTab === "purity" && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 sm:p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/60">
              <h4 className="font-bold text-sm sm:text-base text-emerald-900 dark:text-emerald-300 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                <span>আমাদের শতভাগ বিশুদ্ধতার অঙ্গীকার</span>
              </h4>
              <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
                আমাদের মধু কোনো কারখানায় তৈরি হয় না। সুন্দরবনের প্রাকৃতিক বুনো মৌচাক ও গ্রামবাংলার বিশ্বস্ত মৌয়ালদের থেকে সংগৃহীত কাঁচা মধুকে কেবল প্রাকৃতিক কোল্ড ফিল্টারের মাধ্যমে ছাঁকন করা হয়।
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>জিরো হিটিং ও প্রসেসিং</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                  অতিরিক্ত তাপে মধুর ভেতরের প্রাকৃতিক এনজাইম ও ভিটামিন নষ্ট হয় না।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>শূন্য কৃত্রিম চিনি</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                  কোনো প্রকার কর্ন সিরাপ বা সুগার ফিডিং ছাড়া ১০০% অকৃত্রিম নেক্টার।
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs sm:text-sm">
                <div className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5 mb-1 text-emerald-700 dark:text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>ফুড-গ্রেড কাচের জার</span>
                </div>
                <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-relaxed">
                  প্লাস্টিকের রাসায়নিক দূষণমুক্ত দীর্ঘস্থায়ী কাচের সংরক্ষণ।
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 4. Usage & Storage Tab */}
        {activeTab === "usage" && (
          <div className="space-y-4 animate-fade-in text-xs sm:text-sm text-zinc-700 dark:text-zinc-300">
            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                মধু খাওয়ার নিয়ম ও সঠিক সময়
              </h4>
              <ul className="space-y-2 leading-relaxed">
                <li>• <strong>সকালে খালি পেটে:</strong> এক গ্লাস কুসুম গরম পানিতে ১-২ চা চামচ মধু ও লেবুর রস মিশিয়ে পান করলে মেদ কমে এবং হজমশক্তি ভালো থাকে।</li>
                <li>• <strong>সর্দি-কাশির উপশমে:</strong> হালকা আদা চা বা তুলসী পাতার রসের সাথে মধু মিশিয়ে খেলে কাশি ও গলার খুসখুস দ্রুত দূর হয়।</li>
                <li>• <strong>শিশুদের জন্য:</strong> দুধ বা হালকা খাবারের সাথে আধা চামচ মধু দেওয়া যেতে পারে (১ বছরের নিচের শিশুদের মধু খাওয়ানো নিষেধ)।</li>
              </ul>
            </div>

            <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                সংরক্ষণ পদ্ধতি ও সতর্কতা
              </h4>
              <ul className="space-y-2 leading-relaxed">
                <li>• মধু স্বাভাবিক তাপমাত্রায় শুষ্ক ও ছায়াযুক্ত স্থানে মুখ শক্তভাবে বন্ধ করে রাখুন। <strong>ফ্রিজে রাখার প্রয়োজন নেই।</strong></li>
                <li>• শীতকালে সরিষা বা লিচুর মধু জমে যাওয়া সম্পূর্ণ স্বাভাবিক প্রাকৃতিক ঘটনা (ক্রিস্টালাইজেশন)। এতে মধুর পুষ্টিগুণ একটুও কমে না। গরম পানির পাত্রে জারটি কিছুক্ষণ রাখলেই এটি আবার স্বাভাবিক তরল হয়ে যায়।</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
