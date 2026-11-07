import React, { Suspense } from "react"

import ImageGallery from "@modules/products/components/image-gallery"
import ProductActions from "@modules/products/components/product-actions"
import ProductTabs from "@modules/products/components/product-tabs"
import RelatedProducts from "@modules/products/components/related-products"
import ProductInfo from "@modules/products/templates/product-info"
import SkeletonRelatedProducts from "@modules/skeletons/templates/skeleton-related-products"
import { notFound } from "next/navigation"
import { HttpTypes } from "@medusajs/types"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import ProductActionsWrapper from "./product-actions-wrapper"
import { ChevronRight, Home, Star } from "lucide-react"

type ProductTemplateProps = {
  product: HttpTypes.StoreProduct
  region: HttpTypes.StoreRegion
  countryCode: string
  images: HttpTypes.StoreProductImage[]
}

const ProductTemplate: React.FC<ProductTemplateProps> = ({
  product,
  region,
  countryCode,
  images,
}) => {
  if (!product || !product.id) {
    return notFound()
  }

  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container py-6">
        {/* Breadcrumb Navigation */}
        {/* Dynamic Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 mb-6 font-medium flex-wrap">
          <LocalizedClientLink href="/" className="hover:text-amber-600 dark:hover:text-amber-400 flex items-center gap-1 transition-colors">
            <Home className="w-3.5 h-3.5" />
            <span>হোম</span>
          </LocalizedClientLink>
          <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
          <LocalizedClientLink href="/store" className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors">
            সকল মধু
          </LocalizedClientLink>
          {product.categories && product.categories.length > 0 && (
            <>
              <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
              <LocalizedClientLink
                href={`/categories/${product.categories[0].handle}`}
                className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
              >
                {product.categories[0].name.trim()}
              </LocalizedClientLink>
            </>
          )}
          <ChevronRight className="w-3 h-3 text-zinc-400 shrink-0" />
          <span className="text-zinc-900 dark:text-zinc-100 truncate font-semibold">
            {product.title}
          </span>
        </nav>

        {/* 2-Column GhorerBazar Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start"
          data-testid="product-container"
        >
          {/* Left Column (Image Gallery - 6 cols) */}
          <div className="lg:col-span-6 lg:sticky lg:top-28">
            <div className="bg-zinc-50 dark:bg-zinc-900/60 rounded-3xl p-4 sm:p-6 border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
              <ImageGallery images={images} />
            </div>
          </div>

          {/* Right Column (Info + Actions + COD - 6 cols) */}
          <div className="lg:col-span-6 space-y-5">
            {/* Rating Stars Summary */}
            <div className="flex items-center gap-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
              </div>
              <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                ৫.০ (৪৮টি ভেরিফাইড রিভিউ)
              </span>
            </div>

            {/* Product Title & Info */}
            <ProductInfo product={product} />

            {/* Actions: Price, Variants, COD Order, WhatsApp, Delivery Card */}
            <Suspense
              fallback={
                <ProductActions
                  disabled={true}
                  product={product}
                  region={region}
                />
              }
            >
              <ProductActionsWrapper id={product.id} region={region} />
            </Suspense>
          </div>
        </div>

        {/* Detailed Tabs: Description, Benefits, Usage */}
        <div className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800">
          <ProductTabs product={product} />
        </div>

        {/* Related Products Carousel/Grid */}
        <div
          className="mt-16 pt-10 border-t border-zinc-200 dark:border-zinc-800"
          data-testid="related-products-container"
        >
          <div className="mb-8">
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight">
              আরও অন্যান্য ফুলের মধু
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              আমাদের সংগ্রহের অন্যান্য খাঁটি প্রাকৃতিক মধুর ভ্যারাইটিগুলো দেখুন।
            </p>
          </div>
          <Suspense fallback={<SkeletonRelatedProducts />}>
            <RelatedProducts product={product} countryCode={countryCode} />
          </Suspense>
        </div>
      </div>
    </div>
  )
}

export default ProductTemplate
