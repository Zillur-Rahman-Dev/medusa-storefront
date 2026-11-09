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
import { ShoppingBag, Truck, PhoneCall, ShieldCheck, RefreshCw, Star, CheckCircle, Loader2, Package } from "lucide-react"

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
  const countryCode = useParams().countryCode as string

  // If there is only 1 variant, preselect the options
  useEffect(() => {
    if (product.variants?.length === 1) {
      const variantOptions = optionsAsKeymap(product.variants[0].options)
      setOptions(variantOptions ?? {})
    }
  }, [product.variants])

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

    router.replace(pathname + "?" + params.toString())
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

  // add the selected variant to the cart
  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return null

    setIsAdding(true)

    const res = await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode: "bd",
    })
    if (res && res.success === false) {
      console.error("Add to cart error:", res.error)
    }
    router.refresh()
    setIsAdding(false)
  }

  // direct checkout: add to cart and immediately route to /checkout
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

        {/* Variant / Weight Selector */}
        <div>
          {(product.variants?.length ?? 0) > 1 && (
            <div className="flex flex-col gap-y-4">
              {(product.options || []).map((option) => {
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

          {/* Dynamic Packaging Badge */}
          <div className="mt-3 p-3 rounded-2xl bg-amber-50/90 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-center gap-2.5 text-xs text-amber-950 dark:text-amber-200 shadow-sm transition-all">
            <Package className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
            <span className="leading-relaxed">
              <strong className="text-amber-800 dark:text-amber-300">প্যাকেজিং:</strong> {packagingText}
            </span>
          </div>

          <div className="mt-4">
            <Divider />
          </div>
        </div>

        {/* Product Price */}
        <div className="py-2">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        {/* High Converting Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* 1. Direct Checkout Order Button (Amber / Orange) */}
          <button
            type="button"
            onClick={handleDirectCheckout}
            disabled={!inStock || !selectedVariant || isOrdering || isAdding}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base bg-amber-600 hover:bg-amber-700 text-white shadow-lg shadow-amber-600/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99] disabled:opacity-60"
          >
            {isOrdering ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Truck className="w-5 h-5" />
            )}
            <span>
              {isOrdering
                ? "চেকআউটে নেওয়া হচ্ছে..."
                : "সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)"}
            </span>
          </button>

          {/* 2. Add To Cart Button */}
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={
              !inStock ||
              !selectedVariant ||
              !!disabled ||
              isAdding ||
              isOrdering ||
              !isValidVariant
            }
            className="w-full py-3 px-6 rounded-2xl font-bold text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isAdding ? (
              <Loader2 className="w-4 h-4 animate-spin text-amber-600" />
            ) : (
              <ShoppingBag className="w-4 h-4 text-amber-600 dark:text-amber-400" />
            )}
            <span>{isAdding ? "কার্টে যোগ হচ্ছে..." : "কার্ট-এ যোগ করুন"}</span>
          </button>

          {/* 3. WhatsApp Direct Order */}
          <a
            href={`https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20${encodeURIComponent(product.title)}%20অর্ডার%20করতে%20চাই।`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full py-3 px-6 rounded-2xl font-semibold text-xs sm:text-sm bg-white dark:bg-zinc-900 border border-emerald-500/60 text-emerald-800 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors flex items-center justify-center gap-2"
          >
            <PhoneCall className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            <span>হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন</span>
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
