"use client"

import { useParams, useRouter } from "next/navigation"
import { ShoppingCart } from "lucide-react"
import { useCartItem } from "@lib/hooks/use-cart-item"
import { formatSize } from "@lib/util/money"

const MAX_ITEM_QUANTITY = 20

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
  const { quantity, setQuantity } = useCartItem(variantId, productHandle)
  const router = useRouter()
  const params = useParams()
  const countryCode = "bd"

  const resolvedThumbnail =
    thumbnail ||
    (productHandle?.includes("sundarban") || productHandle?.includes("kholisha")
      ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167286/c5582ba6-d0c3-43b3-afbf-57ead15f9b54_imgi_138_c9eefb3810ff098b0fc9651e2e21f012.jpg.jpg"
      : productHandle?.includes("mustard") || productHandle?.includes("sorisha")
      ? "https://res.cloudinary.com/dqseoiw8p/raw/upload/v1794166098/e9b3e553-c496-419a-a1ca-e817d73045f1_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg"
      : productHandle?.includes("black-seed") || productHandle?.includes("kalijira")
      ? "https://res.cloudinary.com/dqseoiw8p/image/upload/v1794167194/2f318c58-a2a2-48bc-80e6-56ccd4b5a553_imgi_176_1751782381-whatsapp-image-2025-07-05-at-9.47.28-pm.jpg.jpg"
      : null)

  // 1. Initial Add to Cart
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!variantId) {
      router.push(`/${countryCode}/products/${productHandle}`)
      return
    }

    setQuantity(1)

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
            variantId: variantId,
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

    if (!variantId) return
    if (quantity >= MAX_ITEM_QUANTITY) return

    const nextQty = Math.min(MAX_ITEM_QUANTITY, quantity + 1)
    setQuantity(nextQty)

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
            variantId: variantId,
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

    if (!variantId) return

    if (quantity > 1) {
      const nextQty = quantity - 1
      setQuantity(nextQty)

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-decremented", {
            detail: {
              variantId,
              handle: productHandle,
            },
          })
        )
      }
    } else {
      // Revert back to Add to Cart
      setQuantity(0)

      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-deleted", {
            detail: {
              variantId,
              handle: productHandle,
            },
          })
        )
      }
    }
  }

  if (quantity > 0) {
    return (
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
          disabled={quantity >= MAX_ITEM_QUANTITY}
          className="w-9 sm:w-11 h-full flex items-center justify-center bg-[#f26522] hover:bg-[#0d2e26] active:scale-95 text-white font-bold text-base select-none transition-colors duration-150 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
          aria-label="পরিমাণ বাড়ান"
          title={quantity >= MAX_ITEM_QUANTITY ? "সর্বোচ্চ ২০টি পণ্য যোগ করা যাবে" : "পরিমাণ বাড়ান"}
        >
          +
        </button>
      </div>
    )
  }

  return (
    <button
      type="button"
      onClick={handleAddToCart}
      className="w-full h-9 py-1.5 px-3 rounded-[4px] text-xs sm:text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors duration-150 active:scale-[0.98] shadow-2xs border border-[#f26522] bg-white text-[#f26522] hover:bg-[#f26522] hover:text-white cursor-pointer"
    >
      <ShoppingCart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-inherit" />
      <span>কার্টে যোগ করুন</span>
    </button>
  )
}
