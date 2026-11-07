import { HttpTypes } from "@medusajs/types"
import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"

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
    <div id="product-info" className="space-y-2">
      {product.collection && (
        <LocalizedClientLink
          href={`/collections/${product.collection.handle}`}
          className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline uppercase tracking-wider"
        >
          {product.collection.title}
        </LocalizedClientLink>
      )}

      <Heading
        level="h1"
        className="text-2xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight"
        data-testid="product-title"
      >
        {product.title}
      </Heading>

      <p
        className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
        data-testid="product-description"
      >
        {subtitle}
      </p>
    </div>
  )
}

export default ProductInfo
