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
  return (
    <Text
      data-testid={dataTestid}
      data-value={dataValue}
      className="inline-block txt-medium text-ui-fg-subtle w-full overflow-hidden text-ellipsis"
    >
      সাইজ: {formatSize(variant?.title)}
    </Text>
  )
}

export default LineItemOptions
