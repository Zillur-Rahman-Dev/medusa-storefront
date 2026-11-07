"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { addToCart } from "@lib/data/cart"

export default function PreviewAddToCart({
  variantId,
  productHandle,
  hasMultipleVariants,
}: {
  variantId?: string
  productHandle?: string
  hasMultipleVariants?: boolean
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If product has multiple sizes/variants or no variant ID, navigate to product page to let user select
    if (hasMultipleVariants || !variantId) {
      router.push(`/${countryCode}/products/${productHandle}`)
      return
    }

    setIsAdding(true)
    try {
      await addToCart({
        variantId,
        quantity: 1,
        countryCode,
      })
      setIsAdded(true)
      setTimeout(() => setIsAdded(false), 2000)
    } catch (err) {
      console.error("Failed to add to cart:", err)
      // Fallback: navigate to product page
      router.push(`/${countryCode}/products/${productHandle}`)
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isAdding}
      className={`flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all duration-200 active:scale-[0.98] shadow-sm ${
        isAdded
          ? "bg-emerald-600 text-white"
          : "bg-amber-600 hover:bg-amber-700 text-white"
      }`}
    >
      {isAdded ? (
        <>
          <Check className="w-4 h-4" />
          <span>যোগ হয়েছে</span>
        </>
      ) : isAdding ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>যোগ হচ্ছে...</span>
        </>
      ) : (
        <>
          <ShoppingCart className="w-4 h-4" />
          <span>কার্ট-এ যোগ</span>
        </>
      )}
    </button>
  )
}
