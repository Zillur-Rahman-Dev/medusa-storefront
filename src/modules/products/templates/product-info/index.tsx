import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Sparkles, Tag } from "lucide-react"

type ProductInfoProps = {
  product: HttpTypes.StoreProduct
}

const ProductInfo = ({ product }: ProductInfoProps) => {
  const metadata = (product.metadata as Record<string, any>) || {}
  const subtitle =
    product.subtitle ||
    metadata.sub_title ||
    product.description?.split("\n\n")[0]?.replace(/^#+\s*/, "") ||
    "১০০% খাঁটি ও প্রাকৃতিক কাঁচা মধু।"

  return (
    <div id="product-info" className="space-y-3">
      {/* Seasonal / Marketing Collection Pill */}
      {product.collection && (
        <div className="flex items-center gap-2">
          <LocalizedClientLink
            href={`/collections/${product.collection.handle}`}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 dark:bg-amber-500/15 text-amber-700 dark:text-amber-300 border border-amber-300/40 dark:border-amber-700/50 hover:bg-amber-500/20 transition-all duration-200"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>{product.collection.title}</span>
          </LocalizedClientLink>
        </div>
      )}

      {/* Main Title */}
      <Heading
        level="h1"
        className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      {/* Subtitle from Dashboard */}
      <p
        className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed font-medium"
        data-testid="product-description"
      >
        {subtitle}
      </p>

      {/* Tags Badges from Dashboard */}
      {product.tags && product.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          {product.tags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-0.5 rounded-lg bg-zinc-100 dark:bg-zinc-800/80 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 hover:border-amber-400 transition-colors"
            >
              <Tag className="w-2.5 h-2.5 text-amber-500" />
              <span>{tag.value}</span>
            </span>
          ))}
        </div>
      )}
    </div>
  )
}

export default ProductInfo
