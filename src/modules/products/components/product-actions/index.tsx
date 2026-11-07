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
import QuickOrderModal from "@modules/common/components/quick-order-modal"
import { ShoppingBag, Truck, PhoneCall, ShieldCheck, RefreshCw, Star, CheckCircle } from "lucide-react"

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

export default function ProductActions({
  product,
  disabled,
}: ProductActionsProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [options, setOptions] = useState<Record<string, string | undefined>>({})
  const [isAdding, setIsAdding] = useState(false)
  const [isQuickOrderOpen, setIsQuickOrderOpen] = useState(false)
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

    await addToCart({
      variantId: selectedVariant.id,
      quantity: 1,
      countryCode,
    })

    setIsAdding(false)
  }

  const rawPrice =
    selectedVariant?.calculated_price?.calculated_amount ??
    product.variants?.[0]?.calculated_price?.calculated_amount ??
    750

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
            • ১০০% খাঁটি কাঁচা মধু
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
              <Divider />
            </div>
          )}
        </div>

        {/* Product Price */}
        <div className="py-2">
          <ProductPrice product={product} variant={selectedVariant} />
        </div>

        {/* GhorerBazar High Converting Action Buttons */}
        <div className="space-y-3 pt-2">
          {/* 1. Quick COD Order Button (Primary Emerald Green) */}
          <button
            type="button"
            onClick={() => setIsQuickOrderOpen(true)}
            className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm sm:text-base bg-emerald-700 hover:bg-emerald-800 text-white shadow-lg shadow-emerald-700/25 transition-all flex items-center justify-center gap-2 active:scale-[0.99]"
          >
            <Truck className="w-5 h-5" />
            <span>সরাসরি অর্ডার করুন (ক্যাশ অন ডেলিভারি)</span>
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
              !isValidVariant
            }
            className="w-full py-3 px-6 rounded-2xl font-bold text-sm bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-700 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <ShoppingBag className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
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

        {/* GhorerBazar Delivery & Trust Box */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/80 dark:border-zinc-800 space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
          <div className="flex items-center gap-2.5">
            <Truck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>ডেলিভারি চার্জ:</strong> ঢাকার মধ্যে ৳৭০, ঢাকার বাইরে ৳১৩০
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <ShieldCheck className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>১০০% ক্যাশ অন ডেলিভারি:</strong> পার্সেল হাতে পেয়ে টেস্ট করে পেমেন্ট করুন
            </span>
          </div>
          <div className="flex items-center gap-2.5">
            <RefreshCw className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
            <span>
              <strong>রিটার্ন পলিসি:</strong> ভেঙে গেলে বা ক্ষতিগ্রস্ত হলে সাথে সাথে নতুন জার প্রদান
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

      {/* 1-Click Quick Order Modal */}
      <QuickOrderModal
        isOpen={isQuickOrderOpen}
        onClose={() => setIsQuickOrderOpen(false)}
        product={{
          title: product.title,
          price: rawPrice,
          thumbnail: product.thumbnail,
          size: selectedVariant?.title,
        }}
      />
    </>
  )
}
