import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react"

export default function TrustBadges() {
  const badges = [
    {
      icon: <Award className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "১০০% খাঁটি ও প্রাকৃতিক",
      description: "কোনো ধরনের প্রসেসিং বা চিনি ছাড়া একদম অরিজিনাল মধু",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "সরাসরি মৌচাক থেকে সংগৃহীত",
      description: "সুন্দরবন ও প্রত্যন্ত অঞ্চলের বিশ্বস্ত মৌয়ালদের থেকে সংগ্রহ",
    },
    {
      icon: <Truck className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "ক্যাশ অন ডেলিভারি",
      description: "আগে পণ্য হাতে পেয়ে দেখে বুঝে মূল্য পরিশোধ করার সুযোগ",
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      title: "১০০% ক্যাশব্যাক গ্যারান্টি",
      description: "কোনো কারণে ভেজাল বা অসন্তুষ্ট হলে সম্পূর্ণ টাকা ফেরত",
    },
  ]

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-amber-50/50 dark:bg-zinc-900/50 py-10 transition-colors duration-300">
      <div className="content-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 rounded-xl bg-white dark:bg-zinc-950 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-md"
            >
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-950/60 shrink-0">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {badge.title}
                </h4>
                <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed">
                  {badge.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
