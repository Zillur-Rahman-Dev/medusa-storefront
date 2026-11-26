import React from "react"
import dynamic from "next/dynamic"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

// Lazy-loaded dynamic promotion and campaign components
const MixMatchBox = dynamic(() => import("../mix-match-box"))
const FlashSale = dynamic(() => import("../flash-sale"))
const FreeShippingPromotion = dynamic(() => import("../free-shipping"))
const BundleCombo = dynamic(() => import("../bundle-combo"))

// Secondary modular layouts
const SplitBanner = dynamic(() => import("../split-banner"))
const VideoReels = dynamic(() => import("../video-reels"))
const ProblemSolution = dynamic(() => import("../problem-solution"))
const HarvestJourney = dynamic(() => import("../harvest-journey"))
const PreOrderBanner = dynamic(() => import("../pre-order-banner"))

export type DynamicCollectionItem = {
  id: string
  title: string
  handle: string
  metadata?: Record<string, any> | null
  products?: HoneyProductItem[]
}

type DynamicSectionRendererProps = {
  collections?: DynamicCollectionItem[]
}

export default function DynamicSectionRenderer({
  collections = [],
}: DynamicSectionRendererProps) {
  if (!collections || collections.length === 0) return null

  // 1. Filter only collections that have active: true in Medusa Metadata
  const activeSections = collections
    .filter((col) => {
      const meta = col.metadata || {}
      return meta.active === true || meta.active === "true"
    })
    .sort((a, b) => {
      const orderA = Number(a.metadata?.order) || 99
      const orderB = Number(b.metadata?.order) || 99
      return orderA - orderB
    })

  if (activeSections.length === 0) {
    return null
  }

  return (
    <>
      {activeSections.map((col) => {
        const meta = col.metadata || {}
        const layout = String(meta.layout || "").toLowerCase().trim()
        const products = col.products || []

        switch (layout) {
          // =========================================================================
          // ১. Buy X Get Y / Amount off product (কম্বো অফার / নিজের বক্স নিজে বানান)
          // =========================================================================
          case "mix_match_box":
          case "combo_offer":
          case "bxgy":
          case "buy_x_get_y":
            return (
              <MixMatchBox
                key={col.id}
                products={products}
                title={meta.headline || col.title || "নিজের পছন্দমতো ৩টি মধুর কম্বো বক্স তৈরি করুন"}
                subtitle={meta.subheadline || "যেকোনো ৩টি খাঁটি মধু নিজের ইচ্ছামতো পছন্দ করুন এবং উপভোগ করুন বিশেষ ছাড়!"}
                badge={meta.badge || "কম্বো অফার / Buy X Get Y"}
                boxSize={meta.box_size ? Number(meta.box_size) : 3}
                discountPercent={meta.discount_percent ? Number(meta.discount_percent) : 15}
                discountAmount={meta.discount_amount ? Number(meta.discount_amount) : undefined}
              />
            )

          // =========================================================================
          // ২. Campaigns (Start & End Date) (টাইম লিমিটেড সেল / কাউন্টডাউন ফ্ল্যাশ সেল)
          // =========================================================================
          case "campaign_sale":
          case "flash_sale":
          case "campaign":
          case "limited_time":
            return (
              <FlashSale
                key={col.id}
                products={products}
                title={meta.headline || col.title || "সীমিত সময়ের স্পেশাল ফ্ল্যাশ সেল!"}
                subtitle={meta.subheadline || "মেডুসা ক্যাম্পেইনের বিশেষ অফার - সীমিত সময়ের জন্য সর্বোচ্চ ছাড়"}
                badge={meta.badge || "ফ্ল্যাশ ডিল"}
                countdownEnd={meta.end_date || meta.countdown_end || meta.campaign_end}
                viewAllHref={`/collections/${col.handle}`}
              />
            )

          // =========================================================================
          // ৩. Free Shipping Promotion (ফ্রি ডেলিভারি অফার ও ব্যানার)
          // =========================================================================
          case "free_shipping":
          case "free_delivery":
            return (
              <FreeShippingPromotion
                key={col.id}
                products={products}
                title={meta.headline || col.title || "সারা দেশে ফ্রি হোম ডেলিভারি অফার!"}
                subtitle={meta.subheadline || "সীমিত সময়ের অফার: যেকোনো ২টি মধু অর্ডার করলেই ডেলিভারি চার্জ সম্পূর্ণ ফ্রি!"}
                badge={meta.badge || "ফ্রি ডেলিভারি"}
                thresholdText={meta.threshold_text || meta.min_amount || "২টি বা তার বেশি মধু অর্ডারে"}
                couponCode={meta.coupon_code || "অটোমেটিক কার্যকর"}
                viewAllHref={`/collections/${col.handle}`}
              />
            )

          // =========================================================================
          // ৪. Percentage off order / Bundle (প্যাকেজ অফার / ফ্যামিলি প্যাক)
          // =========================================================================
          case "bundle_combo":
          case "package_offer":
          case "bundle":
          case "percentage_off_order":
            return (
              <BundleCombo
                key={col.id}
                products={products}
                title={meta.headline || col.title || "ফ্যামিলি মেগা কম্বো প্যাকেজ"}
                subtitle={meta.subheadline || "খলিশা + সরিষা + কালোজিরা মধুর পূর্ণাঙ্গ স্বাস্থ্য প্যাকেজ"}
                discountBadge={meta.discount_badge || "১৫% স্পেশাল সাশ্রয়"}
                comboPrice={meta.combo_price ? Number(meta.combo_price) : undefined}
                originalPrice={meta.original_price ? Number(meta.original_price) : undefined}
                freeGiftNote={meta.free_gift_note || "🎁 সাথে পাচ্ছেন ১টি প্রিমিয়াম কাঠের মধুর চামচ সম্পূর্ণ ফ্রি!"}
              />
            )

          // Secondary modular sections
          case "video_reels":
            return (
              <VideoReels
                key={col.id}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
              />
            )

          case "split_banner":
            return (
              <SplitBanner
                key={col.id}
                products={products}
                bannerTitle={meta.banner_title || col.title}
                bannerSubtitle={meta.banner_subtitle}
                bannerBadge={meta.banner_badge}
                bannerImage={meta.banner_image}
                buttonText={meta.button_text}
                buttonHref={meta.button_href || `/collections/${col.handle}`}
              />
            )

          case "problem_solution":
            return (
              <ProblemSolution
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
              />
            )

          case "harvest_journey":
            return (
              <HarvestJourney
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
              />
            )

          case "pre_order_banner":
            return (
              <PreOrderBanner
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
                harvestDate={meta.harvest_date}
                benefitBadge={meta.benefit_badge}
              />
            )

          default:
            return null
        }
      })}
    </>
  )
}
