import React from "react"
import dynamic from "next/dynamic"
import { HoneyProductItem } from "@modules/products/components/honey-product-card"

// Dynamic lazy-loading of all modular sections so zero bytes are loaded if inactive
const FlashSale = dynamic(() => import("../flash-sale"))
const SplitBanner = dynamic(() => import("../split-banner"))
const BundleCombo = dynamic(() => import("../bundle-combo"))
const VideoReels = dynamic(() => import("../video-reels"))
const ProblemSolution = dynamic(() => import("../problem-solution"))
const HarvestJourney = dynamic(() => import("../harvest-journey"))
const MixMatchBox = dynamic(() => import("../mix-match-box"))
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
          case "flash_sale":
            return (
              <FlashSale
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
                badge={meta.badge}
                countdownEnd={meta.countdown_end}
                viewAllHref={`/collections/${col.handle}`}
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

          case "bundle_combo":
            return (
              <BundleCombo
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
                discountBadge={meta.discount_badge}
                comboPrice={meta.combo_price ? Number(meta.combo_price) : undefined}
                originalPrice={meta.original_price ? Number(meta.original_price) : undefined}
                freeGiftNote={meta.free_gift_note}
              />
            )

          case "video_reels":
            return (
              <VideoReels
                key={col.id}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
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

          case "mix_match_box":
            return (
              <MixMatchBox
                key={col.id}
                products={products}
                title={meta.headline || col.title}
                subtitle={meta.subheadline}
                boxSize={meta.box_size ? Number(meta.box_size) : 3}
                discountPercent={meta.discount_percent ? Number(meta.discount_percent) : 15}
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
