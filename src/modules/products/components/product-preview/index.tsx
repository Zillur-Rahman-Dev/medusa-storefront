import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { Star } from "lucide-react"
import PreviewAddToCart from "./add-to-cart"

export default async function ProductPreview({
  product,
  isFeatured,
  region,
}: {
  product: HttpTypes.StoreProduct
  isFeatured?: boolean
  region: HttpTypes.StoreRegion
}) {
  const { cheapestPrice } = getProductPrice({
    product,
  })

  const hasMultipleVariants = (product.variants?.length ?? 0) > 1
  const defaultVariantId = product.variants?.[0]?.id

  return (
    <div className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-amber-500/80 dark:hover:border-amber-500/60 transition-all duration-300">
      <LocalizedClientLink
        href={`/products/${product.handle}`}
        className="block"
        data-testid="product-wrapper"
      >
        <div className="relative">
          <Thumbnail
            thumbnail={product.thumbnail}
            images={product.images}
            size="full"
            isFeatured={isFeatured}
          />
        </div>

        <div className="mt-3.5 space-y-1.5">
          {/* Star Rating preview */}
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">(৫.০)</span>
          </div>

          {/* Product Title */}
          <h3
            className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="pt-1 flex items-baseline gap-2">
            {cheapestPrice && (
              <div className="text-zinc-900 dark:text-zinc-100 font-black text-base sm:text-lg">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </LocalizedClientLink>

      {/* Action Button: 'কার্ট-এ যোগ' button for Store / Collections / Categories */}
      <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <PreviewAddToCart
          variantId={defaultVariantId}
          productHandle={product.handle}
          hasMultipleVariants={hasMultipleVariants}
        />
      </div>
    </div>
  )
}
