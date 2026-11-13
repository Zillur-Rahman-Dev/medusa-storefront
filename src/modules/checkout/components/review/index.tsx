"use client"

import { Heading, Text, clx } from "@medusajs/ui"

import PaymentButton from "../payment-button"
import { useSearchParams } from "next/navigation"

const Review = ({ cart }: { cart: any }) => {
  const searchParams = useSearchParams()

  const isOpen = searchParams.get("step") === "review"

  const paidByGiftcard =
    cart?.gift_cards && cart?.gift_cards?.length > 0 && cart?.total === 0

  const previousStepsCompleted =
    cart.shipping_address &&
    cart.shipping_methods.length > 0 &&
    (cart.payment_collection || paidByGiftcard)

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className={clx(
            "flex flex-row text-3xl-regular gap-x-2 items-baseline font-bold text-gray-900",
            {
              "opacity-50 pointer-events-none select-none": !isOpen,
            }
          )}
        >
          অর্ডার নিশ্চিতকরণ (Review)
        </Heading>
      </div>
      {isOpen && previousStepsCompleted && (
        <>
          <div className="flex flex-col gap-3 w-full mb-6 bg-amber-50/60 p-4 rounded-xl border border-amber-200/80">
            <div className="flex items-center gap-2 text-amber-900 font-semibold text-sm">
              <span>🍯</span>
              <span>নিশ্চিন্তে অর্ডার করুন</span>
            </div>
            <Text className="txt-medium text-amber-950 text-sm">
              হোম ডেলিভারিতে পণ্য বুঝে পেয়ে মূল্য পরিশোধ করুন। অর্ডার সম্পন্ন করার মাধ্যমে আপনি আমাদের শর্তাবলী ও গোপনীয়তা নীতির সাথে সম্মত হচ্ছেন।
            </Text>
          </div>
          <PaymentButton cart={cart} data-testid="submit-order-button" />
        </>
      )}
    </div>
  )
}

export default Review
