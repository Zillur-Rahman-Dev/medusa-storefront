import { Metadata } from "next"
import { notFound } from "next/navigation"

import { getCollectionByHandle, listCollections } from "@lib/data/collections"
import { listRegions, getRegion } from "@lib/data/regions"
import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { StoreCollection, StoreRegion } from "@medusajs/types"
import CollectionTemplate from "@modules/collections/templates"
import { SortOptions } from "@modules/store/components/refinement-list/sort-products"

type Props = {
  params: Promise<{ handle: string; countryCode: string }>
  searchParams: Promise<{
    page?: string
    sortBy?: SortOptions
  }>
}

export const PRODUCT_LIMIT = 12

export async function generateStaticParams() {
  const { collections } = await listCollections({
    fields: "*products",
  })

  if (!collections) {
    return []
  }

  const countryCodes = await listRegions().then(
    (regions: StoreRegion[]) =>
      regions
        ?.map((r) => r.countries?.map((c) => c.iso_2))
        .flat()
        .filter(Boolean) as string[]
  )

  const collectionHandles = collections.map(
    (collection: StoreCollection) => collection.handle
  )

  const staticParams = countryCodes
    ?.map((countryCode: string) =>
      collectionHandles.map((handle: string | undefined) => ({
        countryCode,
        handle,
      }))
    )
    .flat()

  return staticParams
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const collection = await getCollectionByHandle(params.handle)

  if (!collection) {
    notFound()
  }

  const metadata = {
    title: `${collection.title} | Pure Honey`,
    description: `${collection.title} collection`,
  } as Metadata

  return metadata
}

export default async function CollectionPage(props: Props) {
  const params = await props.params
  const countryCode = params.countryCode || "bd"

  const [collection, region, productsRes, categories] = await Promise.all([
    getCollectionByHandle(params.handle),
    getRegion(countryCode),
    listProducts({
      pageParam: 0,
      queryParams: { limit: 100 },
      countryCode,
    }),
    listCategories(),
  ])

  if (!collection || !region) {
    notFound()
  }

  const allProducts = productsRes?.response?.products || []
  const collectionProducts = allProducts.filter(
    (p) => p.collection_id === collection.id || p.collection?.handle === params.handle
  )
  const displayProducts = collectionProducts.length > 0 ? collectionProducts : allProducts

  return (
    <CollectionTemplate
      collection={collection}
      products={displayProducts}
      categories={categories || []}
      region={region}
      countryCode={countryCode}
    />
  )
}
