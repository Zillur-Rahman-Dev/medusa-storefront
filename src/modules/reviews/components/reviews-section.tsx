"use client"

import React, { useState, useEffect } from "react"
import { Star, Plus } from "lucide-react"
import { ReviewItem } from "../types"
import ReviewCard from "./review-card"
import ReviewModal from "./review-modal"

function toBengaliDigits(num: number | string): string {
  const bnDigits: Record<string, string> = {
    "0": "০",
    "1": "১",
    "2": "২",
    "3": "৩",
    "4": "৪",
    "5": "৫",
    "6": "৬",
    "7": "৭",
    "8": "৮",
    "9": "৯",
  }
  return String(num).replace(/[0-9]/g, (d) => bnDigits[d] || d)
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  {
    id: "rev-1",
    name: "তানভীর আহমেদ",
    rating: 5,
    productTitle: "সুন্দরবনের খলিশা ফুলের মধু",
    comment:
      "খলিশা ফুলের মধুর স্বাদ ও ঘ্রাণ সত্যি চমৎকার! এর আগে অনেক জায়গা থেকে মধু কিনেছি কিন্তু এটা একদম খাঁটি বুনো মধুর ফ্লেভার। কাচের জারের সুরক্ষিত প্যাকিংও দারুণ ছিল।",
    adminReply: {
      author: "Pure Honey BD",
      comment:
        "ধন্যবাদ তানভীর ভাই! আপনাদের সুস্বাস্থ্য কামনায় সুন্দরবনের সবচেয়ে খাঁটি কাঁচা মধু পৌঁছে দিতে আমরা প্রতিশ্রুতিবদ্ধ।",
    },
  },
  {
    id: "rev-2",
    name: "ফারহানা করিম",
    rating: 5,
    productTitle: "খাঁটি কালোজিরা মধু",
    comment:
      "আমার পরিবারের জন্য নিয়মিত মধু লাগে। কালোজিরা মধুটা খেয়ে শরীর অনেক চাঙ্গা লাগে এবং ঠান্ডা কাশির উপশম হয়। ডেলিভারি মাত্র ২ দিনে পেয়েছি ক্যাশ অন ডেলিভারিতে।",
  },
  {
    id: "rev-3",
    name: "ড. মাহাবুবুর রহমান",
    rating: 5,
    productTitle: "সরিষা ফুলের প্রাকৃতিক মধু",
    comment:
      "ল্যাব টেস্টের মতো বিশুদ্ধতা পেয়েছি। অনেকেই মধু জমে যাওয়া নিয়ে বিভ্রান্ত হয়, কিন্তু খাঁটি সরিষা মধু যে শীতে প্রাকৃতিকভাবে ক্রিমি জমে যায় সেটা তাদের বিস্তারিত বিবরণ পড়ে ও টেস্ট করে বুঝতে পারলাম।",
    adminReply: {
      author: "Pure Honey BD",
      comment:
        "অনেক ধন্যবাদ স্যার! খাঁটি সরিষা মধুর প্রাকৃতিক বৈশিষ্ট্যটি স্পষ্টভাবে তুলে ধরার জন্য কৃতজ্ঞতা।",
    },
  },
  {
    id: "rev-4",
    name: "মো. নাজমুল হাসান",
    rating: 5,
    productTitle: "পাহাড়ি বুনো মৌচাকের মধু",
    comment:
      "পাহাড়ি বুনো মধুর হালকা ঝাঁঝালো মিষ্টি টেস্ট একদম অনন্য। সকালে লেবু পানির সাথে খেলে দারুণ রিফ্রেশ লাগে। নির্দ্বিধায় নেওয়া যায়।",
  },
  {
    id: "rev-5",
    name: "সাদিয়া আফরিন",
    rating: 5,
    productTitle: "লিচু ফুলের খাঁটি মধু",
    comment:
      "খুব সুন্দর মিষ্টি গন্ধ এবং স্বচ্ছ টেক্সচার। বাসার বাচ্চারা খুব পছন্দ করেছে। কোনো প্রকার চিনির মিশ্রণ নেই দেখেই বোঝা যায়।",
  },
  {
    id: "rev-6",
    name: "ইঞ্জিনিয়ার আরিফুল ইসলাম",
    rating: 4,
    productTitle: "সুন্দরবনের প্রাকৃতিক মধু",
    comment:
      "মধুর মান নিয়ে কোনো সন্দেহ নেই, একশতে একশো। তবে ডেলিভারি যদি আরও ১ দিন আগে পাওয়া যেত তবে আরো ভালো হতো। ওভারঅল খুবই সন্তুষ্ট।",
    adminReply: {
      author: "Pure Honey BD",
      comment:
        "ধন্যবাদ আরিফ ভাই! আপনার মূল্যবান পরামর্শটি আমরা নোট করে নিলাম। ডেলিভারি স্পিড আরও দ্রুত করার সর্বোচ্চ চেষ্টা করছি।",
    },
  },
]

type ReviewsSectionProps = {
  productTitle?: string
  title?: string
  subtitle?: string
}

