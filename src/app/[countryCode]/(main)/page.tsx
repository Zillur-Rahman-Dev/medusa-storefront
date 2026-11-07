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

  if (!region) {
    return null
  }

  return (
    <>
      {/* 1. Dual-Banner Hero Section (সবার জন্য সেরা & যে কারণে আমাদের মধু সবচেয়ে খাঁটি) */}
      <Hero />

      {/* 2. Featured Categories (Round Icon Strip matching screenshot) */}
      <FeaturedCategories />

      {/* 3. Top Selling Products (4 Large Cards with Best Selling Badge & Dual Action Buttons) */}
      <TopSelling />

      {/* 4. Quality Trust & Certification Bar */}
      <TrustBadges />

      {/* 5. "All Natural Honey" Interactive Auto-Slide Carousel matching screenshot */}
      <NaturalHoneySlider />

      {/* 6. Categorized Product Shelves (সুন্দরবন ও বন, ফুলভিত্তিক, এবং পাহাড়ি বুনো মধু) */}
      <HoneyShelves />

      {/* 6. Mid-Page Panorama Visual Banner */}
      <PanoramaBanner />

      {/* 7. "Just For You" All 10 Honey Varieties Grid (2 Rows of 5 Cards with Discount Badges) */}
      <AllHoneyGrid />

      {/* 8. Honey Characteristics & Health Benefits Guide */}
      <HoneyGuide />

      {/* 9. Verified Customer Reviews & Testimonials */}
      <Testimonials />

      {/* 10. Frequently Asked Questions */}
      <FAQ />
    </>
  )
}
