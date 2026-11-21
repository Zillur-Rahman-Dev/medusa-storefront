"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShoppingCart } from "lucide-react"
import { formatPrice, formatSize } from "@lib/util/money"
import { useCartItem } from "@lib/hooks/use-cart-item"

export type HoneyProductItem = {
  id: string
  title: string
  handle: string
  variantId: string
  weight?: string
  price: number
  regularPrice?: number
  thumbnail?: string | null
  images?: any[] | null
  icon?: string
  badge?: string
  rating?: number
  reviewCount?: number
}

type HoneyProductCardProps = {
  product: HoneyProductItem
  onQuickOrder?: (prod: HoneyProductItem) => void
}

export default function HoneyProductCard({
  product,
}: HoneyProductCardProps) {
  const { quantity, setQuantity } = useCartItem(product.variantId, product.handle)
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"


  const resolvedThumbnail =
    product.thumbnail ||
    (product.images && product.images.length > 0 ? product.images[0]?.url : null) ||
    (product.handle?.includes("sundarban") || product.handle?.includes("kholisha")
      ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"
      : product.handle?.includes("mustard") || product.handle?.includes("sorisha")
      ? "https://res.cloudinary.com/dqseoiw8p/raw/upload/v1794166098/e9b3e553-c496-419a-a1ca-e817d73045f1_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg"
      : product.handle?.includes("black-seed") || product.handle?.includes("kalijira")
      ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167194/2f318c58-a2a2-48bc-80e6-56ccd4b5a553_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg.jpg"
      : null)

  // 1. Initial Add to Cart (turns into Stepper [ - ] [ 1 ] [ + ])
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) return

    setQuantity(1)

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:item-added", {
          detail: {
            id: `opt_${Date.now()}`,
            title: product.title,
            variant: product.weight || "১ কেজি",
            price: product.price,
            thumbnail: resolvedThumbnail,
            handle: product.handle,
            variantId: product.variantId,
            quantity: 1,
            openDropdown: true,
          },
        })
      )
    }
  }

  // 2. Increment Stepper [ + ]
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) return

    const nextQty = quantity + 1
    setQuantity(nextQty)

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:item-added", {
          detail: {
            id: `opt_${Date.now()}`,
            title: product.title,
            variant: product.weight || "১ কেজি",
            price: product.price,
            thumbnail: resolvedThumbnail,
            handle: product.handle,
            variantId: product.variantId,
            quantity: 1,
            openDropdown: false,
          },
        })
      )
    }
  }

  // 3. Decrement Stepper [ - ]
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) return

    if (quantity > 1) {
      const nextQty = quantity - 1
      setQuantity(nextQty)

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-decremented", {
            detail: {
              variantId: product.variantId,
              handle: product.handle,
            },
          })
        )
      }
    } else {
      // Quantity hits 0: reverts back to [ কার্টে যোগ করুন ]
      setQuantity(0)

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-deleted", {
            detail: {
              variantId: product.variantId,
              handle: product.handle,
            },
          })
        )
      }
    }
  }

  return (
    <div className="relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl sm:rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/80 dark:hover:border-amber-500/80 shadow-xs hover:shadow-xl transition-all duration-300 group">
      {/* Top Badge matching screenshot */}
      {product.badge && (
        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-xs">
            {product.badge}
          </span>
        </div>
      )}

      <div>
        {/* Product Real Image from Medusa Dashboard */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="relative block aspect-square w-full rounded-xl sm:rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50/40 to-transparent dark:from-zinc-800/30 dark:to-transparent p-2 sm:p-2.5 flex items-center justify-center transition-all duration-300"
        >
          {product.thumbnail ? (
            <Image
              src={product.thumbnail}
              alt={product.title}
              fill
              unoptimized
              sizes="(max-width: 640px) 240px, (max-width: 1024px) 300px, 360px"
              className="object-contain p-2 transition-transform duration-500 group-hover:scale-105"
            />
          ) : product.icon ? (
            <span className="text-5xl sm:text-6xl drop-shadow-xs select-none transition-transform duration-300 group-hover:scale-110">
              {product.icon}
            </span>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/80 via-amber-100/40 to-orange-50/60 dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-xl select-none">
              <span className="text-4xl sm:text-5xl drop-shadow-xs transition-transform duration-300 group-hover:scale-110">🍯</span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-amber-800/80 dark:text-amber-400 mt-1.5">
                ১০০% খাঁটি মধু
              </span>
            </div>
          )}
        </LocalizedClientLink>

        {/* Product Title */}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block mt-2.5">
          <h3 className="font-bold text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {/* Compact Single Row: Price on LEFT, Weight / Kg on RIGHT */}
        <div className="mt-2 flex items-center justify-between gap-1.5">
          <div className="flex items-baseline gap-1.5">
            <span className="text-sm sm:text-base font-black text-amber-600 dark:text-amber-400">
              {formatPrice(product.price)}
            </span>
            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-[11px] text-zinc-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {product.weight && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 rounded-full whitespace-nowrap">
              {formatSize(product.weight)}
            </span>
          )}
        </div>
      </div>

      {/* Ghorer Bazar Style Single Button: [ 🛒 কার্টে যোগ করুন ] or [ - qty + ] Stepper */}
      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center">
        {quantity > 0 ? (
          <div className="w-full h-9 sm:h-10 flex items-center rounded-lg sm:rounded-xl overflow-hidden border border-amber-600 shadow-2xs bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-10 sm:w-12 h-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-base select-none transition-colors cursor-pointer"
              aria-label="পরিমাণ কমান"
            >
              -
            </button>
            <span className="flex-1 h-full flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-black text-xs sm:text-sm select-none border-x border-amber-600/30">
              {formatSize(String(quantity))}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-10 sm:w-12 h-full flex items-center justify-center bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-black text-base select-none transition-colors cursor-pointer"
              aria-label="পরিমাণ বাড়ান"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-9 sm:h-10 py-1.5 px-3 rounded-lg sm:rounded-xl text-xs sm:text-sm font-bold border border-amber-500 hover:border-amber-600 bg-white dark:bg-zinc-900 text-amber-700 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs active:scale-[0.98]"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-inherit" />
            <span>কার্টে যোগ করুন</span>
          </button>
        )}
      </div>
    </div>
  )
}
