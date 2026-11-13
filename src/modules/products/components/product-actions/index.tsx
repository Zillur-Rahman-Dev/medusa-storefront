"use client"

import { addToCart } from "@lib/data/cart"
import { useIntersection } from "@lib/hooks/use-in-view"
import { HttpTypes } from "@medusajs/types"
import Divider from "@modules/common/components/divider"
import OptionSelect from "@modules/products/components/product-actions/option-select"
import { isEqual } from "lodash"
import { useParams, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useMemo, useRef, useState } from "react"
import ProductPrice from "../product-price"
import MobileActions from "./mobile-actions"
import { useRouter } from "next/navigation"
import { ShoppingBag, Truck, PhoneCall, ShieldCheck, RefreshCw, Star, CheckCircle, Loader2, Package, MessageCircle } from "lucide-react"

type ProductActionsProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  disabled?: boolean
}

const optionsAsKeymap = (
  variantOptions: HttpTypes.StoreProductVariant["options"]
) => {
  return variantOptions?.reduce((acc: Record<string, string>, varopt: any) => {
    acc[varopt.option_id] = varopt.value
    return acc
  }, {})
}

const formatSizeInBengali = (sizeStr: string = "") => {
  const bnDigits: Record<string, string> = {
    "0": "০", "1": "১", "2": "২", "3": "৩", "4": "৪",
    "5": "৫", "6": "৬", "7": "৭", "8": "৮", "9": "৯",
  }
  let converted = sizeStr.replace(/\d/g, (d) => bnDigits[d] || d)
  converted = converted
    .replace(/kg/gi, " কেজি")
    .replace(/\b(gm|g)\b/gi, " গ্রাম")
    .trim()
  return converted
}

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isOrdering, setIsOrdering] = useState(false)
  const [isOptimisticAdded, setIsOptimisticAdded] = useState(false)
  const countryCode = useParams().countryCode as string

  // Pre-select variant: Default to the 1st variant (or variant from URL `?v_id=...`)
  useEffect(() => {
    if (!product.variants || product.variants.length === 0) return

    const urlVariantId = searchParams.get("v_id")
    const targetVariant =
      product.variants.find((v) => v.id === urlVariantId) ||
      product.variants[0]

    if (targetVariant) {
      const variantOptions = optionsAsKeymap(targetVariant.options)
      if (variantOptions) {
        setOptions((prev) => {
          if (isEqual(prev, variantOptions)) return prev
          return variantOptions
        })
      }
    }
  }, [product.variants, searchParams])

  const selectedVariant = useMemo(() => {
    if (!product.variants || product.variants.length === 0) {
      return
    }

    return product.variants.find((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  // update the options when a variant is selected
  const setOptionValue = (optionId: string, value: string) => {
    setOptions((prev) => ({
      ...prev,
      [optionId]: value,
    }))
  }

  // check if the selected options produce a valid variant
  const isValidVariant = useMemo(() => {
    return product.variants?.some((v) => {
      const variantOptions = optionsAsKeymap(v.options)
      return isEqual(variantOptions, options)
    })
  }, [product.variants, options])

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const value = isValidVariant ? selectedVariant?.id : null

    if (params.get("v_id") === value) {
      return
    }

    if (value) {
      params.set("v_id", value)
    } else {
      params.delete("v_id")
    }

    window.history.replaceState(null, "", pathname + "?" + params.toString())
  }, [selectedVariant, isValidVariant])

  // check if the selected variant is in stock
  const inStock = useMemo(() => {
    if (selectedVariant && !selectedVariant.manage_inventory) {
      return true
    }

    if (selectedVariant?.allow_backorder) {
      return true
    }

    if (
      selectedVariant?.manage_inventory &&
      (selectedVariant?.inventory_quantity || 0) > 0
    ) {
      return true
    }

    return false
  }, [selectedVariant])

  const actionsRef = useRef<HTMLDivElement>(null)
  const inView = useIntersection(actionsRef, "0px")

  // Add the selected variant to the cart with instant Optimistic UI response
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    // 1. INSTANT (0ms) OPTIMISTIC UI FEEDBACK
    setIsOptimisticAdded(true)
    setIsAdding(true)

    // Trigger instant toast and navbar cart badge jump
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("cart:item-added", {
          detail: {
            title: product.title,
            variant: selectedVariant.title,
            price: rawPrice,
          },
        })
      )
    }

    try {
      // 2. Background Server Sync
      const res = await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode: "bd",
      })

      if (res && res.success === false) {
        throw new Error(res.error || "Failed to add to cart")
      }

      router.refresh()
    } catch (err: any) {
      console.error("Optimistic add to cart failed, rolling back:", err)
      // 3. Rollback on failure
      setIsOptimisticAdded(false)
      if (typeof window !== "undefined") {
        window.dispatchEvent(
          new CustomEvent("cart:item-failed", {
            detail: {
              message: "ইন্টারনেট সংযোগে সমস্যা হয়েছে। আবার চেষ্টা করুন।",
            },
          })
        )
      }
    } finally {
      setIsAdding(false)
      // Reset optimistic success checkmark after 2.5s
      setTimeout(() => {
        setIsOptimisticAdded(false)
      }, 2500)
    }
  }

  // direct checkout: immediate feedback and fast route to /checkout
  const handleDirectCheckout = async () => {
    if (!selectedVariant?.id) return
    setIsOrdering(true)
    try {
      await addToCart({
        variantId: selectedVariant.id,
        quantity: 1,
        countryCode: "bd",
      })
      router.push("/bd/checkout?step=address")
    } catch (err) {
      console.error("Direct checkout add to cart error:", err)
      router.push("/bd/checkout?step=address")
    } finally {
      setIsOrdering(false)
    }
  }

  const rawPrice =
    selectedVariant?.calculated_price?.calculated_amount ??
    product.variants?.[0]?.calculated_price?.calculated_amount ??
    750

  const packagingText = useMemo(() => {
    const metaPackaging =
      (selectedVariant?.metadata as Record<string, any>)?.packaging ||
      (product?.metadata as Record<string, any>)?.packaging
    if (metaPackaging) return metaPackaging

    if (selectedVariant?.material?.trim()) {
      return selectedVariant.material.trim()
    }

    const currentTitle =
      selectedVariant?.title || product.variants?.[0]?.title || ""

    // Check if the product or variant indicates size/weight
    const hasSizeOption =
      product.options?.some((opt) =>
        ["size", "ওজন", "সাইজ", "ওজন/সাইজ"].includes(
          opt.title?.toLowerCase() || ""
        )
      ) || /\d+\s*(kg|g|gm|ml|কেজি|গ্রাম|লিটার)/i.test(currentTitle)

    // If no size option and no explicit packaging note, hide the badge
    if (!hasSizeOption) {
      return null
    }

    const sizeBn = formatSizeInBengali(currentTitle) || "১ কেজি"
    return `১টি একক ${sizeBn} ফুড-গ্রেড পাত্রে সুরক্ষিত ডেলিভারি`
  }, [selectedVariant, product])

  return (
    <>
      <div className="flex flex-col gap-y-4" ref={actionsRef}>
        {/* Stock Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>স্টকে আছে (ইন স্টক)</span>
          </span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400">
            • {((product.metadata as Record<string, any>)?.badge) || "১০০% খাঁটি কাঁচা মধু"}
          </span>
        </div>

        {/* Variant / Weight Selector (Shows even if 1 variant for design consistency) */}
        <div>
          {(product.options || []).some(
            (opt) =>
              opt.title?.toLowerCase() !== "default option" &&
              !opt.values?.some((v) => v.value === "Default Option Value")
          ) && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
                if (
                  option.title?.toLowerCase() === "default option" ||
                  option.values?.some((v) => v.value === "Default Option Value")
                ) {
                  return null
                }

                return (
                  <div key={option.id}>
                    <OptionSelect
                      option={option}
                      current={options[option.id]}
                      updateOption={setOptionValue}
                      title={option.title ?? ""}
                      data-testid="product-options"
                      disabled={!!disabled || isAdding}
                    />
                  </div>
                )
              })}
            </div>
          )}

          {/* Dynamic Packaging Badge (Compact & Sleek) */}
          {packagingText && (
            <div className="mt-2 py-1.5 px-3 rounded-lg bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2 text-xs text-amber-950 dark:text-amber-200 shadow-sm transition-all">
              <Package className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span className="leading-snug">
                <strong className="text-amber-800 dark:text-amber-300">প্যাকেজিং:</strong> {packagingText}
              </span>
            </div>
          )}

          <div className="mt-2.5">
            <Divider />
          </div>
        </div>

        {/* Product Price */}
        <div className="py-1">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        {/* 4-Button Grid (Exact match with reference design) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
          {/* 1. Add To Cart Button (Top-Left: Instant Optimistic UI feedback) */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isOrdering ||
              !isValidVariant
            }
            className={`w-full h-11 sm:h-12 px-4 rounded-xl font-bold text-sm sm:text-base border-2 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 cursor-pointer ${
              isOptimisticAdded
                ? "bg-emerald-50 dark:bg-emerald-950/60 border-emerald-600 dark:border-emerald-500 text-emerald-800 dark:text-emerald-300 shadow-md shadow-emerald-500/20"
                : "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-zinc-900 dark:border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800"
            }`}
          >
            {isOptimisticAdded ? (
              <>
                <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400 animate-in zoom-in-75 duration-200" />
                <span>কার্টে যোগ হয়েছে! ✓</span>
              </>
            ) : isAdding ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-zinc-900 dark:text-zinc-100" />
                <span>যোগ হচ্ছে...</span>
              </>
            ) : (
              <span>কার্টে যোগ করুন</span>
            )}
          </button>

          {/* 2. Direct Order Button (Top-Right: Warm Amber matching "পণ্যের বিবরণ ও তথ্য" tab) */}
          <button
            type="button"
            onClick={handleDirectCheckout}
            disabled={!inStock || !selectedVariant || isOrdering}
            className="w-full h-11 sm:h-12 px-4 rounded-xl font-bold text-sm sm:text-base bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-600/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-60 cursor-pointer"
          >
            {isOrdering ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                <span>চেকআউটে নেওয়া হচ্ছে...</span>
              </>
            ) : (
              <>
                <ShoppingBag className="w-4 h-4 text-white" />
                <span>অর্ডার করুন</span>
              </>
            )}
          </button>

          {/* 3. WhatsApp Order Button (Bottom-Left: WhatsApp Vibrant Green) */}
          <a
            href={`https://wa.me/8801999602203?text=আসসালামু%20আলাইকুম,%20আমি%20${encodeURIComponent(product.title)}%20(${selectedVariant?.title || ""})%20অর্ডার%20করতে%20চাই।`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full h-11 sm:h-12 px-4 rounded-xl font-bold text-xs sm:text-sm bg-[#25D366] hover:bg-[#20ba59] text-white shadow-sm transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <MessageCircle className="w-4 h-4 fill-white shrink-0" />
            <span>হোয়াটসঅ্যাপে অর্ডার করুন</span>
          </a>

          {/* 4. Call Order Button (Bottom-Right: White with black border) */}
          <a
            href={`tel:${((product.metadata as Record<string, any>)?.call_phone) || "09678812525"}`}
            className="w-full h-11 sm:h-12 px-4 rounded-xl font-bold text-xs sm:text-sm bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border-2 border-zinc-900 dark:border-zinc-200 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-all flex items-center justify-center gap-2 active:scale-[0.98] cursor-pointer"
          >
            <PhoneCall className="w-4 h-4 text-zinc-900 dark:text-zinc-100 shrink-0" />
            <span>কল অর্ডার: {((product.metadata as Record<string, any>)?.call_phone) || "09678812525"}</span>
          </a>
        </div>

        {/* Delivery & Trust Box */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span>
              <strong>ডেলিভারি চার্জ:</strong>{" "}
              {((product.metadata as Record<string, any>)?.delivery_charge) ||
                "ঢাকার মধ্যে ৳৭০, ঢাকার বাইরে ৳১৩০"}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>১০০% ক্যাশ অন ডেলিভারি:</strong>{" "}
              {((product.metadata as Record<string, any>)?.cod_note) ||
                "পার্সেল হাতে পেয়ে টেস্ট করে পেমেন্ট করুন"}
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>রিটার্ন ও রিপ্লেসমেন্ট:</strong>{" "}
              {((product.metadata as Record<string, any>)?.return_policy) ||
                "ডেলিভারির সময় পাত্রে কোনো ক্ষতি বা লিক পরিলক্ষিত হলে সাথে সাথে সম্পূর্ণ ফ্রিতে নতুন মধু প্রদান"}
            </span>
          </div>
        </div>

        <MobileActions
          product={product}
          variant={selectedVariant}
          options={options}
          updateOptions={setOptionValue}
          inStock={inStock}
          handleAddToCart={handleAddToCart}
          isAdding={isAdding}
          show={!inView}
          optionsDisabled={!!disabled || isAdding}
        />
      </div>
    </>
  )
}
