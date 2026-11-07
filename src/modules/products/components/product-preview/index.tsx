import { getProductPrice } from "@lib/util/get-product-price"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Thumbnail from "../thumbnail"
import PreviewPrice from "./price"
import { ShoppingBag, Star, Truck } from "lucide-react"

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
    <div className="group flex flex-col justify-between h-full bg-white dark:bg-zinc-900 p-3 sm:p-4 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:border-emerald-600/80 dark:hover:border-emerald-500/60 transition-all duration-300">
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
          <div className="absolute top-2.5 left-2.5 z-10">
            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-emerald-700 text-white shadow-sm">
              খাঁটি কাঁচা মধু
            </span>
          </div>
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
            className="font-bold text-zinc-900 dark:text-zinc-100 text-sm sm:text-base line-clamp-2 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors"
            data-testid="product-title"
          >
            {product.title}
          </h3>

          <div className="text-[11px] text-zinc-500 dark:text-zinc-400 font-medium">
            ফুড-গ্রেড বায়ুরোধী কাচের জার
          </div>

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

      {/* GhorerBazar Action Buttons */}
      <div className="mt-4 pt-2 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-2">
        <LocalizedClientLink
          href={`/products/${product.handle}`}
          className="flex-1 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 bg-emerald-700 hover:bg-emerald-800 text-white shadow-sm transition-all active:scale-[0.98]"
        >
          <ShoppingBag className="w-3.5 h-3.5" />
          <span>অর্ডার করুন</span>
        </LocalizedClientLink>
      </div>
    </div>
  )
}
