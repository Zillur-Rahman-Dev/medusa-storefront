"use client"

import React, { useState, useRef } from "react"
import { Play, Volume2, VolumeX, ShoppingCart, Sparkles } from "lucide-react"
import { formatPrice } from "@lib/util/money"
import { addToCart } from "@lib/data/cart"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

export type ReelItem = {
  id: string
  videoUrl: string
  title: string
  location?: string
  product?: HoneyProductItem
}

type VideoReelsProps = {
  reels?: ReelItem[]
  title?: string
  subtitle?: string
}

const DEFAULT_REELS: ReelItem[] = [
  {
    id: "reel-1",
    videoUrl: "https://res.cloudinary.com/dqseoiw8p/video/upload/v1794167286/honey_harvest_preview.mp4",
    title: "সুন্দরবনের গভীর অরণ্যে তাজা খলিশা মধু কাটার দৃশ্য",
    location: "সুন্দরবন ম্যানগ্রোভ বন",
    product: {
      id: "prod-1",
      title: "সুন্দরবনের খাঁটি খলিশা মধু",
      handle: "sundarban-kholisha-honey",
      variantId: "variant_01M6T7P1X2GXF203D2N3YKY6KV",
      price: 1350,
      weight: "১ কেজি",
    },
  },
  {
    id: "reel-2",
    videoUrl: "https://res.cloudinary.com/dqseoiw8p/video/upload/v1794167286/mustard_honey_preview.mp4",
    title: "সরিষা ফুলের খেত থেকে খাঁটি র মধু সংগ্রহ",
    location: "নাটোর ও সিরাজগঞ্জ অঞ্চল",
    product: {
      id: "prod-2",
      title: "খাঁটি সরিষা ফুলের মধু",
      handle: "mustard-flower-honey",
      variantId: "variant_01M6T7PWFFFFT9AVNKYCSWP601",
      price: 750,
      weight: "১ কেজি",
    },
  },
]

export default function VideoReels({
  reels = DEFAULT_REELS,
  title = "মৌচাক থেকে সরাসরি: সত্যতার প্রমাণ",
  subtitle = "আমাদের মৌয়ালদের মধু সংগ্রহের বাস্তব ভিডিও দেখুন এবং খাঁটি হওয়ার প্রমাণ নিন",
}: VideoReelsProps) {
  const [mutedStates, setMutedStates] = useState<Record<string, boolean>>({})
  const [addingId, setAddingId] = useState<string | null>(null)
  const videoRefs = useRef<Record<string, HTMLVideoElement | null>>({})

  const toggleMute = (id: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const current = mutedStates[id] !== false // default is true (muted)
    const next = !current
    setMutedStates((prev) => ({ ...prev, [id]: next }))
    if (videoRefs.current[id]) {
      videoRefs.current[id]!.muted = next
    }
  }

  const handleQuickAdd = async (prod: HoneyProductItem, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!prod.variantId) return
    try {
      setAddingId(prod.id)
      await addToCart({
        variantId: prod.variantId,
        quantity: 1,
        countryCode: "bd",
      })
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("cart:item-added"))
      }
    } catch (err) {
      console.error("Reel quick add error:", err)
    } finally {
      setAddingId(null)
    }
  }

  if (!reels || reels.length === 0) return null

  return (
    <section className="w-full py-8 sm:py-12 bg-zinc-900 text-white">
      <div className="content-container">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 sm:mb-8">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500 text-zinc-950 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              প্রামাণ্য ভিডিও রিলস
            </span>
            <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-white">
              {title}
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              {subtitle}
            </p>
          </div>
        </div>

        {/* Vertical Reels Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {reels.slice(0, 3).map((reel) => {
            const isMuted = mutedStates[reel.id] !== false
            return (
              <div
                key={reel.id}
                className="relative aspect-[9/16] rounded-3xl overflow-hidden bg-zinc-800 shadow-xl border border-zinc-700/60 group flex flex-col justify-between p-4"
              >
                {/* HTML5 Native Video Stream (Cloudinary / Direct MP4) */}
                <video
                  ref={(el) => {
                    videoRefs.current[reel.id] = el
                  }}
                  src={reel.videoUrl}
                  autoPlay
                  loop
                  muted={isMuted}
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                />

                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-black/40 pointer-events-none" />

                {/* Top Controls: Sound Toggle */}
                <div className="relative z-10 flex items-center justify-between">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-black/50 backdrop-blur-md text-amber-300 border border-white/10">
                    📍 {reel.location || "মৌচাক সাইট"}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => toggleMute(reel.id, e)}
                    className="p-2 rounded-full bg-black/60 hover:bg-black/80 text-white backdrop-blur-md transition-all cursor-pointer"
                    aria-label="সাউন্ড অন/অফ"
                  >
                    {isMuted ? (
                      <VolumeX className="w-4 h-4" />
                    ) : (
                      <Volume2 className="w-4 h-4 text-emerald-400" />
                    )}
                  </button>
                </div>

                {/* Bottom Overlay: Title & Product Shoppable Card */}
                <div className="relative z-10 space-y-3">
                  <h4 className="text-sm font-bold text-white line-clamp-2 drop-shadow-md">
                    {reel.title}
                  </h4>

                  {reel.product && (
                    <div className="p-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-between gap-2 shadow-lg">
                      <div className="min-w-0">
                        <span className="text-[11px] font-bold text-amber-300 block truncate">
                          {reel.product.title}
                        </span>
                        <span className="text-xs font-black text-white">
                          {formatPrice(reel.product.price)}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={(e) => handleQuickAdd(reel.product!, e)}
                        disabled={addingId === reel.product.id}
                        className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:scale-95 text-zinc-950 font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-md transition-all cursor-pointer disabled:opacity-50"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{addingId === reel.product.id ? "যোগ হচ্ছে..." : "কিনুন"}</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
