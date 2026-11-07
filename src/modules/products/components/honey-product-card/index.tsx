"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Star, ShoppingCart, Truck, Check, Loader2 } from "lucide-react"
import { addToCart } from "@lib/data/cart"

export type HoneyProductItem = {
  id: string
  title: string
  handle: string
  variantId: string
  weight: string
  price: number
  regularPrice: number
  icon: string
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

  // 1. Add to Cart (updates line items in Medusa backend & header cart count)
  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) return

    setIsAdding(true)
    try {
      await addToCart({
        variantId: product.variantId,
        quantity: 1,
        countryCode,
      })
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (err) {
      console.error("Failed to add to cart:", err)
    } finally {
      setIsAdding(false)
    }
  }

  // 2. Direct Medusa Checkout (adds item to cart and immediately navigates to /checkout?step=address)
  const handleOrderNow = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!product.variantId) {
      router.push("/bd/checkout?step=address")
      return
    }

    setIsOrdering(true)
    try {
      await addToCart({
        variantId: product.variantId,
        quantity: 1,
        countryCode,
      })
      router.push("/bd/checkout?step=address")
    } catch (err) {
      console.error("Failed to add to cart for direct checkout:", err)
      router.push("/bd/checkout?step=address")
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
        {/* Product Image without any outer border matching user request */}
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="block aspect-square w-full rounded-2xl bg-transparent p-6 flex items-center justify-center text-7xl select-none group-hover:scale-105 transition-transform"
        >
          <span>{product.icon}</span>
        </LocalizedClientLink>

        {/* 5-Star Rating & Review Count */}
        <div className="mt-4 flex items-center gap-1.5 text-xs text-amber-500">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            ))}
          </div>
          <span className="text-[11px] text-zinc-400 font-medium">
            ({product.reviewCount || 48})
          </span>
        </div>

        {/* Product Title */}
        <LocalizedClientLink href={`/products/${product.handle}`} className="block mt-2">
          <h3 className="font-bold text-sm sm:text-base text-zinc-900 dark:text-zinc-100 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors line-clamp-2">
            {product.title}
          </h3>
        </LocalizedClientLink>

        {/* Pack Size / Weight */}
        <div className="text-xs text-zinc-400 mt-1">
          {product.weight}
        </div>

        {/* Price (Bold Amber Price + Regular strikethrough price) */}
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-lg sm:text-xl font-black text-amber-600 dark:text-amber-400">
            ৳{product.price}
          </span>
          <span className="text-xs sm:text-sm text-zinc-400 line-through">
            ৳{product.regularPrice}
          </span>
        </div>
      </div>

      {/* Dual Buttons matching exact user screenshot */}
      <div className="mt-5 pt-3 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        {/* Button 1: কার্ট-এ যোগ */}
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={isAdding || isOrdering}
          className={`flex-1 py-2.5 px-2.5 rounded-xl text-xs font-bold border transition-all flex items-center justify-center gap-1.5 ${
            isAdded
              ? "bg-emerald-50 text-emerald-700 border-emerald-500 dark:bg-emerald-950/60 dark:text-emerald-300"
              : "border-zinc-300 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"
          }`}
        >
          {isAdded ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>যোগ হয়েছে</span>
            </>
          ) : (
            <>
              {isAdding ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <ShoppingCart className="w-3.5 h-3.5" />
              )}
              <span>{isAdding ? "যোগ হচ্ছে..." : "কার্ট-এ যোগ"}</span>
            </>
          )}
        </button>

        {/* Button 2: অর্ডার করুন (Direct to Medusa Checkout) */}
        <button
          type="button"
          onClick={handleOrderNow}
          disabled={isOrdering || isAdding}
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
