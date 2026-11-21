import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCategoryByHandle, listCategories } from "@lib/data/categories"
import { listRegions, getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { StoreRegion } from "@medusajs/types"
import CategoryTemplate from "@modules/categories/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ category: string[]; countryCode: string }>
  searchParams: Promise<{
    sortBy?: SortOptions
    page?: string
  }>
}

export async function generateStaticParams() {
  const product_categories = await listCategories()

  if (!product_categories) {
    return []
  }

  const countryCodes = await listRegions().then((regions: StoreRegion[]) =>
    regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
  )

  const categoryHandles = product_categories.map(
    (category: any) => category.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string | undefined) =>
      categoryHandles.map((handle: any) => ({
        countryCode,
        category: [handle],
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  try {
    const productCategory = await getCategoryByHandle(params.category)

    const title = productCategory.name + " | Pure Honey"
    const description = productCategory.description ?? `${title} category.`

    return {
      title: `${title} | Pure Honey`,
      description,
      alternates: {
        canonical: `${params.category.join("/")}`,
      },
    }
  } catch (error) {
    notFound()
  }
}

export default async function CategoryPage(props: Props) {
  const params = await props.params
  const countryCode = params.countryCode || "bd"

  const [productCategory, region, productsRes, categories] = await Promise.all([
    getCategoryByHandle(params.category),
    getRegion(countryCode),
    listProducts({
      pageParam: 0,
      queryParams: { limit: 100 },
      countryCode,
    }),
    listCategories(),
  ])

  if (!productCategory || !region) {
    notFound()
  }

  const allProducts = productsRes?.response?.products || []
  const categoryProducts = allProducts.filter((p) =>
    p.categories?.some(
      (c) => c.id === productCategory.id || params.category.includes(c.handle || "")
    )
  )
  const displayProducts = categoryProducts.length > 0 ? categoryProducts : allProducts

  return (
    <CategoryTemplate
      category={productCategory}
      products={displayProducts}
      categories={categories || []}
      region={region}
      countryCode={countryCode}
    />
  )
}
