import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"

export default function ProductPrice({
  product,
  variant,
}: {
  product: HttpTypes.StoreProduct
  variant?: HttpTypes.StoreProductVariant
}) {
  const { cheapestPrice, variantPrice } = getProductPrice({
    product,
    variantId: variant?.id,
  })

  const selectedPrice = variant ? variantPrice : cheapestPrice

  if (!selectedPrice) {
    return <div className="block w-32 h-9 bg-gray-100 animate-pulse rounded-lg" />
  }

  const isSale =
    selectedPrice.price_type === "sale" ||
    selectedPrice.original_price_number > selectedPrice.calculated_price_number

  const savedAmount = Math.max(
    selectedPrice.original_price_number - selectedPrice.calculated_price_number,
    0
  )

  return (
    <div className="flex flex-col gap-1.5" data-testid="price-container">
      {/* Row 1: Bold Amber Sale Price + Strikethrough Regular Price (matching screenshot) */}
      <div className="flex items-baseline gap-3">
        <span
          className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 tracking-tight"
          data-testid="product-price"
          data-value={selectedPrice.calculated_price_number}
        >
          {selectedPrice.calculated_price}
        </span>

        {isSale && (
          <span
            className="text-base sm:text-lg text-zinc-400 dark:text-zinc-500 line-through font-medium"
            data-testid="original-product-price"
            data-value={selectedPrice.original_price_number}
          >
            {selectedPrice.original_price}
          </span>
        )}
      </div>

      {/* Row 2: Green Savings Badge (matching screenshot) */}
      {isSale && (
        <div className="inline-flex items-center gap-1.5 w-fit px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
          <span>৳{savedAmount} সাশ্রয়</span>
          <span>({selectedPrice.percentage_diff}% ছাড়)</span>
        </div>
      )}
    </div>
  )
}
