"use client"

import { useState } from "react"
import { HttpTypes } from "@medusajs/types"
import Image from "next/image"
import { ChevronLeft, ChevronRight, Check } from "lucide-react"

type ImageGalleryProps = {
  images?: HttpTypes.StoreProductImage[] | null
}

export default function ImageGallery({ images }: ImageGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)

  // Ensure there is at least one image or a placeholder
  const imageList = images && images.length > 0 ? images : []
  const hasImages = imageList.length > 0
  const activeImage = hasImages ? imageList[selectedIndex] : null

  const handlePrev = () => {
    if (!hasImages) return
    setSelectedIndex((prev) => (prev === 0 ? imageList.length - 1 : prev - 1))
  }

  const handleNext = () => {
    if (!hasImages) return
    setSelectedIndex((prev) => (prev === imageList.length - 1 ? 0 : prev + 1))
  }

  return (
    <div className="flex flex-col sm:flex-row items-start gap-4 sm:gap-6 w-full">
      {/* Left Side: Vertical Small Thumbnails (matching user uploaded screenshot) */}
      {hasImages && imageList.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[480px] scrollbar-none w-full sm:w-20 shrink-0 order-2 sm:order-1">
          {imageList.map((img, idx) => {
            const isSelected = idx === selectedIndex
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative aspect-square w-16 sm:w-20 rounded-xl overflow-hidden bg-white dark:bg-zinc-800 border-2 transition-all duration-200 shrink-0 ${
                  isSelected
                    ? "border-amber-500 dark:border-amber-400 ring-2 ring-amber-400/30 shadow-md"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-zinc-300 dark:hover:border-zinc-600 opacity-80 hover:opacity-100"
                }`}
              >
                {img.url ? (
                  <Image
                    src={img.url}
                    alt={`Product thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover object-center p-1"
                    unoptimized
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-xs text-zinc-400">
                    ছবি {idx + 1}
                  </div>
                )}

                {/* Orange Active Checkmark Badge (matching user's screenshot) */}
                {isSelected && (
                  <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-sm">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </div>
                )}
              </button>
            )
          })}
        </div>
      )}

      {/* Right Side: Large Main Display Image with Navigation Arrows */}
      <div className="relative aspect-square w-full rounded-2xl sm:rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 overflow-hidden shadow-sm flex items-center justify-center order-1 sm:order-2 group">
        {activeImage?.url ? (
          <Image
            src={activeImage.url}
            alt="Product main image"
            fill
            priority
            sizes="(max-width: 768px) 100vw, 600px"
            className="object-contain p-4 sm:p-8 transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="text-center p-8 text-zinc-400">
            <span className="text-6xl mb-2 block">🍯</span>
            <span className="text-sm">খাঁটি প্রাকৃতিক মধুর ছবি</span>
          </div>
        )}

        {/* Left Arrow Button */}
        {hasImages && imageList.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous Image"
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        )}

        {/* Right Arrow Button */}
        {hasImages && imageList.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next Image"
            className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white/90 dark:bg-zinc-800/90 hover:bg-white dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 shadow-md flex items-center justify-center transition-all opacity-80 hover:opacity-100 hover:scale-110"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        )}

        {/* Image Counter indicator */}
        {hasImages && imageList.length > 1 && (
          <div className="absolute bottom-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 text-white backdrop-blur-sm">
            {selectedIndex + 1} / {imageList.length}
          </div>
        )}
      </div>
    </div>
  )
}
