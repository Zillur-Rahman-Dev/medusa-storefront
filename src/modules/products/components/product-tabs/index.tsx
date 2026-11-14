"use client"

import { HttpTypes } from "@medusajs/types"
import {
  FileText,
  ShieldCheck,
  CheckCircle2,
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

    if (!line) {
      flushLists(index)
      return
    }

    // Callout Box Headers
    if (line.startsWith("! ") || line.startsWith("⚠️") || line.startsWith("💡")) {
      flushLists(index)
      alertHeader = line.replace(/^[!⚠️💡\s]+/, "")
      return
    }

    if (alertHeader !== null) {
      alertLines.push(line)
      return
    }

    // Bullet Lists
    if (line.startsWith("• ") || line.startsWith("- ") || line.startsWith("* ")) {
      if (numberedList.length > 0) flushLists(`num-${index}`)
      bulletList.push(line.replace(/^[•\-\*]\s*/, ""))
      return
    }

    // Numbered Lists
    const numMatch = line.match(/^(\d+)[\.\)]\s*(.*)$/)
    if (numMatch) {
      if (bulletList.length > 0) flushLists(`bul-${index}`)
      numberedList.push(numMatch[2])
      return
    }

    // Heading 2 / 3
    if (line.startsWith("### ")) {
      flushLists(index)
      elements.push(
        <h4
          key={index}
          className="text-xs sm:text-sm font-black text-amber-800 dark:text-amber-400 uppercase tracking-wider mt-4 mb-2"
        >
          {renderFormattedText(line.replace(/^###\s*/, ""))}
        </h4>
      )
      return
    }

    if (line.startsWith("## ")) {
      flushLists(index)
      elements.push(
        <h3
          key={index}
          className="text-sm sm:text-base font-black text-zinc-900 dark:text-zinc-100 mt-5 mb-2.5 pb-1 border-b border-amber-200/40 dark:border-amber-900/40"
        >
          {renderFormattedText(line.replace(/^##\s*/, ""))}
        </h3>
      )
      return
    }

    // Regular Paragraph
    flushLists(index)
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
  const metadata = (product.metadata as Record<string, any>) || {}

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
      value:
        product.type?.value ||
        (product.categories && product.categories[0]?.name
          ? product.categories[0].name.trim()
          : metadata.honey_type) ||
        "১০০% কাঁচা প্রাকৃতিক মধু",
    },
    {
      key: "material",
      label: "মূল উপাদান",
      value:
        product.material ||
        metadata.material ||
        "১০০% অপরিশোধিত খাঁটি সরিষা ফুলের নেক্টার",
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
      value:
        metadata.flavor_taste ||
        "মৃদু মিষ্টি সুবাস ও প্রাকৃতিকভাবে জমে যাওয়া ক্রিমি ভাব",
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
        label:
          metaKeyLabels[k] ||
          k.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
        value: v.trim(),
        highlight: false,
      })
    }
  })

  const halfLength = Math.ceil(specItems.length / 2)

  return (
    <div className="w-full space-y-6 pt-4 pb-8">
      {/* Consolidated Single Section: পণ্যের বিবরণ ও তথ্য (No multiple tabs) */}
      <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-100">
              পণ্যের বিবরণ ও তথ্য
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Product Description & Specifications
            </p>
          </div>
        </div>
      </div>

      {/* 1. Rich Formatted Description from Medusa Admin */}
      <div className="p-5 sm:p-7 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <FormattedDescription content={product.description || ""} />
      </div>

      {/* 2. Specifications Table Driven by Dashboard Metadata */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
            বিশুদ্ধতার মানদণ্ড ও পণ্যের বৈশিষ্ট্য
          </h3>
        </div>

        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden bg-white dark:bg-zinc-900 shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-zinc-200 dark:divide-zinc-800 text-xs sm:text-sm">
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

      {/* 3. Assurance & Quality Badges */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 pt-2">
        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              জিরো হিটিং ও প্রসেসিং
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              প্রাকৃতিক কোল্ড ফিল্টার, কোনো ক্ষতিকর তাপ ছাড়াই এনজাইম সমৃদ্ধ কাঁচা মধু।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              ১০০% চিনি ও ভেজালমুক্ত
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              কোনো প্রকার কর্ন সিরাপ বা কৃত্রিম চিনি ছাড়া সম্পূর্ণ প্রাকৃতিকভাবে সংগৃহীত।
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200/80 dark:border-amber-800/50 flex items-start gap-3">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-600 shrink-0">
            <ShieldCheck className="w-4 h-4 text-amber-600" />
          </div>
          <div>
            <h4 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
              নিরাপদ কাচের জার
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
              ফুড-গ্রেড বায়ুরোধী কাচের জারে সুরক্ষিত, দীর্ঘস্থায়ী পুষ্টিমান রক্ষা।
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
