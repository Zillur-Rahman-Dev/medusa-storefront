"use client"

import React, { useState, useEffect } from "react"
import { Star, X, CheckCircle2, Loader2 } from "lucide-react"
import { ReviewItem } from "../types"

type ReviewModalProps = {
  isOpen: boolean
  onClose: () => void
  onSubmit: (review: Omit<ReviewItem, "id">) => Promise<void> | void
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
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [isSuccess, setIsSuccess] = useState<boolean>(false)

  useEffect(() => {
    if (isOpen) {
      setProductTitle(defaultProductTitle)
      setError("")
      setIsSuccess(false)
      setIsSubmitting(false)
      // Prevent body scrolling while modal is open
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = "unset"
    }

    return () => {
      document.body.style.overflow = "unset"
    }
  }, [isOpen, defaultProductTitle])

  // Close on ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isSubmitting) {
        onClose()
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [isOpen, onClose, isSubmitting])

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!name.trim()) {
      setError("অনুগ্রহ করে আপনার নাম লিখুন।")
      return
    }

    if (!comment.trim() || comment.trim().length < 3) {
      setError("অনুগ্রহ করে অন্তত কয়েকটি শব্দে আপনার অভিজ্ঞতা শেয়ার করুন।")
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit({
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
        setIsSubmitting(false)
        onClose()
      }, 1200)
    } catch (err: any) {
      setError(err?.message || "রিভিউ জমা দিতে সমস্যা হয়েছে, আবার চেষ্টা করুন।")
      setIsSubmitting(false)
    }
  }

  const activeStarCount = hoverRating || rating

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Centering Wrapper with Safe Margins */}
      <div className="min-h-full flex items-center justify-center p-4 sm:p-6 text-center">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200"
          onClick={!isSubmitting ? onClose : undefined}
        />

        {/* Modal Dialog Card */}
        <div className="relative w-full max-w-md my-8 bg-white dark:bg-zinc-900 rounded-3xl p-5 sm:p-6 shadow-2xl border border-zinc-200 dark:border-zinc-800 text-left z-10 animate-in zoom-in-95 duration-200 transition-all">
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="absolute top-4 right-4 p-2 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
            aria-label="বন্ধ করুন"
          >
            <X className="w-5 h-5" />
          </button>

          {isSuccess ? (
            <div className="py-6 text-center space-y-2.5">
              <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-xs">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">
                আপনার রিভিউ সফলভাবে গৃহীত হয়েছে!
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400">
                Pure Honey BD-এর সাথে আপনার খাঁটি অভিজ্ঞতা শেয়ার করার জন্য আন্তরিক ধন্যবাদ।
              </p>
            </div>
          ) : (
            <>
              {/* Header */}
              <div className="mb-4 pr-6">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-300 mb-1.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  <span>আপনার মতামত লিখুন</span>
                </div>
                <h3 className="text-lg sm:text-xl font-black text-zinc-900 dark:text-zinc-50 leading-tight">
                  মধুর অভিজ্ঞতা শেয়ার করুন
                </h3>
                <p className="text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  আপনার রিভিউ অন্য ক্রেতাদের খাঁটি মধু বেছে নিতে সাহায্য করবে।
                </p>
              </div>

              {error && (
                <div className="mb-3 p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 text-xs font-medium border border-rose-200 dark:border-rose-900">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                {/* Star Rating Picker (Compact & Centered) */}
                <div className="bg-amber-50/60 dark:bg-zinc-800/50 py-2.5 px-3 rounded-2xl border border-amber-200/60 dark:border-zinc-700/60 text-center">
                  <span className="block text-[11px] font-bold text-zinc-600 dark:text-zinc-400 mb-1">
                    স্টার রেটিং নির্বাচন করুন
                  </span>
                  <div className="flex items-center justify-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((starVal) => {
                      const isFilled = starVal <= activeStarCount
                      return (
                        <button
                          type="button"
                          key={starVal}
                          onClick={() => setRating(starVal)}
                          onMouseEnter={() => setHoverRating(starVal)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 rounded-md hover:scale-110 active:scale-95 transition-transform"
                        >
                          <Star
                            className={`w-6 h-6 transition-colors ${
                              isFilled
                                ? "fill-amber-400 text-amber-400"
                                : "text-zinc-300 dark:text-zinc-600"
                            }`}
                          />
                        </button>
                      )
                    })}
                  </div>
                  <p className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 mt-1">
                    {RATING_LABELS[activeStarCount] || ""}
                  </p>
                </div>

                {/* 2-Column Inputs for Name & Honey Product */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      আপনার নাম <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="যেমন: রফিকুল ইসলাম"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                      কোন মধু? (ঐচ্ছিক)
                    </label>
                    <input
                      type="text"
                      placeholder="যেমন: সুন্দরবনের খলিশা মধু"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                  </div>
                </div>

                {/* Comment Textarea */}
                <div>
                  <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                    আপনার অভিজ্ঞতা ও মন্তব্য <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="মধুর স্বাদ, ঘ্রাণ, ঘনত্ব ও সার্ভিস কেমন লেগেছে লিখুন..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 transition-all resize-none"
                  />
                </div>

                {/* Form Actions */}
                <div className="flex items-center justify-end gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={onClose}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                  >
                    বাতিল
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-amber-500 hover:bg-amber-600 active:scale-98 text-white shadow-sm hover:shadow-amber-500/20 transition-all flex items-center gap-1.5 disabled:opacity-60"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Star className="w-4 h-4 fill-white" />
                    )}
                    <span>{isSubmitting ? "জমা হচ্ছে..." : "রিভিউ জমা দিন"}</span>
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
