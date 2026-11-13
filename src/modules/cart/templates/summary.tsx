"use client"

import { Button, Heading } from "@medusajs/ui"

import CartTotals from "@modules/common/components/cart-totals"
import Divider from "@modules/common/components/divider"
import DiscountCode from "@modules/checkout/components/discount-code"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { HttpTypes } from "@medusajs/types"

type SummaryProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const Summary = ({ cart }: SummaryProps) => {
  return (
    <div className="flex flex-col gap-y-4">
      <Heading level="h2" className="text-[2rem] leading-[2.75rem] font-bold text-gray-900">
        অর্ডার বিবরণ
      </Heading>
      <DiscountCode cart={cart} />
      <Divider />
      <CartTotals totals={cart} />
      <LocalizedClientLink
        href="/checkout"
        data-testid="checkout-button"
      >
        <Button className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-base rounded-xl shadow-md cursor-pointer transition-all">
          চেকআউট করুন (অর্ডার নিশ্চিত করুন) →
        </Button>
      </LocalizedClientLink>
    </div>
  )
}

export default Summary
