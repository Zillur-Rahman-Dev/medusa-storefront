import { HttpTypes } from "@medusajs/types"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

export function mapMedusaProductToHoneyItem(
  product: HttpTypes.StoreProduct,
  fallbackBadge?: string
): HoneyProductItem {
  const cheapestVariant = product.variants?.[0]
  const calcPrice = cheapestVariant?.calculated_price
  const price = calcPrice?.calculated_amount ?? 1000

  // Original price or regular price (15% higher fallback for discount effect)
  const regularPrice =
    calcPrice?.original_amount && calcPrice.original_amount > price
      ? calcPrice.original_amount
      : Math.round(price * 1.15)

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
