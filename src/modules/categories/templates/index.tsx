import { Suspense } from "react"
import ClientStoreView from "@modules/store/components/client-store-view"
import { HttpTypes } from "@medusajs/types"

export default function CategoryTemplate({
  category,
  products = [],
  categories = [],
  region,
  countryCode,
}: {
  category: HttpTypes.StoreProductCategory
  products?: HttpTypes.StoreProduct[]
  categories?: HttpTypes.StoreProductCategory[]
  region: HttpTypes.StoreRegion
  countryCode: string
}) {
  return (
    <Suspense fallback={<div className="min-h-screen py-10 text-center">লোড হচ্ছে...</div>}>
      <ClientStoreView
        products={products}
        categories={categories}
        region={region}
        countryCode={countryCode}
        title={category.name}
        breadcrumb={category.name}
      />
    </Suspense>
  )
}
