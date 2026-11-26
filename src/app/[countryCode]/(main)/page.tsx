import { Metadata } from "next"

import Hero from "@modules/home/components/hero"
import FeaturedCategories from "@modules/home/components/featured-categories"
import TopSelling from "@modules/home/components/top-selling"
import TrustBadges from "@modules/home/components/trust-badges"
import NaturalHoneySlider from "@modules/home/components/natural-honey-slider"
import HoneyShelves from "@modules/home/components/honey-shelves"
import PanoramaBanner from "@modules/home/components/panorama-banner"
import AllHoneyGrid from "@modules/home/components/all-honey-grid"
import HoneyGuide from "@modules/home/components/honey-guide"
import Testimonials from "@modules/home/components/testimonials"
import FAQ from "@modules/home/components/faq"
import DynamicSectionRenderer, {
  DynamicCollectionItem,
} from "@modules/home/components/dynamic-section-renderer"

import { listProducts } from "@lib/data/products"
import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { mapMedusaProductToHoneyItem } from "@lib/util/honey-product"

export const metadata: Metadata = {
  title: "PURE HONEY • সুন্দরবন ও গ্রামবাংলার খাঁটি প্রাকৃতিক মধুর সমাহার",
  description:
    "সুন্দরবনের খলিশা, সরিষা, কালোজিরা, লিচু, ধনে, কুসুম, বরই-বাবলা ও পাহাড়ি বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধু। ল্যাব টেস্টেড ও কোনো চিনি ছাড়া শতভাগ প্রাকৃতিক।",
}

