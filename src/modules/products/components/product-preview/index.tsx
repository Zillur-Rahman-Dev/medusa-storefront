import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { ShoppingBag, Star } from "lucide-react"

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

  return (
    <LocalizedClientLink
      href={`/products/${product.handle}`}
      className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-900/40 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-amber-400 dark:hover:border-amber-500/50"
    >
      <div data-testid="product-wrapper">
        <Thumbnail
          thumbnail={product.thumbnail}
          images={product.images}
          size="full"
          isFeatured={isFeatured}
        />

        <div className="mt-3.5 space-y-1.5">
          {/* Star Rating preview */}
          <div className="flex items-center gap-1 text-xs text-amber-500">
            <div className="flex items-center">
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
              <Star className="w-3.5 h-3.5 fill-amber-500" />
            </div>
            <span className="text-[11px] text-zinc-500 dark:text-zinc-400">(৫.০)</span>
          </div>

          {/* Product Title */}
          <h3
            className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base line-clamp-2 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          {/* Price */}
          <div className="pt-1 flex items-baseline gap-2">
            {cheapestPrice && (
              <div className="text-zinc-900 dark:text-zinc-100 font-bold text-base sm:text-lg">
                <PreviewPrice price={cheapestPrice} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action CTA Button */}
      <div className="mt-4 pt-2">
        <div className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold flex items-center justify-center gap-2 bg-amber-50 text-amber-800 border border-amber-200/80 group-hover:bg-amber-600 group-hover:text-white group-hover:border-transparent dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/60 dark:group-hover:bg-amber-500 dark:group-hover:text-zinc-950 transition-all duration-200">
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>অর্ডার করুন</span>
        </div>
      </div>
    </LocalizedClientLink>
  )
}
