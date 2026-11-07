import { Star, CheckCircle, Quote } from "lucide-react"

type ReviewItem = {
  name: string
  location: string
  product: string
  comment: string
  rating: number
  date: string
}

const reviews: ReviewItem[] = [
  {
    name: "তানভীর আহমেদ",
    location: "উত্তরা, ঢাকা",
    product: "সুন্দরবনের খলিশা ফুলের মধু",
    comment:
      "খলিশা ফুলের মধুর স্বাদ ও ঘ্রাণ সত্যি চমৎকার! এর আগে অনেক জায়গা থেকে মধু কিনেছি কিন্তু এটা একদম খাঁটি বুনো মধুর ফ্লেভার। কাচের জারের সুরক্ষিত প্যাকিংও দারুণ ছিল।",
    rating: 5,
    date: "৩ দিন আগে",
  },
  {
    name: "ফারহানা করিম",
    location: "ধানমন্ডি, ঢাকা",
    product: "খাঁটি কালোজিরা মধু",
    comment:
      "আমার পরিবারের জন্য নিয়মিত মধু লাগে। কালোজিরা মধুটা খেয়ে শরীর অনেক চাঙ্গা লাগে এবং ঠান্ডা কাশির উপশম হয়। ডেলিভারি মাত্র ২ দিনে পেয়েছি ক্যাশ অন ডেলিভারিতে।",
    rating: 5,
    date: "১ সপ্তাহ আগে",
  },
  {
    name: "ড. মাহাবুবুর রহমান",
    location: "সিলেট",
    product: "সরিষা ফুলের প্রাকৃতিক মধু",
    comment:
      "ল্যাব টেস্টের মতো বিশুদ্ধতা পেয়েছি। অনেকেই মধু জমে যাওয়া নিয়ে বিভ্রান্ত হয়, কিন্তু খাঁটি সরিষা মধু যে প্রাকৃতিকভাবে ক্রিমি জমে যায় সেটা তাদের বিস্তারিত গাইড পড়ে ভালো লাগল।",
    rating: 5,
    date: "২ সপ্তাহ আগে",
  },
]

export default function Testimonials() {
  return (
    <section className="py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
      <div className="content-container">
        {/* Section Header */}
        <div className="max-w-2xl mx-auto text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>সন্তুষ্ট গ্রাহকদের প্রতিক্রিয়া</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            হাজারো পরিবারের প্রতিদিনের বিশ্বস্ত সঙ্গী
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            আমাদের খাঁটি প্রাকৃতিক মধু নিয়মিত ব্যবহারকারী সম্মানিত গ্রাহকদের কিছু বাস্তব অভিজ্ঞতা।
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {reviews.map((rev, idx) => (
            <div
              key={idx}
              className="relative flex flex-col justify-between p-6 sm:p-8 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div>
                {/* Rating & Date */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-1">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[11px] text-zinc-400 font-medium">{rev.date}</span>
                </div>

                {/* Comment */}
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed italic">
                  &ldquo;{rev.comment}&rdquo;
                </p>
              </div>

              {/* Author Info */}
              <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100">
                    {rev.name}
                  </h4>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{rev.location}</p>
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                    {rev.product}
                  </p>
                </div>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-200/60 dark:border-emerald-800/40">
                  <CheckCircle className="w-3 h-3" />
                  <span>ভেরিফাইড</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