export default function ReviewsSection({
  productTitle,
  title = "হাজারো পরিবারের প্রতিদিনের বিশ্বস্ত সঙ্গী",
  subtitle = "আমাদের খাঁটি প্রাকৃতিক মধু নিয়মিত ব্যবহারকারী সম্মানিত গ্রাহকদের বাস্তব অভিজ্ঞতা ও মতামত।",
}: ReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false)
  const [filterRating, setFilterRating] = useState<number | null>(null)
  const [visibleCount, setVisibleCount] = useState<number>(6)

  // Fetch dynamic reviews from Neon DB (via Next.js /api/reviews) with fallbacks
  useEffect(() => {
    let isMounted = true

    async function loadReviews() {
      try {
        const res = await fetch("/api/reviews")
        if (res.ok) {
          const data = await res.json()
          if (data.success && Array.isArray(data.reviews) && data.reviews.length > 0) {
            if (isMounted) {
              setReviews([...data.reviews, ...DEFAULT_REVIEWS])
              return
            }
          }
        }
      } catch (err) {
        // Fallback to local storage or defaults if offline / network issue
      }

      // LocalStorage fallback
      try {
        const saved = localStorage.getItem("pure_honey_client_reviews")
        if (saved && isMounted) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviews([...parsed, ...DEFAULT_REVIEWS])
          }
        }
      } catch (e) {}
    }

    loadReviews()

    return () => {
      isMounted = false
    }
  }, [])

  const handleAddReview = async (newRevData: Omit<ReviewItem, "id">) => {
    try {
      // 1. Post to dynamic API route (saves to Neon DB + sends Telegram notification)
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newRevData),
      })

      let createdReview: ReviewItem

      if (res.ok) {
        const data = await res.json()
        createdReview = data.review
      } else {
        createdReview = {
          ...newRevData,
          id: `user-${Date.now()}`,
        }
      }

      const updated = [createdReview, ...reviews]
      setReviews(updated)

      try {
        const userReviews = updated.filter((r) => r.id.startsWith("rev-") || r.id.startsWith("user-"))
        localStorage.setItem("pure_honey_client_reviews", JSON.stringify(userReviews.slice(0, 10)))
      } catch (e) {}
    } catch (err) {
      // Local fallback
      const fallbackReview: ReviewItem = {
        ...newRevData,
        id: `user-${Date.now()}`,
      }
      setReviews([fallbackReview, ...reviews])
    }
  }

  // Filter reviews
  const filteredReviews = reviews.filter((r) => {
    if (filterRating !== null && r.rating !== filterRating) {
      return false
    }
    return true
  })

  // Calculate average rating
  const totalReviews = reviews.length
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        ).toFixed(1)
      : "5.0"

  const displayedReviews = filteredReviews.slice(0, visibleCount)

  return (
    <section
      id="reviews-section"
      className="py-14 sm:py-20 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-200/80 dark:border-zinc-800/80 transition-colors"
    >
      <div className="content-container">
        {/* Section Header */}
        <div className="max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-2.5">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            <span>সন্তুষ্ট গ্রাহকদের রিভিউ</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {title}
          </h2>
          <p className="mt-2 text-xs sm:text-base text-zinc-600 dark:text-zinc-400">
            {subtitle}
          </p>
        </div>

        {/* Rating Summary Bar & 'Write a Review' Action */}
        <div className="mb-7 p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: Overall Score */}
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 sm:gap-4 text-center sm:text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
                ⭐ {toBengaliDigits(avgRating)}
              </span>
              <span className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-medium">
                / {toBengaliDigits("5.0")}
              </span>
            </div>

            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800 hidden sm:block" />

            <div className="flex items-center text-amber-400 gap-0.5">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>

            <span className="text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              ({toBengaliDigits(totalReviews)} টি কাস্টমার রিভিউ)
            </span>
          </div>

          {/* Right: 'Write a Review' Button */}
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-amber-500/20 transition-all flex items-center justify-center gap-1.5"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
            <span>রিভিউ লিখুন</span>
          </button>
        </div>

        {/* Filter Pills (All, 5 Star, 4 Star) */}
        <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setFilterRating(null)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterRating === null
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            সকল রিভিউ ({toBengaliDigits(reviews.length)})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating(5)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterRating === 5
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            ৫ স্টার (
            {toBengaliDigits(reviews.filter((r) => r.rating === 5).length)})
          </button>
          <button
            type="button"
            onClick={() => setFilterRating(4)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
              filterRating === 4
                ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900"
                : "bg-white dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border border-zinc-200/80 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-700"
            }`}
          >
            ৪ স্টার (
            {toBengaliDigits(reviews.filter((r) => r.rating === 4).length)})
          </button>
        </div>

        {/* Masonry Columns Layout: Zero Empty White Spaces */}
        {displayedReviews.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 gap-5 space-y-5">
            {displayedReviews.map((rev) => (
              <div key={rev.id} className="break-inside-avoid">
                <ReviewCard review={rev} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">
              এই রেটিংয়ে এখনো কোনো রিভিউ নেই।
            </p>
          </div>
        )}

        {/* Load More Button */}
        {filteredReviews.length > visibleCount && (
          <div className="mt-8 text-center">
            <button
              type="button"
              onClick={() => setVisibleCount((prev) => prev + 6)}
              className="px-6 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm font-bold hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
            >
              আরও রিভিউ দেখুন
            </button>
          </div>
        )}
      </div>

      {/* Centered Modal Dialog with Safe Margins */}
      <ReviewModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddReview}
        defaultProductTitle={productTitle}
      />
    </section>
  )
}
