import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import { clx } from "@medusajs/ui"

type LineItemUnitPriceProps = {
  item: HttpTypes.StoreCartLineItem | HttpTypes.StoreOrderLineItem | any
  style?: "default" | "tight"
  currencyCode: string
}

const LineItemUnitPrice = ({
  item,
  style = "default",
  currencyCode,
}: LineItemUnitPriceProps) => {
  const qty = typeof item.quantity === "number" && item.quantity > 0 ? item.quantity : 1
  const unitPrice =
    typeof item.unit_price === "number"
      ? item.unit_price
      : typeof item.total === "number" && !isNaN(item.total)
      ? item.total / qty
      : 0

  const originalUnitPrice =
    typeof item.original_total === "number" && !isNaN(item.original_total)
      ? item.original_total / qty
      : unitPrice

  const hasReducedPrice = unitPrice < originalUnitPrice

  const percentage_diff =
    originalUnitPrice > 0
      ? Math.round(((originalUnitPrice - unitPrice) / originalUnitPrice) * 100)
      : 0

  return (
    <div className="flex flex-col text-ui-fg-muted justify-center h-full">
      {hasReducedPrice && (
        <>
          <p>
            {style === "default" && (
              <span className="text-ui-fg-muted">Original: </span>
            )}
            <span
              className="line-through"
              data-testid="product-unit-original-price"
            >
              {convertToLocale({
                amount: originalUnitPrice,
                currency_code: currencyCode,
              })}
            </span>
          </p>
          {style === "default" && (
            <span className="text-ui-fg-interactive">-{percentage_diff}%</span>
          )}
        </>
      )}
      <span
        className={clx("text-base-regular", {
          "text-ui-fg-interactive": hasReducedPrice,
        })}
        data-testid="product-unit-price"
      >
        {convertToLocale({
          amount: unitPrice,
          currency_code: currencyCode,
        })}
      </span>
    </div>
  )
}

export default LineItemUnitPrice
