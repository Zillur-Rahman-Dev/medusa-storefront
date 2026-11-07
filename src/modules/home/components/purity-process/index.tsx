import { ShieldCheck, Compass, Droplet, Sparkles, CheckCircle2 } from "lucide-react"

const steps = [
  {
    number: "০১",
    title: "বুনো ও বিশ্বস্ত উৎস থেকে সংগ্রহ",
    description:
      "সুন্দরবনের গভীর ম্যানগ্রোভ এবং দেশের প্রত্যন্ত অঞ্চলের প্রাকৃতিক মৌচাক থেকে ঐতিহ্যবাহী দক্ষ মৌয়ালদের মাধ্যমে কাঁচা মধু সংগ্রহ করা হয়।",
    icon: Compass,
  },
  {
    number: "০২",
    title: "কোল্ড ফিল্ট্রেশন পদ্ধতি",
    description:
      "মধুর প্রাকৃতিক এনজাইম, পরাগ (Pollen) ও অ্যান্টিঅক্সিডেন্ট অক্ষত রাখতে কোনো প্রকার অতিরিক্ত তাপ বা প্রসেসিং ছাড়া প্রাকৃতিকভাবে ছাঁকন করা হয়।",
    icon: Droplet,
  },
  {
    number: "০৩",
    title: "ল্যাব টেস্ট ও বিশুদ্ধতা যাচাই",
    description:
      "কৃত্রিম চিনি, প্রিজারভেটিভ বা রাসায়নিক ভেজাল সম্পূর্ণ শূন্য কিনা তা নিশ্চিত করতে প্রতি ব্যাচে আন্তর্জাতিক মানের মাননিয়ন্ত্রণ পরীক্ষা সম্পন্ন হয়।",
    icon: ShieldCheck,
  },
  {
    number: "০৪",
    title: "ফুড-গ্রেড কাচের জারে সিলিং",
    description:
      "প্লাস্টিকের ক্ষতিকর প্রভাব এড়াতে প্রিমিয়াম ফুড-গ্রেড বায়ুরোধী কাচের জারে সুরক্ষিতভাবে প্যাকেজিং করে দ্রুত আপনার ঠিকানায় ডেলিভারি নিশ্চিত করা হয়।",
    icon: Sparkles,
  },
]

export default function PurityProcess() {
  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container">
        {/* Header */}
        <div className="max-w-3xl mx-auto text-center mb-14 sm:mb-20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-800 dark:text-amber-300 border border-amber-500/20 mb-4">
            <CheckCircle2 className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>আমাদের গুণগত মান ও অঙ্গীকার</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            বন ও মৌচাক থেকে সরাসরি আপনার টেবিলে
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            আমরা কোনো মধ্যস্বত্বভোগী বা কৃত্রিম সুগার সিরাপের সুযোগ দিই না। চারটি কঠোর প্রক্রিয়ার মধ্য দিয়ে নিশ্চিত হয় প্রতিটি ফোঁটা মধুর সর্বোচ্চ বিশুদ্ধতা।
          </p>
        </div>

        {/* 4 Process Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative">
          {steps.map((step, idx) => {
            const Icon = step.icon
            return (
              <div
                key={idx}
                className="relative flex flex-col p-6 sm:p-7 rounded-2xl bg-zinc-50/70 dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-amber-400 dark:hover:border-amber-500/60 transition-all duration-300 group"
              >
                {/* Step badge & Icon */}
                <div className="flex items-center justify-between mb-5">
                  <div className="w-12 h-12 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-2xl font-black text-zinc-300 dark:text-zinc-700 tracking-tighter">
                    {step.number}
                  </span>
                </div>

                <h3 className="text-base sm:text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {step.title}
                </h3>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  {step.description}
                </p>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
