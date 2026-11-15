"use client"

import { Table, Text, clx } from "@medusajs/ui"
import { updateLineItem } from "@lib/data/cart"
import { HttpTypes } from "@medusajs/types"
import ErrorMessage from "@modules/checkout/components/error-message"
import DeleteButton from "@modules/common/components/delete-button"
import LineItemOptions from "@modules/common/components/line-item-options"
import LineItemPrice from "@modules/common/components/line-item-price"
import LineItemUnitPrice from "@modules/common/components/line-item-unit-price"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import Spinner from "@modules/common/icons/spinner"
import Thumbnail from "@modules/products/components/thumbnail"
import { useState } from "react"
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

  // TODO: Update this to grab the actual max inventory
  const maxQtyFromInventory = 10
  const maxQuantity = item.variant?.manage_inventory ? 10 : maxQtyFromInventory

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
          <div className="flex gap-2 items-center">
            <DeleteButton
              id={item.id}
              onDelete={onDelete}
              data-testid="product-delete-button"
            />
            {/* Unified Stepper matching Image 1: Correctly displays any quantity (e.g. ৫৭) in Bengali */}
            <div className="flex items-center border border-zinc-200 dark:border-zinc-700 rounded-lg overflow-hidden bg-white dark:bg-zinc-900 shadow-2xs">
              <button
                type="button"
                onClick={() => {
                  if (item.quantity > 1) {
                    changeQuantity(item.quantity - 1)
                  } else if (onDelete) {
                    onDelete(item.id)
                  }
                }}
                disabled={updating}
                className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold text-sm cursor-pointer disabled:opacity-50 select-none"
                aria-label="পরিমাণ কমান"
              >
                -
              </button>
              <span className="min-w-10 px-2 text-center text-xs font-black text-zinc-900 dark:text-zinc-100 select-none">
                {updating ? (
                  <span className="inline-block w-3.5 h-3.5 border-2 border-amber-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  formatSize(String(item.quantity))
                )}
              </span>
              <button
                type="button"
                onClick={() => changeQuantity(item.quantity + 1)}
                disabled={updating}
                className="w-8 h-8 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors font-bold text-sm cursor-pointer disabled:opacity-50 select-none"
                aria-label="পরিমাণ বাড়ান"
              >
                +
              </button>
            </div>
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
