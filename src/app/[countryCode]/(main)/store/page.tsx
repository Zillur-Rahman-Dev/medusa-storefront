import { Metadata } from "next"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { getRegion } from "@lib/data/regions"
import StoreTemplate from "@modules/store/templates"

export const metadata: Metadata = {
  title: "সকল খাঁটি মধু | মধুমেলা",
  description: "সুন্দরবন ও দেশের সেরা মৌচাক থেকে সংগৃহীত ১০০% খাঁটি প্রাকৃতিক মধু।",
}

// Revalidate store page every 60 seconds (ISR) so new products & categories auto-update
export const revalidate = 60

type Params = {
  params: Promise<{
    countryCode: string
  }>
}

export default async function StorePage(props: Params) {
  const params = await props.params
  const countryCode = params.countryCode || "bd"

  const [region, productsRes, categories] = await Promise.all([
    getRegion(countryCode),
    listProducts({
      pageParam: 0,
      queryParams: { limit: 100 },
      countryCode,
    }),
    listCategories(),
  ])

  if (!region) {
    return null
  }

  return (
    <StoreTemplate
      products={productsRes?.response?.products || []}
      categories={categories || []}
      region={region}
      countryCode={countryCode}
    />
  )
}
