import React from "react"
import { Star, MessageSquareQuote } from "lucide-react"
import { ReviewItem } from "../types"

type ReviewCardProps = {
  review: ReviewItem
}

const AVATAR_PALETTES = [
  "bg-amber-100 text-amber-900 border-amber-300/80 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800",
  "bg-orange-100 text-orange-900 border-orange-300/80 dark:bg-orange-950/70 dark:text-orange-300 dark:border-orange-800",
  "bg-emerald-100 text-emerald-900 border-emerald-300/80 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800",
  "bg-teal-100 text-teal-900 border-teal-300/80 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800",
  "bg-rose-100 text-rose-900 border-rose-300/80 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800",
]

function getAvatarPalette(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return AVATAR_PALETTES[Math.abs(hash) % AVATAR_PALETTES.length]
}

function getInitialChar(name: string): string {
  if (!name) return "গ"
  const clean = name.trim()
  return clean.slice(0, 1)
}

export default function ReviewCard({ review }: ReviewCardProps) {
  const initial = getInitialChar(review.name)
  const palette = getAvatarPalette(review.name)

  return (
    <div className="flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-md transition-all duration-300">
      <div className="space-y-4">
        {/* Customer Header: Avatar + Name + Rating */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            {/* Avatar: Custom Image or Dynamic Initials */}
            {review.avatarUrl ? (
              <img
                src={review.avatarUrl}
                alt={review.name}
                className="w-10 h-10 rounded-full object-cover border border-amber-300/80 dark:border-amber-700 shadow-xs shrink-0"
              />
            ) : (
              <div
                className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-base shadow-xs shrink-0 ${palette}`}
              >
                {initial}
              </div>
            )}

            <div>
              <h4 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 leading-tight">
                {review.name}
              </h4>
              {review.productTitle && (
                <p className="text-[11px] font-semibold text-amber-600 dark:text-amber-400 mt-0.5">
                  {review.productTitle}
                </p>
              )}
            </div>
          </div>

          {/* Star Rating */}
          <div className="flex items-center gap-0.5 shrink-0 pt-0.5">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${
                  i < review.rating
                    ? "fill-amber-400 text-amber-400"
                    : "text-zinc-200 dark:text-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Review Comment Body */}
        <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
          &ldquo;{review.comment}&rdquo;
        </p>
      </div>

      {/* Admin / Seller Official Reply (If Present) */}
      {review.adminReply && (
        <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
          <div className="p-3.5 rounded-xl bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/60 dark:border-amber-800/50">
            <div className="flex items-center gap-2 mb-1.5">
              {/* Admin Avatar */}
              {review.adminReply.avatarUrl ? (
                <img
                  src={review.adminReply.avatarUrl}
                  alt={review.adminReply.author}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400 shrink-0"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-amber-500 to-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
                  🍯
                </div>
              )}
              <span className="font-bold text-xs text-amber-900 dark:text-amber-300">
                {review.adminReply.author} (অফিশিয়াল উত্তর)
              </span>
            </div>
            <p className="text-[11px] sm:text-xs text-amber-950/90 dark:text-amber-200/90 leading-relaxed pl-8">
              {review.adminReply.comment}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
