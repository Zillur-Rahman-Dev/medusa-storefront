import { useMemo } from "react"
import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import PreviewAddToCart from "./add-to-cart"
import { formatSize } from "@lib/util/money"
import { WEIGHT_OPTIONS } from "@modules/store/components/weight-filter"

export default function ProductPreview({
  product,
  isFeatured,
  region,
  selectedWeight,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
  selectedWeight?: string
}) {
  // 1. Resolve matching variant if a weight filter is selected (e.g. "2kg", "1kg", "500g")
  const matchedVariant = useMemo(() => {
    if (!selectedWeight || selectedWeight === "all" || !product.variants?.length) {
      return null
    }

    const weightOpt = WEIGHT_OPTIONS.find((w) => w.id === selectedWeight)
    if (!weightOpt) return null

    return product.variants.find((v) => {
      const optVal = v.options?.[0]?.value || ""
      const metaWeight = (v.metadata as Record<string, any>)?.weight || ""
      const prodWeight =
        (product.metadata as Record<string, any>)?.weight ||
        (product.weight ? `${product.weight}g` : "")
      return weightOpt.matches(v.title || optVal, metaWeight || prodWeight)
    })
  }, [product.variants, product.metadata, product.weight, selectedWeight])

  const targetVariant = matchedVariant || product.variants?.[0]
  const targetVariantId = targetVariant?.id
  const hasMultipleVariants = (product.variants?.length ?? 0) > 1

  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: targetVariantId,
  })

  // Display the matched variant price if filtered, otherwise the cheapest starting price
  const activePrice = (matchedVariant && variantPrice) ? variantPrice : cheapestPrice

  // Determine weight badge text
  const displayWeight = useMemo(() => {
    if (matchedVariant) {
      const optVal = matchedVariant.options?.[0]?.value
      const metaWeight = (matchedVariant.metadata as Record<string, any>)?.weight
      const rawTitle = matchedVariant.title
      const cleanTitle =
        rawTitle &&
        rawTitle.toLowerCase() !== "default variant" &&
        rawTitle.toLowerCase() !== "default option" &&
        rawTitle.toLowerCase() !== "ডিফল্ট"
          ? rawTitle
          : null

      return metaWeight || cleanTitle || optVal || selectedWeight
    }

    const variantOptionValue = product.variants?.[0]?.options?.[0]?.value
    const variantTitle = product.variants?.[0]?.title
    const cleanVariantTitle =
      variantTitle &&
      variantTitle.toLowerCase() !== "default variant" &&
      variantTitle.toLowerCase() !== "default option" &&
      variantTitle.toLowerCase() !== "ডিফল্ট"
        ? variantTitle
        : null

    return (
      (product.metadata?.weight as string) ||
      (product.variants?.[0]?.metadata as Record<string, any>)?.weight ||
      variantOptionValue ||
      cleanVariantTitle ||
      (product.weight ? `${product.weight}g` : null) ||
      "১ কেজি"
    )
  }, [matchedVariant, product, selectedWeight])

  return (
    <div className="relative group flex flex-col justify-between h-full bg-white dark:bg-zinc-900 p-3 rounded-[6px] border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200">
      {/* Top Badges matching Image 1 */}
      <div className="absolute top-2 left-2 z-10 flex items-center gap-1.5">
        <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#ea580c] rounded-[3px] shadow-2xs select-none">
          Best Selling
        </span>
      </div>

      {activePrice?.percentage_diff && Number(activePrice.percentage_diff) > 0 && (
        <div className="absolute top-2 right-2 z-10">
          <span className="px-2 py-0.5 text-[10px] font-bold text-white bg-[#00a651] rounded-[3px] shadow-2xs select-none">
            Save {activePrice.percentage_diff}%
          </span>
        </div>
      )}

      <LocalizedClientLink
        href={
          targetVariantId
            ? `/products/${product.handle}?v_id=${targetVariantId}`
            : `/products/${product.handle}`
        }
        className="block"
        data-testid="product-wrapper"
      >
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="square"
            isFeatured={isFeatured}
          />
        </div>

        <div className="mt-2.5 space-y-1.5">
          {/* Product Title */}
          <h3
            className="font-medium text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm line-clamp-2 group-hover:text-[#f26522] dark:group-hover:text-[#f26522] transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Compact Single Row: Price on LEFT, Weight badge on RIGHT (always resolved dynamically) */}
          <div className="pt-0.5 flex items-center justify-between gap-1">
            {activePrice && (
              <div className="flex items-baseline gap-1 sm:gap-1.5 text-sm sm:text-base font-bold text-[#f26522] flex-wrap min-w-0">
                <span className="text-[#f26522] whitespace-nowrap">{activePrice.calculated_price}</span>
                {activePrice.price_type === "sale" && (
                  <span className="line-through text-zinc-400 text-[10px] sm:text-[11px] font-normal whitespace-nowrap">
                    {activePrice.original_price}
                  </span>
                )}
              </div>
            )}
            <span className="px-1.5 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 border border-amber-200/60 dark:border-amber-800/60 rounded-[3px] whitespace-nowrap shrink-0">
              {formatSize(displayWeight)}
            </span>
          </div>
        </div>
      </LocalizedClientLink>

      {/* Action Button: 'Add To Cart' button for Store / Collections / Categories with instant Optimistic UI */}
      <div className="mt-3 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center">
        <PreviewAddToCart
          key={targetVariantId}
          variantId={targetVariantId}
          productHandle={product.handle}
          hasMultipleVariants={hasMultipleVariants}
          productTitle={product.title}
          thumbnail={product.thumbnail || product.images?.[0]?.url}
          price={activePrice?.calculated_price_number}
          variantTitle={targetVariant?.title || formatSize(displayWeight)}
        />
      </div>
    </div>
  )
}
