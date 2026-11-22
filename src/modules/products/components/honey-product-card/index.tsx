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

  const discountPercent =
    product.regularPrice && product.regularPrice > product.price
      ? Math.round(((product.regularPrice - product.price) / product.regularPrice) * 100)
      : null

  return (
    <div className="relative flex flex-col justify-between p-3 rounded-[6px] bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-xs hover:shadow-md transition-all duration-200 group">
      {/* Top Badges matching Image 1 */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        {product.badge ? (
          <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#ea580c] rounded-[3px] shadow-2xs select-none">
            {product.badge}
          </span>
        ) : (
          <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#ea580c] rounded-[3px] shadow-2xs select-none">
            Best Selling
          </span>
        )}
      </div>

      {discountPercent && discountPercent > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#00a651] rounded-[3px] shadow-2xs select-none">
            Save {discountPercent}%
          </span>
        </div>
      )}

      <div>
        {/* Product Real Image from Medusa Dashboard */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="relative block aspect-square w-full rounded-[4px] overflow-hidden bg-white dark:bg-zinc-800/20 p-2 sm:p-2.5 flex items-center justify-center transition-all duration-300"
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
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/80 via-amber-100/40 to-orange-50/60 dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-[4px] select-none">
              <span className="text-4xl sm:text-5xl drop-shadow-xs transition-transform duration-300 group-hover:scale-110">🍯</span>
              <span className="text-[10px] sm:text-[11px] font-black tracking-wider uppercase text-amber-800/80 dark:text-amber-400 mt-1.5">
                ১০০% খাঁটি মধু
              </span>
            </div>
          )}
        </LocalizedClientLink>

        {/* Product Title */}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block mt-2.5">
          <h3 className="font-medium text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 group-hover:text-[#f26522] dark:group-hover:text-[#f26522] transition-colors line-clamp-2">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {/* Compact Single Row: Price on LEFT, Weight / Kg on RIGHT */}
        <div className="mt-2 flex items-center justify-between gap-1">
          <div className="flex items-baseline gap-1 sm:gap-1.5 flex-wrap min-w-0">
            <span className="text-sm sm:text-base font-bold text-[#f26522] whitespace-nowrap">
              {formatPrice(product.price)}
            </span>
            {product.regularPrice && product.regularPrice > product.price && (
              <span className="text-[10px] sm:text-[11px] text-zinc-400 line-through whitespace-nowrap">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {product.weight && (
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 rounded-[3px] whitespace-nowrap shrink-0">
              {formatSize(product.weight)}
            </span>
          )}
        </div>
      </div>

      {/* Ghorer Bazar Style Single Button (Image 1, 2, 3) */}
      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center">
        {quantity > 0 ? (
          <div className="w-full h-9 flex items-center rounded-[4px] overflow-hidden border border-[#f26522] shadow-2xs bg-white dark:bg-zinc-900">
            <button
              type="button"
              onClick={handleDecrement}
              className="w-9 sm:w-11 h-full flex items-center justify-center bg-[#f26522] hover:bg-[#0d2e26] active:scale-95 text-white font-bold text-base select-none transition-colors duration-150 cursor-pointer"
              aria-label="পরিমাণ কমান"
            >
              -
            </button>
            <span className="flex-1 h-full flex items-center justify-center bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-bold text-xs sm:text-sm select-none border-x border-[#f26522]/30">
              {formatSize(String(quantity))}
            </span>
            <button
              type="button"
              onClick={handleIncrement}
              className="w-9 sm:w-11 h-full flex items-center justify-center bg-[#f26522] hover:bg-[#0d2e26] active:scale-95 text-white font-bold text-base select-none transition-colors duration-150 cursor-pointer"
              aria-label="পরিমাণ বাড়ান"
            >
              +
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full h-9 py-1.5 px-2 sm:px-3 rounded-[4px] text-xs sm:text-sm font-semibold border border-[#f26522] bg-white text-[#f26522] hover:bg-[#f26522] hover:text-white transition-colors duration-150 flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-inherit" />
            <span>Add To Cart</span>
          </button>
        )}
      </div>
    </div>
  )
}
