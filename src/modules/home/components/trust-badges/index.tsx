import { ShieldCheck, Truck, RotateCcw, Award } from "lucide-react"

export default function TrustBadges() {
  const badges = [
    {
      icon: <Award className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />,
      title: "১০০% খাঁটি ও প্রাকৃতিক",
      description: "কোনো প্রকার চিনি, প্রিজারভেটিভ বা হিটিং ছাড়াই খাঁটি কাঁচা মধু",
    },
    {
      icon: <Truck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />,
      title: "সারা দেশে ক্যাশ অন ডেলিভারি",
      description: "পার্সেল হাতে পেয়ে টেস্ট করে নিশ্চিন্তে মূল্য পরিশোধ করুন",
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />,
      title: "কাচের জারে নিরাপদ সিলিং",
      description: "ফুড-গ্রেড বায়ুরোধী কাচের জারে সুরক্ষিতভাবে প্যাকেজিং",
    },
    {
      icon: <RotateCcw className="w-6 h-6 text-emerald-700 dark:text-emerald-400" />,
      title: "সহজ রিটার্ন বা রিপ্লেসমেন্ট",
      description: "পরিবহনে ক্ষতি বা অসন্তুষ্টি হলে সাথে সাথে ফ্রি রিপ্লেসমেন্ট",
    },
  ]

  return (
    <section className="border-y border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/40 py-8 sm:py-10 transition-colors">
      <div className="content-container">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {badges.map((badge, idx) => (
            <div
              key={idx}
              className="flex items-start gap-4 p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:border-emerald-600/60 dark:hover:border-emerald-500/60 transition-all duration-200"
            >
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 shrink-0">
                {badge.icon}
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base">
                  {badge.title}
                </h4>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
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
