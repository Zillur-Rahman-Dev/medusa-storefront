import { Metadata } from "next"
import { notFound } from "next/navigation"
import { listProducts } from "@lib/data/products"
import { getRegion, listRegions } from "@lib/data/regions"
import ProductTemplate from "@modules/products/templates"
import { HttpTypes } from "@medusajs/types"

export const revalidate = 60

type Props = {
  params: Promise<{ countryCode: string; handle: string }>
  searchParams: Promise<{ v_id?: string }>
}

export async function generateStaticParams() {
  try {
    const countryCodes = await listRegions().then((regions) =>
      regions?.map((r) => r.countries?.map((c) => c.iso_2)).flat()
    )

    if (!countryCodes) {
      return []
    }

    const promises = countryCodes.map(async (country) => {
      const { response } = await listProducts({
        countryCode: country,
        queryParams: { limit: 100, fields: "handle" },
      })

      return {
        country,
        products: response.products,
      }
    })

    const countryProducts = await Promise.all(promises)

    return countryProducts
      .flatMap((countryData) =>
        countryData.products.map((product) => ({
          countryCode: countryData.country,
          handle: product.handle,
        }))
      )
      .filter((param) => param.handle)
  } catch (error) {
    console.error(
      `Failed to generate static paths for product pages: ${
        error instanceof Error ? error.message : "Unknown error"
      }.`
    )
    return []
  }
}

function getImagesForVariant(
  product: HttpTypes.StoreProduct,
  selectedVariantId?: string
) {
  if (!selectedVariantId || !product.variants) {
    return product.images
  }

  const variant = product.variants!.find((v) => v.id === selectedVariantId)
  if (!variant || !variant.images.length) {
    return product.images
  }

  const imageIdsMap = new Map(variant.images.map((i) => [i.id, true]))
  return product.images!.filter((i) => imageIdsMap.has(i.id))
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params
  const { handle } = params
  const region = await getRegion(params.countryCode)

  if (!region) {
    notFound()
  }

  const product = await listProducts({
    countryCode: params.countryCode,
    queryParams: { handle, fields: "*variants.calculated_price,+metadata,+tags" },
  }).then(({ response }) => response.products[0])

  if (!product) {
    notFound()
  }

  const metadata = (product.metadata as Record<string, any>) || {}
  const rawTitle = product.title || "খাঁটি প্রাকৃতিক মধু"
  const englishTitle = metadata.title_en || product.title

  // High-Impact Hybrid SEO Title & Description targeting both Bangla & English queries
  const seoTitle = `${rawTitle} - ১০০% খাঁটি প্রাকৃতিক মধু | Pure Honey BD`
  const seoDescription = metadata.desc_en
    ? `${rawTitle} - ${metadata.desc_en.slice(0, 140)}... ১০০% খাঁটি ও প্রাকৃতিক মধু। ক্যাশ অন ডেলিভারি সুবিধা।`
    : `১০০% খাঁটি ও প্রাকৃতিক ${rawTitle}। Best quality raw pure honey in Bangladesh. সারা দেশে দ্রুত হোম ডেলিভারি ও ক্যাশ অন ডেলিভারি সুবিধা।`

  const thumbnail = product.thumbnail ? [product.thumbnail] : []

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: [
      rawTitle,
      englishTitle,
      "pure honey bd",
      "raw honey bangladesh",
      "sundarban honey",
      "সুন্দরবনের মধু",
      "খাঁটি মধু",
      "মধুর দাম",
      "খাঁটি মধুর উপকারিতা",
    ],
    openGraph: {
      title: seoTitle,
      description: seoDescription,
      images: thumbnail,
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: seoTitle,
      description: seoDescription,
      images: thumbnail,
    },
  }
}

export default async function ProductPage(props: Props) {
  const params = await props.params
  const region = await getRegion(params.countryCode)
  const searchParams = await props.searchParams

  const selectedVariantId = searchParams.v_id

  if (!region) {
    notFound()
  }

  const pricedProduct = await listProducts({
    countryCode: params.countryCode,
    queryParams: {
      handle: params.handle,
      fields:
        "*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*type,*collection,*categories",
    },
  }).then(({ response }) => response.products[0])

  const images = getImagesForVariant(pricedProduct, selectedVariantId)

  if (!pricedProduct) {
    notFound()
  }

  const productPrice =
    pricedProduct.variants?.[0]?.calculated_price?.calculated_amount || 750

  // Google Rich Results / Product Schema JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: pricedProduct.title,
    image: pricedProduct.thumbnail ? [pricedProduct.thumbnail] : [],
    description:
      pricedProduct.description ||
      `${pricedProduct.title} - ১০০% খাঁটি প্রাকৃতিক মধু`,
    brand: {
      "@type": "Brand",
      name: "Pure Honey BD",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "BDT",
      price: productPrice,
      availability: "https://schema.org/InStock",
      url: `https://medusa-storefront-drab-psi.vercel.app/${params.countryCode}/products/${params.handle}`,
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductTemplate
        product={pricedProduct}
        region={region}
        countryCode={params.countryCode}
        images={images}
      />
    </>
  )
}
