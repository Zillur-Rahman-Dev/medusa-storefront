"use client"

import { convertToLocale } from "@lib/util/money"
import React from "react"

type CartTotalsProps = {
  totals: {
    total?: number | null
    subtotal?: number | null
    tax_total?: number | null
    currency_code: string
    item_subtotal?: number | null
    shipping_subtotal?: number | null
    discount_subtotal?: number | null
  }
}

const CartTotals: React.FC<CartTotalsProps> = ({ totals }) => {
  const {
    currency_code,
    total,
    tax_total,
    item_subtotal,
    shipping_subtotal,
    discount_subtotal,
  } = totals

  return (
    <div>
      <div className="flex flex-col gap-y-2 txt-medium text-ui-fg-subtle ">
        <div className="flex items-center justify-between">
          <span className="text-gray-700">পণ্যের মোট মূল্য</span>
          <span data-testid="cart-subtotal" data-value={item_subtotal || 0} className="font-semibold text-gray-900">
            {convertToLocale({ amount: item_subtotal ?? 0, currency_code })}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-gray-700">ডেলিভারি চার্জ</span>
          <span data-testid="cart-shipping" data-value={shipping_subtotal || 0} className="font-semibold text-gray-900">
            {shipping_subtotal
              ? convertToLocale({ amount: shipping_subtotal ?? 0, currency_code })
              : "০ ৳"}
          </span>
        </div>
        {!!discount_subtotal && (
          <div className="flex items-center justify-between">
            <span className="text-emerald-700 font-medium">ডিসকাউন্ট</span>
            <span
              className="text-emerald-600 font-semibold"
              data-testid="cart-discount"
              data-value={discount_subtotal || 0}
            >
              -{" "}
              {convertToLocale({
                amount: discount_subtotal ?? 0,
                currency_code,
              })}
            </span>
          </div>
        )}
        {!!tax_total && (
          <div className="flex justify-between">
            <span className="flex gap-x-1 items-center text-gray-700">ভ্যাট / ট্যাক্স</span>
            <span data-testid="cart-taxes" data-value={tax_total || 0} className="font-semibold text-gray-900">
              {convertToLocale({ amount: tax_total ?? 0, currency_code })}
            </span>
          </div>
        )}
      </div>
      <div className="h-px w-full border-b border-gray-200 my-4" />
      <div className="flex items-center justify-between text-ui-fg-base mb-2 txt-medium ">
        <span className="font-bold text-lg text-gray-900">সর্বমোট বিল</span>
        <span
          className="txt-xlarge-plus font-bold text-amber-700"
          data-testid="cart-total"
          data-value={total || 0}
        >
          {convertToLocale({ amount: total ?? 0, currency_code })}
        </span>
      </div>
      <div className="h-px w-full border-b border-gray-200 mt-4" />
    </div>
  )
}

export default CartTotals
