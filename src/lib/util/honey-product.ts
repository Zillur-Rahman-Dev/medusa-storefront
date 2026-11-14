import { HttpTypes } from "@medusajs/types"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

export function mapMedusaProductToHoneyItem(
  product: HttpTypes.StoreProduct,
  fallbackBadge?: string
): HoneyProductItem {
  const cheapestVariant = product.variants?.[0]
  const calcPrice = cheapestVariant?.calculated_price
  const price = calcPrice?.calculated_amount ?? 1000

  // Original / regular price: ONLY show strikethrough if applied in Medusa Admin Dashboard!
  // Checks:
  // 1. Medusa Price List sale price (original_amount > calculated_amount)
  // 2. Dashboard Product/Variant metadata (regular_price or original_price > price)
  const metaRegularPrice = Number(
    (cheapestVariant?.metadata as Record<string, any>)?.regular_price ||
    (cheapestVariant?.metadata as Record<string, any>)?.original_price ||
    (product.metadata as Record<string, any>)?.regular_price ||
    (product.metadata as Record<string, any>)?.original_price
  )

  const originalAmount = calcPrice?.original_amount
    ? Number(calcPrice.original_amount)
    : undefined

  const regularPrice =
    originalAmount && originalAmount > price
      ? originalAmount
      : metaRegularPrice && metaRegularPrice > price
      ? metaRegularPrice
      : undefined

  // Weight badge: read from variant option value or product metadata
  const weight =
    cheapestVariant?.options?.[0]?.value ||
    (product.metadata?.weight as string) ||
    "১ কেজি কাচের জার"

  // Thumbnail / real dashboard image from Cloudinary or Medusa
  const thumbnail =
    product.thumbnail ||
    product.images?.[0]?.url ||
    null

  // Badge: prioritize product metadata badge, or fallback badge
  const badge =
    (product.metadata?.badge as string) ||
    fallbackBadge ||
    undefined

  return {
    id: product.id,
    title: product.title,
    handle: product.handle,
    variantId: cheapestVariant?.id || "",
    weight,
    price,
    regularPrice,
    thumbnail,
    images: product.images,
    badge,
  }
}
