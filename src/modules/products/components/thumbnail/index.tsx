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
        "relative w-full overflow-hidden rounded-2xl bg-transparent transition-all duration-300",
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
      {primaryImage ? (
        <>
          {/* Primary Image */}
          <Image
            src={primaryImage}
            alt="Product"
            className={clx(
              "absolute inset-0 object-contain object-center p-2 transition-all duration-500 group-hover:scale-105",
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
              className="absolute inset-0 object-contain object-center p-2 opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:scale-105"
              draggable={false}
              quality={75}
              sizes="(max-width: 576px) 280px, (max-width: 768px) 360px, (max-width: 992px) 480px, 800px"
              fill
            />
          )}
        </>
      ) : (
        <div className="w-full h-full absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-amber-50 via-amber-100/60 to-orange-50 dark:from-zinc-800/80 dark:to-zinc-900 rounded-xl select-none group-hover:scale-105 transition-transform duration-300">
          <span className="text-5xl sm:text-6xl drop-shadow-sm">🍯</span>
          <span className="text-[11px] font-black tracking-wider uppercase text-amber-800/80 dark:text-amber-400 mt-2">
            ১০০% খাঁটি মধু
          </span>
        </div>
      )}
    </div>
  )
}

export default Thumbnail
