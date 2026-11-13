"use client"

import { useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { ShoppingCart, Check, Loader2 } from "lucide-react"
import { addToCart } from "@lib/data/cart"

export default function PreviewAddToCart({
  variantId,
  productHandle,
  hasMultipleVariants,
  productTitle,
  thumbnail,
  price,
  variantTitle,
}: {
  variantId?: string
  productHandle?: string
  hasMultipleVariants?: boolean
  productTitle?: string
  thumbnail?: string | null
  price?: number
  variantTitle?: string
}) {
  const [isAdding, setIsAdding] = useState(false)
  const [isAdded, setIsAdded] = useState(false)
  const router = useRouter()
  const params = useParams()
  const countryCode = "bd"

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    // If no variant ID, navigate to product page
    if (!variantId) {
      router.push(`/${countryCode}/products/${productHandle}`)
      return
    }

    // 1. INSTANT (0ms) OPTIMISTIC UI FEEDBACK
    setIsAdded(true)
    setIsAdding(true)

    const resolvedThumbnail =
      thumbnail ||
      (productHandle?.includes("sundarban") || productHandle?.includes("kholisha")
        ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"
        : productHandle?.includes("mustard") || productHandle?.includes("sorisha")
        ? "https://res.cloudinary.com/dqseoiw8p/raw/upload/v1794166098/e9b3e553-c496-419a-a1ca-e817d73045f1_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg"
        : productHandle?.includes("black-seed") || productHandle?.includes("kalijira")
        ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167194/2f318c58-a2a2-48bc-80e6-56ccd4b5a553_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg.jpg"
        : null)

    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:item-added", {
          detail: {
            id: `opt_${Date.now()}`,
            title: productTitle || "খাঁটি প্রাকৃতিক মধু",
            variant: variantTitle || "৫০০ গ্রাম",
            price: price || 750,
            thumbnail: resolvedThumbnail,
            handle: productHandle,
            quantity: 1,
          },
        })
      )
    }

    try {
      // 2. Background Server Sync
      const res = await addToCart({
        variantId,
        quantity: 1,
        countryCode: "bd",
      })

      if (res && res.success === false) {
        throw new Error(res.error || "Failed to add to cart")
      }

      router.refresh()
    } catch (err) {
      console.error("Failed to add to cart:", err)
      setIsAdded(false)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-failed", {
            detail: {
              message: "কার্টে যোগ করতে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
            },
          })
        )
      }
    } finally {
      setIsAdding(false)
      setTimeout(() => setIsAdded(false), 2500)
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
