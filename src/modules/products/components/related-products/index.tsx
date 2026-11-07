import { listProducts } from "@lib/data/products"
import { getRegion } from "@lib/data/regions"
import { HttpTypes } from "@medusajs/types"
import Product from "../product-preview"

type RelatedProductsProps = {
  product: HttpTypes.StoreProduct
  countryCode: string
}

export default async function RelatedProducts({
  product,
  countryCode,
}: RelatedProductsProps) {
  const region = await getRegion(countryCode)

  if (!region) {
    return null
  }

  // edit this function to define your related products logic
  const queryParams: HttpTypes.StoreProductListParams = {}
  if (region?.id) {
    queryParams.region_id = region.id
  }
  if (product.collection_id) {
    queryParams.collection_id = [product.collection_id]
  }
  if (product.tags) {
    queryParams.tag_id = product.tags
      .map((t) => t.id)
      .filter(Boolean) as string[]
  }
  queryParams.is_giftcard = false

  const products = await listProducts({
    queryParams,
    countryCode,
  }).then(({ response }) => {
    return response.products.filter(
      (responseProduct) => responseProduct.id !== product.id
    )
  })

  if (!products.length) {
    return null
  }

  return (
    <div className="product-page-constraint py-12">
      <div className="flex flex-col items-center text-center mb-10">
        <span className="text-xs uppercase tracking-widest text-amber-600 dark:text-amber-400 font-bold">
          সম্পর্কিত পণ্যসমূহ
        </span>
        <h2 className="text-xl sm:text-3xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mt-1">
          আরও অন্যান্য প্রাকৃতিক মধু
        </h2>
        <div className="w-12 h-1 bg-amber-500 rounded-full mx-auto mt-2" />
        <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-2 max-w-md">
          আমাদের সংগ্রহের অন্যান্য ১০০% খাঁটি কাঁচা মধুর সমাহার থেকে বেছে নিন।
        </p>
      </div>

      <ul className="grid grid-cols-2 small:grid-cols-3 medium:grid-cols-4 gap-4 sm:gap-6">
        {products.map((product) => (
          <li key={product.id}>
            <Product region={region} product={product} />
          </li>
        ))}
      </ul>
    </div>
  )
}
