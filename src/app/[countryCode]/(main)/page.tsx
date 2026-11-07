import { Metadata } from "next"

import FeaturedProducts from "@modules/home/components/featured-products"
import Hero from "@modules/home/components/hero"
import TrustBadges from "@modules/home/components/trust-badges"
import CategoryGrid from "@modules/home/components/category-grid"
import PurityProcess from "@modules/home/components/purity-process"
import OfferBanner from "@modules/home/components/offer-banner"
import Testimonials from "@modules/home/components/testimonials"
import FAQ from "@modules/home/components/faq"
import { listCollections } from "@lib/data/collections"
import { getRegion } from "@lib/data/regions"

export const metadata: Metadata = {
  title: "PURE HONEY • ১০০% খাঁটি প্রাকৃতিক মধু ও অর্গানিক স্টোর",
  description:
    "সুন্দরবন ও গ্রামবাংলার খাঁটি মৌচাকের মধু সরাসরি আপনার ঘরে। কোনো ভেজাল বা চিনি ছাড়া শতভাগ প্রাকৃতিক মধুর নিশ্চয়তা।",
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
      {/* 1. Premium Hero Banner */}
      <Hero />

      {/* 2. Trust Assurance Badges */}
      <TrustBadges />

      {/* 3. Product Categories Grid (Honey, Ghee, Dry Fruits, Organic) */}
      <CategoryGrid />

      {/* 4. Featured Store Products */}
      <div className="py-16 sm:py-20 bg-white dark:bg-zinc-950 transition-colors duration-300">
        <ul className="flex flex-col gap-x-6">
          <FeaturedProducts collections={collections} region={region} />
        </ul>
      </div>

      {/* 5. 4-Step Purity & Quality Assurance Process */}
      <PurityProcess />

      {/* 6. Special Promotional Offer Banner */}
      <OfferBanner />

      {/* 7. Verified Customer Reviews & Testimonials */}
      <Testimonials />

      {/* 8. Interactive Frequently Asked Questions */}
      <FAQ />
    </>
  )
}