export default async function Home() {
  // 1. Fetch live products from Medusa backend with categories, collections, and prices
  let allHoneyItems: any[] = []
  let featuredProducts: any[] = []
  let topSellingProducts: any[] = []
  let shelves: any[] = []
  let liveCategories: any[] = []
  let liveCollections: any[] = []
  let dynamicCollections: DynamicCollectionItem[] = []

  try {
    const [productsRes, categoriesRes, collectionsRes] = await Promise.allSettled([
      listProducts({
        countryCode: "bd",
        queryParams: {
          limit: 100,
          fields:
            "*categories,*collection,*thumbnail,*images,*variants,*variants.calculated_price",
        },
      }),
      listCategories(),
      listCollections({ limit: "50" }),
    ])

    if (categoriesRes.status === "fulfilled" && categoriesRes.value) {
      liveCategories = categoriesRes.value
    }

    if (collectionsRes.status === "fulfilled" && collectionsRes.value?.collections) {
      liveCollections = collectionsRes.value.collections
    }

    const allRawProducts =
      productsRes.status === "fulfilled" && productsRes.value?.response?.products
        ? productsRes.value.response.products
        : []

    if (allRawProducts && allRawProducts.length > 0) {
      allHoneyItems = allRawProducts.map((p) =>
        mapMedusaProductToHoneyItem(p)
      )

      // 1. Featured Collection (Slider: "১০০% খাঁটি ও প্রাকৃতিক মধু" -> collection: featured-honey)
      const featuredRaw = allRawProducts.filter(
        (p) =>
          p.collection?.handle === "featured-honey" ||
          p.collection?.id === "pcol_01M6ZE4FSD4EBN2S7X6MSZWENT"
      )
      featuredProducts =
        featuredRaw.length >= 5
          ? featuredRaw.map((p) => mapMedusaProductToHoneyItem(p, "প্রাকৃতিক"))
          : [
              ...featuredRaw.map((p) =>
                mapMedusaProductToHoneyItem(p, "প্রাকৃতিক")
              ),
              ...allHoneyItems.filter(
                (p) => !featuredRaw.some((fr) => fr.id === p.id)
              ),
            ].slice(0, 8)

      // 2. Top Selling (Collection / Category: "সর্বাধিক বিক্রিত সেরা মধু" -> handle: top-selling)
      const topSellingRaw = allRawProducts.filter(
        (p) =>
          p.collection?.handle === "top-selling" ||
          p.categories?.some((c) => c.handle === "top-selling")
      )
      topSellingProducts =
        topSellingRaw.length >= 5
          ? topSellingRaw
              .slice(0, 5)
              .map((p) => mapMedusaProductToHoneyItem(p, "সেরা বিক্রি"))
          : [
              ...topSellingRaw.map((p) =>
                mapMedusaProductToHoneyItem(p, "সেরা বিক্রি")
              ),
              ...allHoneyItems.filter(
                (p) => !topSellingRaw.some((tr) => tr.id === p.id)
              ),
            ].slice(0, 5)

      // 3. Shelves (Categories: sundarban-honey, flower-honey, wild-hill-honey)
      const sundarbanRaw = allRawProducts.filter((p) =>
        p.categories?.some((c) => c.handle === "sundarban-honey")
      )
      const flowerRaw = allRawProducts.filter((p) =>
        p.categories?.some((c) => c.handle === "flower-honey")
      )
      const wildHillRaw = allRawProducts.filter((p) =>
        p.categories?.some((c) => c.handle === "wild-hill-honey")
      )

      shelves = [
        {
          title: "সুন্দরবন ও ম্যানগ্রোভের খাঁটি মধু",
          subtitle: "সুন্দরবনের গভীর ম্যানগ্রোভ ও বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধু",
          handle: "sundarban-honey",
          products: sundarbanRaw.map((p) =>
            mapMedusaProductToHoneyItem(p, "সুন্দরবন")
          ),
        },
        {
          title: "ফুলভিত্তিক প্রাকৃতিক মধু",
          subtitle: "সরিষা, লিচু, কালোজিরা ও ধনে ফুলের প্রাকৃতিক মধু",
          handle: "flower-honey",
          products: flowerRaw.map((p) =>
            mapMedusaProductToHoneyItem(p, "ফুলভিত্তিক")
          ),
        },
        {
          title: "পাহাড়ি ও বুনো মৌচাকের মধু",
          subtitle: "পাহাড়ের মৌচাক, বাবলা-কুল এবং কুসুম ও সূর্যমুখী ফুল",
          handle: "wild-hill-honey",
          products: wildHillRaw.map((p) =>
            mapMedusaProductToHoneyItem(p, "বুনো পাহাড়ি")
          ),
        },
      ].filter((s) => s.products.length > 0)

      // Dynamic Modular Collections (Driven via Medusa Admin Metadata)
      if (liveCollections && liveCollections.length > 0) {
        dynamicCollections = liveCollections.map((col) => {
          const colRaw = allRawProducts.filter(
            (p) => p.collection?.id === col.id || p.collection?.handle === col.handle
          )
          const colProducts = colRaw.map((p) => mapMedusaProductToHoneyItem(p))
          return {
            id: col.id,
            title: col.title,
            handle: col.handle,
            metadata: col.metadata,
            products: colProducts.length > 0 ? colProducts : allHoneyItems.slice(0, 4),
          }
        })
      }
    }
  } catch (err) {
    console.error("Failed to fetch live home products from Medusa backend:", err)
  }

  return (
    <>
      {/* 1. Dual-Banner Hero Section */}
      <Hero />

      {/* 2. Featured Categories (Live from Medusa Dashboard) */}
      <FeaturedCategories categories={liveCategories} />

      {/* 2.1 Dynamic Campaign Sections (Controlled via Medusa Collections Metadata) */}
      <DynamicSectionRenderer collections={dynamicCollections} />

      {/* 3. Top Selling Products (Live from 'top-selling' collection in Dashboard) */}
      <TopSelling
        products={topSellingProducts.length > 0 ? topSellingProducts : undefined}
        viewAllHref="/collections/top-selling"
      />

      {/* 4. Quality Trust & Certification Bar */}
      <TrustBadges />

      {/* 5. "১০০% খাঁটি ও প্রাকৃতিক মধু" (Live from 'featured-honey' collection in Dashboard) */}
      <NaturalHoneySlider
        products={featuredProducts.length > 0 ? featuredProducts : undefined}
        viewAllHref="/collections/featured-honey"
      />

      {/* 6. Categorized Product Shelves (Live from sundarban-honey, flower-honey, wild-hill-honey in Dashboard) */}
      <HoneyShelves shelves={shelves.length > 0 ? shelves : undefined} />

      {/* 6. Mid-Page Panorama Visual Banner */}
      <PanoramaBanner />

      {/* 7. "আপনার জন্য বিশেষ বাছাই" All Products Grid (Live from Medusa Backend) */}
      <AllHoneyGrid
        products={allHoneyItems.length > 0 ? allHoneyItems : undefined}
      />

      {/* 8. Honey Characteristics & Health Benefits Guide */}
      <HoneyGuide />

      {/* 9. Verified Customer Reviews & Testimonials */}
      <Testimonials />

      {/* 10. Frequently Asked Questions */}
      <FAQ />
    </>
  )
}
