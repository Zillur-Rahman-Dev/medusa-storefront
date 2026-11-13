"use client"

import { setAddresses } from "@lib/data/cart"
import compareAddresses from "@lib/util/compare-addresses"
import { CheckCircleSolid } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Heading, Text, useToggleState } from "@medusajs/ui"
import Divider from "@modules/common/components/divider"
import Spinner from "@modules/common/icons/spinner"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useActionState } from "react"
import BillingAddress from "../billing_address"
import ErrorMessage from "../error-message"
import ShippingAddress from "../shipping-address"
import { SubmitButton } from "../submit-button"

const Addresses = ({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  const isOpen = searchParams.get("step") === "address"

  const { state: sameAsBilling, toggle: toggleSameAsBilling } = useToggleState(
    cart?.shipping_address && cart?.billing_address
      ? compareAddresses(cart?.shipping_address, cart?.billing_address)
      : true
  )

  const handleEdit = () => {
    router.push(pathname + "?step=address")
  }

  const [message, formAction] = useActionState(setAddresses, null)

  const fullName = [
    cart?.shipping_address?.first_name,
    cart?.shipping_address?.last_name && cart?.shipping_address?.last_name !== "."
      ? cart?.shipping_address?.last_name
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  return (
    <div className="bg-white">
      <div className="flex flex-row items-center justify-between mb-6">
        <Heading
          level="h2"
          className="flex flex-row text-3xl-regular gap-x-2 items-baseline font-bold text-gray-900"
        >
          ডেলিভারি ঠিকানা
          {!isOpen && cart?.shipping_address && (
            <span className="text-emerald-600 inline-flex items-center">
              <CheckCircleSolid />
            </span>
          )}
        </Heading>
        {!isOpen && cart?.shipping_address && (
          <Text>
            <button
              onClick={handleEdit}
              className="text-amber-600 hover:text-amber-700 font-medium text-sm hover:underline cursor-pointer transition-colors"
              data-testid="edit-address-button"
            >
              পরিবর্তন করুন (Edit)
            </button>
          </Text>
        )}
      </div>
      {isOpen ? (
        <form action={formAction}>
          <div className="pb-8">
            <ShippingAddress
              customer={customer}
              checked={sameAsBilling}
              onChange={toggleSameAsBilling}
              cart={cart}
            />

            {!sameAsBilling && (
              <div>
                <Heading
                  level="h2"
                  className="text-3xl-regular gap-x-4 pb-6 pt-8"
                >
                  বিলিং ঠিকানা
                </Heading>

                <BillingAddress cart={cart} />
              </div>
            )}
            <SubmitButton className="mt-6 bg-amber-600 hover:bg-amber-700 text-white font-medium" data-testid="submit-address-button">
              পরবর্তী ধাপ: ডেলিভারি পদ্ধতি বেছে নিন →
            </SubmitButton>
            <ErrorMessage error={message} data-testid="address-error-message" />
          </div>
        </form>
      ) : (
        <div>
          <div className="text-small-regular">
            {cart && cart.shipping_address ? (
              <div className="flex items-start gap-x-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full bg-stone-50/70 p-4 rounded-xl border border-stone-200/60">
                  <div
                    className="flex flex-col"
                    data-testid="shipping-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1 font-semibold text-gray-800">
                      প্রাপকের ঠিকানা
                    </Text>
                    <Text className="txt-medium text-gray-700 font-medium">
                      {fullName || "সম্মানিত গ্রাহক"}
                    </Text>
                    <Text className="txt-medium text-gray-600">
                      {cart.shipping_address.address_1}
                    </Text>
                    <Text className="txt-medium text-gray-600">
                      {cart.shipping_address.city}
                    </Text>
                    <Text className="txt-medium text-gray-500 text-xs">
                      বাংলাদেশ (BD)
                    </Text>
                  </div>

                  <div
                    className="flex flex-col"
                    data-testid="shipping-contact-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1 font-semibold text-gray-800">
                      যোগাযোগ
                    </Text>
                    <Text className="txt-medium text-gray-700 font-medium">
                      📱 {cart.shipping_address.phone || "—"}
                    </Text>
                    <Text className="txt-medium text-gray-600 text-xs mt-0.5">
                      {cart.email && !cart.email.includes("@purehoneybd.com")
                        ? `✉️ ${cart.email}`
                        : "✉️ ইমেইল সংরক্ষিত"}
                    </Text>
                  </div>

                  <div
                    className="flex flex-col"
                    data-testid="billing-address-summary"
                  >
                    <Text className="txt-medium-plus text-ui-fg-base mb-1 font-semibold text-gray-800">
                      বিলিং পদ্ধতি
                    </Text>
                    <Text className="txt-medium text-emerald-700 font-medium">
                      ✓ ডেলিভারি ও বিলিং ঠিকানা একই
                    </Text>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <Spinner />
              </div>
            )}
          </div>
        </div>
      )}
      <Divider className="mt-8" />
    </div>
  )
}

export default Addresses
