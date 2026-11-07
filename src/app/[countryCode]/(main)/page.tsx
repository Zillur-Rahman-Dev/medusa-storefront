import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryGrid from "@modules/home/components/category-grid"
import HoneyGuide from "@modules/home/components/honey-guide"
import PurityProcess from "@modules/home/components/purity-process"
import OfferBanner from "@modules/home/components/offer-banner"
import Testimonials from "@modules/home/components/testimonials"
import FAQ from "@modules/home/components/faq"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "PURE HONEY • সুন্দরবন ও গ্রামবাংলার খাঁটি প্রাকৃতিক মধুর সমাহার",
  description:
    "সুন্দরবনের খলিশা, সরিষা, কালোজিরা, লিচু, ধনে, কুসুম, বরই-বাবলা ও পাহাড়ি বুনো মৌচাকের ১০০% খাঁটি কাঁচা মধু। ল্যাব টেস্টেড ও কোনো চিনি ছাড়া শতভাগ প্রাকৃতিক।",
}

export default async function Home(props: {
  params: Promise<{ countryCode: string }>
}) {
  const params = await props.params

  const { countryCode } = params

  const region = await getRegion(countryCode)

  const { collections } = await listCollections({
    fields: "id, handle, title",
  })

  if (!collections || !region) {
    return null
  }

  return (
    <>
      {/* 1. Hero with Honey Varieties Highlight */}
      <Hero />

      {/* 2. Trust Assurance Badges */}
      <TrustBadges />

      {/* 3. 10 Honey Varieties Catalog Grid */}
      <CategoryGrid />

      {/* 4. Honey Characteristics & Health Benefits Guide */}
      <HoneyGuide />

      {/* 5. Featured Store Products */}
      <div className="py-16 sm:py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>

      {/* 6. 4-Step Purity & Cold Filtration Process */}
      <PurityProcess />

      {/* 7. Special Promotional Offer Banner */}
      <OfferBanner />

      {/* 8. Customer Reviews & Testimonials */}
      <Testimonials />

      {/* 9. Frequently Asked Questions */}
      <FAQ />
    </>
  )
}
