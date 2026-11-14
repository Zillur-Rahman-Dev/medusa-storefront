"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { ShoppingCart, Truck, Check, Loader2 } from "lucide-react"
import { addToCart } from "@lib/data/cart"
import { formatPrice, formatSize } from "@lib/util/money"

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
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"

  // 1. Add to Cart (updates line items in Medusa backend & header cart count with instant Optimistic UI)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId || isAdding || isAdded || isOrdering) return

    // 1. Instant Optimistic Feedback (0ms)
    setIsAdded(true)
    setIsAdding(true)

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
            quantity: 1,
          },
        })
      )
    }

    const startTime = Date.now()
    try {
      const res = await addToCart({
        variantId: product.variantId,
        quantity: 1,
        countryCode: "bd",
      })
      if (res && res.success === false) {
        throw new Error(res.error || "Failed to add to cart")
      }
      router.refresh()

      // Ensure minimum visual dwell time of 1200ms so the user comfortably sees "যোগ হয়েছে"
      const elapsed = Date.now() - startTime
      const remainingTime = Math.max(0, 1200 - elapsed)
      setTimeout(() => {
        setIsAdded(false)
        setIsAdding(false)
      }, remainingTime)
    } catch (err) {
      console.error("Failed to add to cart:", err)
      setIsAdded(false)
      setIsAdding(false)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-failed", {
            detail: {
              message: "কার্টে যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
            },
          })
        )
      }
    }
  }

  // 2. Direct Medusa Checkout (adds item to cart and immediately navigates to /checkout?step=address)
  const handleOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) {
      router.push("/bd/checkout")
      return
    }

    setIsOrdering(true)
    try {
      await addToCart({
        variantId: product.variantId,
        quantity: 1,
        countryCode: "bd",
      })
      router.push("/bd/checkout")
    } catch (err) {
      console.error("Failed to add to cart for direct checkout:", err)
      router.push("/bd/checkout")
    } finally {
      setIsOrdering(false)
    }
  }

  return (
    <div className="relative flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 hover:border-amber-500/80 dark:hover:border-amber-500/80 shadow-sm hover:shadow-xl transition-all duration-300 group">
      {/* Top Badge matching screenshot */}
      {product.badge && (
        <div className="absolute top-3.5 right-3.5 z-10">
          <span className="px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-md bg-amber-500 text-white shadow-sm">
            {product.badge}
          </span>
        </div>
      )}

      <div>
        {/* Product Real Image from Medusa Dashboard */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="relative block aspect-square w-full rounded-2xl overflow-hidden bg-gradient-to-b from-amber-50/40 to-transparent dark:from-zinc-800/30 dark:to-transparent p-2 sm:p-3 flex items-center justify-center transition-all duration-300"
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
            <span className="text-6xl drop-shadow-sm select-none transition-transform duration-300 group-hover:scale-110">
              {product.icon}
            </span>
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-amber-50/80 via-amber-100/40 to-orange-50/60 dark:from-zinc-800/60 dark:to-zinc-900/60 rounded-xl select-none">
              <span className="text-5xl sm:text-6xl drop-shadow-sm transition-transform duration-300 group-hover:scale-110">🍯</span>
              <span className="text-[11px] font-black tracking-wider uppercase text-amber-800/80 dark:text-amber-400 mt-2">
                ১০০% খাঁটি মধু
              </span>
            </div>
          )}
        </LocalizedClientLink>

        {/* Product Title */}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block mt-3">
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {/* Compact Single Row: Price on LEFT, Weight / Kg on RIGHT */}
        <div className="mt-3 flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400">
              {formatPrice(product.price)}
            </span>
            {product.regularPrice && (
              <span className="text-xs text-zinc-400 line-through">
                {formatPrice(product.regularPrice)}
              </span>
            )}
          </div>

          {product.weight && (
            <span className="px-2 py-0.5 text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 rounded-full whitespace-nowrap">
              {formatSize(product.weight)}
            </span>
          )}
        </div>
      </div>

      {/* Dual Buttons matching exact user screenshot */}
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        {/* Button 1: কার্ট-এ যোগ */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || isAdded || isOrdering}
          className={`flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            isAdded
              ? "bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>যোগ হয়েছে</span>
            </>
          ) : (
            <>
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>কার্ট-এ যোগ</span>
            </>
          )}
        </button>

        {/* Button 2: অর্ডার করুন (Direct to Medusa Checkout) */}
        <button
          type="button"
          onClick={handleOrderNow}
          disabled={isOrdering || isAdding || isAdded}
          className="flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 active:scale-[0.98] shadow-sm transition-all flex items-center justify-center gap-1.5 disabled:opacity-80"
        >
          {isOrdering ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <Truck className="w-3.5 h-3.5" />
          )}
          <span>{isOrdering ? "অর্ডার হচ্ছে..." : "অর্ডার করুন"}</span>
        </button>
      </div>
    </div>
  )
}
