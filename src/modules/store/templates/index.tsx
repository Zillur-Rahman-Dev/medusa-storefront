import { HttpTypes } from "@medusajs/types"
import ClientStoreView from "@modules/store/components/client-store-view"

type StoreTemplateProps = {
  products: HttpTypes.StoreProduct[]
  categories: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  countryCode: string
}

export default function StoreTemplate({
  products,
  categories,
  region,
  countryCode,
}: StoreTemplateProps) {
  return (
    <ClientStoreView
      products={products}
      categories={categories}
      region={region}
      countryCode={countryCode}
    />
  )
}
