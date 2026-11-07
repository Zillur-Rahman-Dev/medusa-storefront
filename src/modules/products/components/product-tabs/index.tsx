"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import {
  FileText,
  Truck,
  ShieldCheck,
  CheckCircle2,
  RotateCcw,
  Sparkles,
  AlertCircle,
} from "lucide-react"

type ProductTabsProps = {
  product: HttpTypes.StoreProduct
}

// Helper for inline markdown like **bold**
function renderFormattedText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g)
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
          {part.slice(2, -2)}
        </strong>
      )
    }
    return part
  })
}

// Lightweight, resilient Markdown renderer for Product Description
function FormattedDescription({ content }: { content: string }) {
  if (!content) {
    return (
      <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed">
        সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে সরাসরি সংগৃহীত ১০০% খাঁটি কাঁচা মধু। কোনো প্রকার সুগার ফিডিং, কেমিক্যাল বা কৃত্রিম তাপ ছাড়া প্রাকৃতিক পুষ্টি ও অ্যান্টিঅক্সিডেন্ট সমৃদ্ধ।
      </p>
    )
  }

  const lines = content.split("\n")
  const elements: React.ReactNode[] = []
  let bulletList: string[] = []
  let numberedList: string[] = []
  let alertHeader: string | null = null
  let alertLines: string[] = []

  const flushLists = (key: string | number) => {
    if (bulletList.length > 0) {
      elements.push(
        <ul key={`ul-${key}`} className="my-3 space-y-2 pl-1">
          {bulletList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
              <span>{renderFormattedText(item)}</span>
            </li>
          ))}
        </ul>
      )
      bulletList = []
    }

    if (numberedList.length > 0) {
      elements.push(
        <ol key={`ol-${key}`} className="my-3 space-y-2.5 pl-1">
          {numberedList.map((item, idx) => (
            <li
              key={idx}
              className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300"
            >
              <span className="w-5 h-5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5 border border-amber-300/60 dark:border-amber-800">
                {idx + 1}
              </span>
              <span className="pt-0.5">{renderFormattedText(item)}</span>
            </li>
          ))}
        </ol>
      )
      numberedList = []
    }

    if (alertHeader !== null) {
      elements.push(
        <div
          key={`alert-${key}`}
          className="my-4 p-4 sm:p-5 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-300/80 dark:border-amber-700/60 shadow-sm"
        >
          <div className="flex items-center gap-2 font-bold text-sm sm:text-base text-amber-900 dark:text-amber-300 mb-1.5">
            <AlertCircle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>{renderFormattedText(alertHeader)}</span>
          </div>
          {alertLines.length > 0 ? (
            <div className="space-y-1 pl-7 text-xs sm:text-sm text-amber-950/90 dark:text-amber-200/90 leading-relaxed">
              {alertLines.map((line, lIdx) => (
                <p key={lIdx}>{renderFormattedText(line)}</p>
              ))}
            </div>
          ) : null}
        </div>
      )
      alertHeader = null
      alertLines = []
    }
  }

  lines.forEach((rawLine, index) => {
    const line = rawLine.trim()

    // Bullet point: - Item or * Item
    if (line.startsWith("- ") || line.startsWith("* ")) {
      if (alertHeader !== null) {
        flushLists(`flush-before-bullet-${index}`)
      }
      bulletList.push(line.replace(/^[-*]\s+/, ""))
      return
    }

    // Numbered list: 1. Item or 2. Item
    const numMatch = line.match(/^(\d+)\.\s+(.*)$/)
    if (numMatch) {
      if (alertHeader !== null) {
        flushLists(`flush-before-num-${index}`)
      }
      numberedList.push(numMatch[2])
      return
    }

    // If currently inside an alert block and encounter text
    if (alertHeader !== null) {
      if (!line) {
        // Empty line ends alert block
        flushLists(index)
        return
      }
      if (line.startsWith("#")) {
        // New heading ends alert block
        flushLists(index)
      } else {
        alertLines.push(line)
        return
      }
    }

    // Flush any pending lists
    flushLists(index)

    if (!line) {
      return
    }

    // H2: ## Heading
    if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={index}
          className="text-base sm:text-xl font-black text-zinc-900 dark:text-zinc-50 mt-6 mb-3 pb-2 border-b border-zinc-200 dark:border-zinc-800 flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-amber-500 shrink-0" />
          <span>{renderFormattedText(line.replace(/^##\s+/, ""))}</span>
        </h2>
      )
      return
    }

    // H3: ### Sub-heading
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={index}
          className="text-sm sm:text-lg font-bold text-amber-600 dark:text-amber-400 mt-5 mb-2"
        >
          {renderFormattedText(line.replace(/^###\s+/, ""))}
        </h3>
      )
      return
    }

    // H4: #### Minor Heading (e.g. খাওয়ার সঠিক নিয়ম)
    if (line.startsWith("#### ")) {
      elements.push(
        <div key={index} className="flex items-center gap-2 mt-4 mb-2">
          <span className="w-1.5 h-4 bg-amber-500 rounded-full inline-block shrink-0"></span>
          <h4 className="text-xs sm:text-base font-bold text-zinc-900 dark:text-zinc-100">
            {renderFormattedText(line.replace(/^####\s+/, ""))}
          </h4>
        </div>
      )
      return
    }

    // H5: ##### Alert / Warning (e.g. বিশেষ সতর্কতা)
    if (line.startsWith("##### ")) {
      alertHeader = line.replace(/^#####\s+/, "")
      return
    }

    // Regular Paragraph
    elements.push(
      <p
        key={index}
        className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed mb-2.5"
      >
        {renderFormattedText(line)}
      </p>
    )
  })

  flushLists("final")

  return <div className="space-y-1">{elements}</div>
}

export default function ProductTabs({ product }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState<"info" | "shipping" | "purity">("info")

  const metadata = (product.metadata as Record<string, any>) || {}

  // 3 Primary Tabs (খাওয়ার নিয়ম is now gracefully consolidated inside info tab)
  const tabs = [
    {
      id: "info",
      label: "পণ্যের বিবরণ ও তথ্য",
      sublabel: "Product Description & Information",
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
  ]

  // Known metadata keys mapping to friendly Bengali labels
  const metaKeyLabels: Record<string, string> = {
    honey_type: "পণ্যের ধরন",
    origin_area: "উৎস অঞ্চল",
    packaging_type: "প্যাকেজিং জার",
    adulteration: "ভেজাল / চিনি",
    collection_method: "ফিল্ট্রেশন পদ্ধতি",
    flavor_taste: "ফ্লেভার ও টেক্সচার",
    shelf_life: "শেলফ লাইফ (মেয়াদ)",
    lab_tested: "ল্যাব টেস্ট রেজাল্ট",
    net_weight: "নিট ওজন",
    harvest_season: "সংগ্রহের মৌসুম",
    moisture: "আর্দ্রতা / জলীয় অংশ",
    fssai_certified: "খাদ্য মান ও লাইসেন্স",
  }

  // Dynamic Specifications driven by Medusa Admin Metadata with smart defaults
  const specItems: { key: string; label: string; value: string; highlight?: boolean }[] = [
    {
      key: "honey_type",
      label: "পণ্যের ধরন",
      value: product.type?.value || (product.categories && product.categories[0]?.name ? product.categories[0].name.trim() : metadata.honey_type) || "১০০% কাঁচা প্রাকৃতিক মধু",
    },
    {
      key: "material",
      label: "মূল উপাদান",
      value: product.material || metadata.material || "১০০% অপরিশোধিত খাঁটি সরিষা ফুলের নেক্টার",
    },
    {
      key: "origin_area",
      label: "উৎস অঞ্চল",
      value: metadata.origin_area || "নাটোর, সিরাজগঞ্জ ও টাঙ্গাইল অঞ্চল",
    },
    {
      key: "packaging_type",
      label: "প্যাকেজিং জার",
      value: metadata.packaging_type || "ফুড-গ্রেড বায়ুরোধী কাচের জার",
    },
    {
      key: "adulteration",
      label: "ভেজাল / চিনি",
      value: metadata.adulteration || "০% (সম্পূর্ণ চিনি ও ভেজালমুক্ত)",
      highlight: true,
    },
    {
      key: "collection_method",
      label: "ফিল্ট্রেশন পদ্ধতি",
      value: metadata.collection_method || "আনহিটেড কোল্ড ফিল্টার (Raw)",
    },
    {
      key: "flavor_taste",
      label: "ফ্লেভার ও টেক্সচার",
      value: metadata.flavor_taste || "মৃদু মিষ্টি সুবাস ও প্রাকৃতিকভাবে জমে যাওয়া ক্রিমি ভাব",
    },
    {
      key: "shelf_life",
      label: "শেলফ লাইফ (মেয়াদ)",
      value: metadata.shelf_life || "২ বছর (স্বাভাবিক তাপমাত্রায় সংরক্ষণযোগ্য)",
    },
    {
      key: "lab_tested",
      label: "ল্যাব টেস্ট রেজাল্ট",
      value: metadata.lab_tested || "শতভাগ খাঁটি প্রমাণিত ও সার্টিফাইড",
      highlight: true,
    },
  ]

  // Automatically append any additional custom keys the admin adds in Medusa Dashboard
  const handledKeys = new Set(["badge", "sub_title", ...specItems.map((s) => s.key)])
  Object.entries(metadata).forEach(([k, v]) => {
    if (!handledKeys.has(k) && typeof v === "string" && v.trim()) {
      specItems.push({
        key: k,
        label: metaKeyLabels[k] || k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: v.trim(),
        highlight: false,
      })
    }
  })

  const halfLength = Math.ceil(specItems.length / 2)

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
                    ? "bg-amber-600 text-white shadow-md shadow-amber-600/20"
                    : "bg-zinc-100 hover:bg-zinc-200/80 dark:bg-zinc-900 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300"
                }`}
              >
                <Icon
                  className={`w-4 h-4 ${
                    isActive ? "text-white" : "text-amber-600 dark:text-amber-400"
                  }`}
                />
                <span>{tab.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Panels Content */}
      <div className="py-6 sm:py-8">
        {/* 1. Product Information Tab (Rich Description from Dashboard + Specifications Table) */}
        {activeTab === "info" && (
          <div className="space-y-8 animate-fade-in">
            {/* Rich Formatted Description from Medusa Admin */}
            <div className="p-5 sm:p-7 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800">
              <FormattedDescription content={product.description || ""} />
            </div>

            {/* Specifications Grid Table Driven by Dashboard Metadata */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <FileText className="w-4 h-4 text-amber-500" />
                <h3 className="font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  পণ্যের বিস্তারিত স্পেসিফিকেশন ও তথ্য
                </h3>
              </div>

              <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900">
                <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:border-zinc-800 dark:divide-zinc-800 text-xs sm:text-sm">
                  {/* Left Column */}
                  <div className="p-4 sm:p-5 space-y-3.5 divide-y divide-zinc-100 dark:divide-zinc-800/60">
                    {specItems.slice(0, halfLength).map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between ${
                          idx > 0 ? "pt-3" : ""
                        }`}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {item.label}
                        </span>
                        <span
                          className={`font-bold text-right ml-2 ${
                            item.highlight
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Right Column */}
                  <div className="p-4 sm:p-5 space-y-3.5 divide-y divide-zinc-100 dark:divide-zinc-800/60 border-t sm:border-t-0 border-zinc-200 dark:border-zinc-800">
                    {specItems.slice(halfLength).map((item, idx) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between ${
                          idx > 0 ? "pt-3" : ""
                        }`}
                      >
                        <span className="text-zinc-500 dark:text-zinc-400 font-medium">
                          {item.label}
                        </span>
                        <span
                          className={`font-bold text-right ml-2 ${
                            item.highlight
                              ? "text-emerald-600 dark:text-emerald-400"
                              : "text-zinc-900 dark:text-zinc-100"
                          }`}
                        >
                          {item.value}
                        </span>
                      </div>
                    ))}
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
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <Truck className="w-5 h-5" />
                  <span>হোম ডেলিভারি ও সময়সীমা</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>ঢাকা সিটির ভেতরে:</strong> ২৪ থেকে ৪৮ ঘণ্টার মধ্যে ডেলিভারি সম্পন্ন হয়। ডেলিভারি চার্জ মাত্র <strong>৳৭০</strong>।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>ঢাকার বাইরে সারা বাংলাদেশে:</strong> ২ থেকে ৩ কার্যদিবসের মধ্যে নির্ভরযোগ্য কুরিয়ারে ডেলিভারি। ডেলিভারি চার্জ মাত্র <strong>৳১৩০</strong>।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>ক্যাশ অন ডেলিভারি (COD):</strong> কোনো অগ্রিম পেমেন্ট ছাড়াই পণ্য হাতে পেয়ে মূল্য পরিশোধ করতে পারবেন।
                    </span>
                  </li>
                </ul>
              </div>

              {/* Return Policy */}
              <div className="p-5 sm:p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-base">
                  <RotateCcw className="w-5 h-5" />
                  <span>৭ দিনের সহজ রিটার্ন বা রিপ্লেসমেন্ট</span>
                </div>
                <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300">
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>নিরাপদ গ্লাস জার প্যাকেজিং:</strong> আমরা বাবল র‍্যাপ ও বিশেষ থার্মোকল সুরক্ষায় কাচের জার প্যাকিং করি।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>ভাঙা বা নষ্ট হলে:</strong> পরিবহনে কোনো কারণে জার ক্ষতিগ্রস্ত হলে সাথে সাথে সম্পূর্ণ ফ্রিতে নতুন প্রোডাক্ট প্রতিস্থাপন করে দেওয়া হবে।
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-amber-500 font-bold">•</span>
                    <span>
                      <strong>১০০% মানি-ব্যাক:</strong> আমাদের খাঁটি মধুর গুণমানে কোনো প্রকার অসন্তুষ্টি থাকলে সম্পূর্ণ মূল্য ফেরতের সুবিধা রয়েছে।
                    </span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 3. Purity & Quality Tab */}
        {activeTab === "purity" && (
          <div className="space-y-5 animate-fade-in">
            <div className="p-5 sm:p-6 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60">
              <h4 className="font-bold text-sm sm:text-base text-amber-900 dark:text-amber-300 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-amber-600 dark:text-amber-400" />
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
      </div>
    </div>
  )
}
