"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import CartItemSelect from "@modules/cart/components/cart-item-select"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState, useMemo } from "react"
import { formatSize } from "@lib/util/money"

type ItemProps = {
  item: HttpTypes.StoreCartLineItem
  type?: "full" | "preview"
  currencyCode: string
  onDelete?: (id: string) => void
  onUpdateQuantity?: (id: string, quantity: number) => Promise<void>
}

const Item = ({
  item,
  type = "full",
  currencyCode,
  onDelete,
  onUpdateQuantity,
}: ItemProps) => {
  const [updating, setUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const changeQuantity = async (quantity: number) => {
    setError(null)

    if (onUpdateQuantity) {
      setUpdating(true)
      try {
        await onUpdateQuantity(item.id, quantity)
      } catch (err: any) {
        setError(err?.message || "কোয়ান্টিটি পরিবর্তন করতে সমস্যা হয়েছে")
      } finally {
        setUpdating(false)
      }
      return
    }

    setUpdating(true)
    await updateLineItem({
      lineId: item.id,
      quantity,
    })
      .catch((err) => {
        setError(err.message)
      })
      .finally(() => {
        setUpdating(false)
      })
  }

  // Compact & Smart Quantity Options (At most ~13 options, never creates an 80-item dropdown covering the screen!)
  const quantityOptions = useMemo(() => {
    const optionsSet = new Set<number>()
    // Standard base 1 to 10
    for (let i = 1; i <= 10; i++) {
      optionsSet.add(i)
    }
    // If quantity is above 10, include current and neighboring values
    if (item.quantity > 10) {
      if (item.quantity - 1 > 10) optionsSet.add(item.quantity - 1)
      optionsSet.add(item.quantity)
      optionsSet.add(item.quantity + 1)
    }
    return Array.from(optionsSet).sort((a, b) => a - b)
  }, [item.quantity])

  return (
    <Table.Row className="w-full" data-testid="product-row">
      <Table.Cell className="!pl-0 p-4 w-24">
        <LocalizedClientLink
          href={`/products/${item.product_handle}`}
          className={clx("flex", {
            "w-16": type === "preview",
            "small:w-24 w-12": type === "full",
          })}
        >
          <Thumbnail
            thumbnail={item.thumbnail}
            images={item.variant?.product?.images}
            productHandle={item.product_handle}
            size="square"
          />
        </LocalizedClientLink>
      </Table.Cell>

      <Table.Cell className="text-left">
        <Text
          className="txt-medium-plus text-ui-fg-base"
          data-testid="product-title"
        >
          {item.product_title}
        </Text>
        <LineItemOptions variant={item.variant} data-testid="product-variant" />
      </Table.Cell>

      {type === "full" && (
        <Table.Cell>
          <div className="flex items-center gap-2">
            <DeleteButton
              id={item.id}
              onDelete={onDelete}
              data-testid="product-delete-button"
            />
            {/* Hybrid Smart Quantity Controller: Companion [-] and [+] with Select Dropdown */}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity - 1)}
                disabled={item.quantity <= 1 || updating}
                className="w-7 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors font-bold text-sm cursor-pointer select-none"
                title="পরিমাণ ১ কমান"
                aria-label="পরিমাণ ১ কমান"
              >
                -
              </button>
              <CartItemSelect
                value={item.quantity}
                disabled={updating}
                onChange={(value) => changeQuantity(parseInt(value.target.value))}
                className="w-14 h-10 p-4"
                data-testid="product-select-button"
              >
                {quantityOptions.map((qty) => (
                  <option value={qty} key={qty}>
                    {formatSize(String(qty))}
                  </option>
                ))}
              </CartItemSelect>
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={updating}
                className="w-7 h-8 flex items-center justify-center rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-700 disabled:opacity-30 disabled:pointer-events-none transition-colors font-bold text-sm cursor-pointer select-none"
                title="পরিমাণ ১ বাড়ান"
                aria-label="পরিমাণ ১ বাড়ান"
              >
                +
              </button>
            </div>
            {updating && (
              <Spinner className="animate-spin text-amber-600 w-4 h-4 shrink-0" />
            )}
          </div>
          <ErrorMessage error={error} data-testid="product-error-message" />
        </Table.Cell>
      )}

      {type === "full" && (
        <Table.Cell className="hidden small:table-cell">
          <LineItemUnitPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </Table.Cell>
      )}

      <Table.Cell className="!pr-0">
        <span
          className={clx("!pr-0", {
            "flex flex-col items-end h-full justify-center": type === "preview",
          })}
        >
          {type === "preview" && (
            <span className="flex gap-x-1 ">
              <Text className="text-ui-fg-muted">{formatSize(String(item.quantity))}x </Text>
              <LineItemUnitPrice
                item={item}
                style="tight"
                currencyCode={currencyCode}
              />
            </span>
          )}
          <LineItemPrice
            item={item}
            style="tight"
            currencyCode={currencyCode}
          />
        </span>
      </Table.Cell>
    </Table.Row>
  )
}

export default Item
