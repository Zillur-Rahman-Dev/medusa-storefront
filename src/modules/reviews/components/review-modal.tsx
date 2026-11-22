"use client"

import React, { useState, useEffect } from "react"
import { Star, X, CheckCircle2 } from "lucide-react"
import { ReviewItem } from "../types"

type ReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: Omit<ReviewItem, "id">) => void
  defaultProductTitle?: string
}

const RATING_LABELS: Record<number, string> = {
  5: "৫ স্টার - অসাধারণ ও খাঁটি!",
  4: "৪ স্টার - খুব ভালো লেগেছে",
  3: "৩ স্টার - মোটামুটি ভালো",
  2: "২ স্টার - সন্তোষজনক নয়",
  1: "১ স্টার - একেবারেই ভালো নয়",
}

export default function ReviewModal({
  isOpen,
  onClose,
  onSubmit,
  defaultProductTitle = "",
}: ReviewModalProps) {
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [name, setName] = useState<string>("")
  const [productTitle, setProductTitle] = useState<string>(defaultProductTitle)
  const [comment, setComment] = useState<string>("")
  const [error, setError] = useState<string>("")
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setProductTitle(defaultProductTitle)
      setError("")
      setIsSuccess(false)
    }
  }, [isOpen, defaultProductTitle])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("অনুগ্রহ করে আপনার নাম লিখুন।")
      return
    }

    if (!comment.trim() || comment.trim().length < 5) {
      setError("অনুগ্রহ করে অন্তত কয়েকটি শব্দে আপনার অভিজ্ঞতা শেয়ার করুন।")
      return
    }

    onSubmit({
      name: name.trim(),
      rating,
      productTitle: productTitle.trim() || "খাঁটি প্রাকৃতিক মধু",
      comment: comment.trim(),
    })

    setIsSuccess(true)
    setTimeout(() => {
      setName("")
      setComment("")
      setRating(5)
      setIsSuccess(false)
      onClose()
    }, 1200)
  }

  const activeStarCount = hoverRating || rating

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-zinc-200/90 dark:border-zinc-800 z-10 animate-in zoom-in-95 duration-200">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="w-5 h-5" />
        </button>

        {isSuccess ? (
          <div className="py-8 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
              আপনার মতামত সফলভাবে গৃহীত হয়েছে!
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Pure Honey BD-এর সাথে আপনার খাঁটি অভিজ্ঞতা শেয়ার করার জন্য আন্তরিক ধন্যবাদ।
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="mb-6">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 mb-2">
                <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                <span>আপনার মতামত লিখুন</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-50">
                মধুর অভিজ্ঞতা শেয়ার করুন
              </h3>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                আপনার মূল্যবান প্রতিক্রিয়া অন্য ক্রেতাদের খাঁটি মধু বেছে নিতে সাহায্য করবে।
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-medium border border-rose-200 dark:border-rose-900">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Star Rating Picker */}
              <div className="bg-amber-50/70 dark:bg-zinc-800/50 p-4 rounded-2xl border border-amber-200/60 dark:border-zinc-700/60 text-center">
                <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-2">
                  আপনার স্টার রেটিং নির্বাচন করুন
                </label>
                <div className="flex items-center justify-center gap-2">
                  {[1, 2, 3, 4, 5].map((starVal) => {
                    const isFilled = starVal <= activeStarCount
                    return (
                      <button
                        type="button"
                        key={starVal}
                        onClick={() => setRating(starVal)}
                        onMouseEnter={() => setHoverRating(starVal)}
                        onMouseLeave={() => setHoverRating(0)}
                        className="p-1 rounded-lg hover:scale-110 active:scale-95 transition-transform"
                      >
                        <Star
                          className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                            isFilled
                              ? "fill-amber-400 text-amber-400"
                              : "text-zinc-300 dark:text-zinc-600"
                          }`}
                        />
                      </button>
                    )
                  })}
                </div>
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mt-2">
                  {RATING_LABELS[activeStarCount] || ""}
                </p>
              </div>

              {/* Customer Name */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  আপনার নাম <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: রফিকুল ইসলাম"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Honey Product Selection / Optional */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  কোন মধু নিয়েছেন? (ঐচ্ছিক)
                </label>
                <input
                  type="text"
                  placeholder="যেমন: সুন্দরবনের খলিশা ফুলের মধু"
                  value={productTitle}
                  onChange={(e) => setProductTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Comment Textarea */}
              <div>
                <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                  আপনার অভিজ্ঞতা ও মন্তব্য <span className="text-rose-500">*</span>
                </label>
                <textarea
                  required
                  rows={4}
                  placeholder="মধুর স্বাদ, ঘ্রাণ, ঘনত্ব ও সার্ভিস কেমন লেগেছে বিস্তারিত লিখুন..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all resize-none"
                />
              </div>

              {/* Form Actions */}
              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-98 text-white shadow-md hover:shadow-amber-500/20 transition-all flex items-center gap-1.5"
                >
                  <Star className="w-4 h-4 fill-white" />
                  <span>রিভিউ জমা দিন</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
