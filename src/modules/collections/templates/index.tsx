import { Suspense } from "react"
import ClientStoreView from "@modules/store/components/client-store-view"
import { HttpTypes } from "@medusajs/types"

export default function CollectionTemplate({
  collection,
  products = [],
  categories = [],
  region,
  countryCode,
}: {
  collection: HttpTypes.StoreCollection
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
        title={collection.title}
        breadcrumb={collection.title}
      />
    </Suspense>
  )
}
