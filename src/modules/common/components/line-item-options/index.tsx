import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { formatSize } from "@lib/util/money"

type LineItemOptionsProps = {
  variant: HttpTypes.StoreProductVariant | undefined
  "data-testid"?: string
  "data-value"?: HttpTypes.StoreProductVariant
}

const LineItemOptions = ({
  variant,
  "data-testid": dataTestid,
  "data-value": dataValue,
}: LineItemOptionsProps) => {
  const rawTitle = variant?.title || ""
  const isDefault =
    !rawTitle ||
    rawTitle.toLowerCase() === "default variant" ||
    rawTitle.toLowerCase() === "default option" ||
    rawTitle.toLowerCase() === "ডিফল্ট"

  const optionValue = variant?.options?.[0]?.value
  const displaySize = !isDefault
    ? rawTitle
    : optionValue || (variant?.product as any)?.metadata?.weight || "১ কেজি"

  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis text-xs text-zinc-500"
    >
      সাইজ / ওজন: <span className="font-semibold text-zinc-700 dark:text-zinc-300">{formatSize(displaySize)}</span>
    </Text>
  )
}

export default LineItemOptions
