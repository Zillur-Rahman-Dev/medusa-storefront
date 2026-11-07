import { clx } from "@medusajs/ui"
import Image from "next/image"
import React from "react"
import PlaceholderImage from "@modules/common/icons/placeholder-image"

type ThumbnailProps = {
  thumbnail?: string | null
  images?: any[] | null
  size?: "small" | "medium" | "large" | "full" | "square"
  isFeatured?: boolean
  className?: string
  "data-testid"?: string
}

const Thumbnail: React.FC<ThumbnailProps> = ({
  thumbnail,
  images,
  size = "small",
  isFeatured,
  className,
  "data-testid": dataTestid,
}) => {
  const primaryImage = thumbnail || images?.[0]?.url
  const secondaryImage = images && images.length > 1 ? images[1]?.url : null

  return (
    <div
      className={clx(
        "relative w-full overflow-hidden rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/80 shadow-sm transition-all duration-300 group-hover:shadow-md",
        className,
        {
          "aspect-[11/14]": isFeatured,
          "aspect-[4/5]": !isFeatured && size !== "square",
          "aspect-[1/1]": size === "square",
          "w-[180px]": size === "small",
          "w-[290px]": size === "medium",
          "w-[440px]": size === "large",
          "w-full": size === "full",
        }
      )}
      data-testid={dataTestid}
    >
      {/* Badge Overlay */}
      <div className="absolute top-3 left-3 z-20">
        <span className="px-2.5 py-1 text-[11px] font-semibold rounded-full bg-amber-500/95 text-white shadow-sm tracking-wide">
          ১০০% খাঁটি
        </span>
      </div>

      {primaryImage ? (
        <>
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt="Product"
            className={clx(
              "absolute inset-0 object-cover object-center transition-all duration-500 group-hover:scale-105",
              secondaryImage && "group-hover:opacity-0"
            )}
            draggable={false}
            quality={75}
            sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
            fill
          />

          {/* Secondary Image on Hover (if available) */}
          {secondaryImage && (
            <Image
              src={secondaryImage}
              alt="Product Alternate"
              className="absolute inset-0 object-cover object-center opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              draggable={false}
              quality={75}
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              fill
            />
          )}
        </>
      ) : (
        <div className="w-full h-full absolute inset-0 flex items-center justify-center text-zinc-400 dark:text-zinc-600">
          <PlaceholderImage size={size === "small" ? 16 : 24} />
        </div>
      )}
    </div>
  )
}

export default Thumbnail
