"use client"

import { setShippingMethod, submitOneStepOrder } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { CheckCircleSolid, Loader } from "@medusajs/icons"
import { HttpTypes } from "@medusajs/types"
import { Container, Heading, Text, clx } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import MedusaRadio from "@modules/common/components/radio"
import { mapKeys } from "lodash"
import React, { useActionState, useEffect, useMemo, useState, useTransition } from "react"
import AddressSelect from "../address-select"

type OneStepCheckoutProps = {
  cart: HttpTypes.StoreCart
  customer: HttpTypes.StoreCustomer | null
  shippingMethods: HttpTypes.StoreCartShippingOption[] | null
  paymentMethods: any[] | null
}

const OneStepCheckout: React.FC<OneStepCheckoutProps> = ({
  cart,
  customer,
  shippingMethods,
  paymentMethods,
}) => {
  const [errorMessage, formAction, isPending] = useActionState(
    submitOneStepOrder,
    null
  )

  const [isUpdatingShipping, startShippingTransition] = useTransition()

  // Find existing or default shipping option
  const defaultShippingId =
    cart.shipping_methods?.at(-1)?.shipping_option_id ||
    shippingMethods?.[0]?.id ||
    ""

  const [selectedShippingId, setSelectedShippingId] = useState<string>(
    defaultShippingId
  )

  const rawInitName = [
    cart.shipping_address?.first_name,
    cart.shipping_address?.last_name && cart.shipping_address?.last_name !== "."
      ? cart.shipping_address?.last_name
      : "",
  ]
    .filter(Boolean)
    .join(" ")

  const [formData, setFormData] = useState({
    fullName: rawInitName || "",
    phone: cart.shipping_address?.phone || "",
    address: cart.shipping_address?.address_1 || "",
    city: cart.shipping_address?.city || "",
    email:
      cart.email && !cart.email.includes("@purehoneybd.com")
        ? cart.email
        : "",
  })

  // Ensure initial shipping method is synced on backend if not set yet
  useEffect(() => {
    if (defaultShippingId && cart.shipping_methods?.length === 0) {
      startShippingTransition(async () => {
        try {
          await setShippingMethod({
            cartId: cart.id,
            shippingMethodId: defaultShippingId,
          })
        } catch (e) {
          // ignore silent init error
        }
      })
    }
  }, [defaultShippingId, cart.shipping_methods?.length, cart.id])

  const countriesInRegion = useMemo(
    () => cart?.region?.countries?.map((c) => c.iso_2),
    [cart?.region]
  )

  const addressesInRegion = useMemo(
    () =>
      customer?.addresses?.filter(
        (a) => a.country_code && countriesInRegion?.includes(a.country_code)
      ),
    [customer?.addresses, countriesInRegion]
  )

  const handleSavedAddressSelect = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    if (address) {
      const name = [address.first_name, address.last_name !== "." ? address.last_name : ""]
        .filter(Boolean)
        .join(" ")

      setFormData((prev) => ({
        ...prev,
        fullName: name,
        phone: address.phone || prev.phone,
        address: address.address_1 || prev.address,
        city: address.city || prev.city,
      }))
    }
    if (email) {
      setFormData((prev) => ({ ...prev, email }))
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleShippingChange = (id: string) => {
    setSelectedShippingId(id)
    startShippingTransition(async () => {
      try {
        await setShippingMethod({
          cartId: cart.id,
          shippingMethodId: id,
        })
      } catch (err) {
        console.error("Failed to update shipping method", err)
      }
    })
  }

  const cleanMethods = shippingMethods?.filter(
    (sm) => sm.service_zone?.fulfillment_set?.type !== "pickup"
  )

  return (
    <form action={formAction} className="w-full flex flex-col gap-y-10">
      {/* Hidden Fields for Backend Integrity */}
      <input type="hidden" name="shippingMethodId" value={selectedShippingId} />
      <input type="hidden" name="paymentProviderId" value="pp_system_default" />
      <input type="hidden" name="postal_code" value="1200" />

      {/* 1. ডেলিভারি ঠিকানা */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200/80 shadow-sm">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-stone-200">
          <span className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            ১
          </span>
          <div>
            <Heading level="h2" className="text-xl md:text-2xl font-bold text-gray-900">
              আপনার তথ্য ও ডেলিভারি ঠিকানা
            </Heading>
            <p className="text-xs md:text-sm text-gray-500">
              পণ্য ডেলিভারির জন্য আপনার সঠিক নাম, সচল মোবাইল নম্বর ও পূর্ণ ঠিকানা দিন
            </p>
          </div>
        </div>

        {customer && (addressesInRegion?.length || 0) > 0 && (
          <Container className="mb-6 flex flex-col gap-y-3 p-4 bg-amber-50/60 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-900 font-medium">
              {`প্রিয় ${customer.first_name || "সম্মানিত গ্রাহক"}, সংরক্ষিত ঠিকানা ব্যবহার করতে নিচে ক্লিক করুন:`}
            </p>
            <AddressSelect
              addresses={customer.addresses}
              addressInput={
                mapKeys(
                  {
                    first_name: formData.fullName,
                    phone: formData.phone,
                    address_1: formData.address,
                    city: formData.city,
                  },
                  (_, k) => k
                ) as HttpTypes.StoreCartAddress
              }
              onSelect={handleSavedAddressSelect}
            />
          </Container>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Input
              label="আপনার পূর্ণ নাম"
              name="fullName"
              autoComplete="name"
              placeholder="যেমন: মোঃ রহিম"
              value={formData.fullName}
              onChange={handleInputChange}
              required
              data-testid="shipping-first-name-input"
            />
          </div>

          <div>
            <Input
              label="সচল মোবাইল নম্বর"
              name="phone"
              type="tel"
              autoComplete="tel"
              placeholder="যেমন: 017xxxxxxxx"
              value={formData.phone}
              onChange={handleInputChange}
              required
              data-testid="shipping-phone-input"
            />
          </div>

          <div className="sm:col-span-2">
            <Input
              label="সম্পূর্ণ ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা/থানা)"
              name="address"
              autoComplete="address-line1"
              placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
              value={formData.address}
              onChange={handleInputChange}
              required
              data-testid="shipping-address-input"
            />
          </div>

          <div>
            <Input
              label="জেলা / শহর"
              name="city"
              autoComplete="address-level2"
              placeholder="যেমন: ঢাকা / চট্টগ্রাম / ময়মনসিংহ"
              value={formData.city}
              onChange={handleInputChange}
              required
              data-testid="shipping-city-input"
            />
          </div>

          <div>
            <Input
              label="ইমেইল এড্রেস (ঐচ্ছিক)"
              name="email"
              type="email"
              autoComplete="email"
              placeholder="example@gmail.com (না দিলেও চলবে)"
              value={formData.email}
              onChange={handleInputChange}
              data-testid="shipping-email-input"
            />
          </div>
        </div>
      </div>

      {/* 2. ডেলিভারি এলাকা ও চার্জ */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200/80 shadow-sm">
        <div className="flex items-center justify-between pb-5 mb-6 border-b border-stone-200">
          <div className="flex items-center gap-3">
            <span className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
              ২
            </span>
            <div>
              <Heading level="h2" className="text-xl md:text-2xl font-bold text-gray-900">
                ডেলিভারি এলাকা নির্বাচন করুন
              </Heading>
              <p className="text-xs md:text-sm text-gray-500">
                আপনার বর্তমান অবস্থান অনুযায়ী ডেলিভারি এলাকা বেছে নিন
              </p>
            </div>
          </div>
          {isUpdatingShipping && (
            <span className="text-xs text-amber-700 bg-amber-100/70 px-2.5 py-1 rounded-full flex items-center gap-1.5 animate-pulse font-medium">
              <Loader className="animate-spin w-3.5 h-3.5" />
              হিসেব হচ্ছে...
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {cleanMethods?.map((option) => {
            const isSelected = option.id === selectedShippingId
            return (
              <div
                key={option.id}
                onClick={() => handleShippingChange(option.id)}
                className={clx(
                  "flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200",
                  {
                    "border-amber-500 bg-amber-50/50 shadow-sm ring-1 ring-amber-500":
                      isSelected,
                    "border-stone-200 bg-stone-50/40 hover:border-amber-300":
                      !isSelected,
                  }
                )}
              >
                <div className="flex items-center gap-3">
                  <MedusaRadio checked={isSelected} />
                  <div className="flex flex-col">
                    <span className="font-semibold text-gray-900 text-sm md:text-base">
                      🚚 {option.name}
                    </span>
                    <span className="text-xs text-gray-500 mt-0.5">
                      {option.name.includes("Dhaka") || option.name.includes("ঢাকা")
                        ? "দ্রুততম হোম ডেলিভারি"
                        : "সারা বাংলাদেশে হোম ডেলিভারি"}
                    </span>
                  </div>
                </div>
                <span className="font-bold text-gray-900 text-base md:text-lg">
                  {convertToLocale({
                    amount: option.amount ?? 0,
                    currency_code: cart.currency_code,
                  })}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* 3. পেমেন্ট পদ্ধতি */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200/80 shadow-sm">
        <div className="flex items-center gap-3 pb-5 mb-6 border-b border-stone-200">
          <span className="w-9 h-9 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-lg shadow-sm">
            ৩
          </span>
          <div>
            <Heading level="h2" className="text-xl md:text-2xl font-bold text-gray-900">
              পেমেন্ট মাধ্যম
            </Heading>
            <p className="text-xs md:text-sm text-gray-500">
              কোনো অগ্রিম পেমেন্টের প্রয়োজন নেই
            </p>
          </div>
        </div>

        <div className="p-5 rounded-xl border-2 border-amber-500 bg-amber-50/40 ring-1 ring-amber-500 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <MedusaRadio checked={true} />
              <span className="font-bold text-gray-900 text-base md:text-lg">
                💵 ক্যাশ অন ডেলিভারি (Cash on Delivery)
              </span>
            </div>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-100 border border-emerald-300 px-2.5 py-1 rounded-md">
              পণ্য হাতে পেয়ে টাকা দিন
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 pl-7">
            হোম ডেলিভারিতে পার্সেল বুঝে পেয়ে ডেলিভারি ম্যানকে নগদ টাকায় মূল্য পরিশোধ করবেন।
          </p>
        </div>
      </div>

      {/* 4. অর্ডার নিশ্চিতকরণ ও বাটন */}
      <div className="bg-white rounded-2xl p-6 md:p-8 border border-stone-200/80 shadow-sm flex flex-col gap-5">
        <div className="flex items-start gap-3 bg-gradient-to-r from-amber-50 to-orange-50 p-4 rounded-xl border border-amber-200/80">
          <span className="text-2xl">🍯</span>
          <div className="flex flex-col">
            <span className="font-bold text-amber-900 text-sm md:text-base">
              ১০০% খাঁটি ও প্রাকৃতিক মধুর নিশ্চয়তা!
            </span>
            <p className="text-xs md:text-sm text-amber-800/90 mt-0.5">
              অর্ডারটি কনফার্ম করতে নিচের বাটনে ক্লিক করুন। আমাদের টিম দ্রুত আপনার অর্ডারটি প্রসেস করবে।
            </p>
          </div>
        </div>

        {errorMessage && (
          <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-xl text-sm font-medium flex items-center gap-2">
            <span>⚠️</span>
            <span>{errorMessage}</span>
          </div>
        )}

        {/* The Action Button with strictly requested text */}
        <button
          type="submit"
          disabled={isPending}
          data-testid="submit-order-button"
          className={clx(
            "w-full py-4 md:py-5 px-6 rounded-xl font-bold text-lg md:text-xl text-white shadow-md transition-all duration-300 flex items-center justify-center gap-2.5 select-none",
            {
              "bg-amber-600 hover:bg-amber-700 active:scale-[0.99] cursor-pointer hover:shadow-lg":
                !isPending,
              "bg-amber-400 cursor-not-allowed opacity-80": isPending,
            }
          )}
        >
          {isPending ? (
            <>
              <Loader className="animate-spin w-5 h-5" />
              <span>অর্ডার সম্পন্ন হচ্ছে...</span>
            </>
          ) : (
            <span>🛒 অর্ডার নিশ্চিত করুন</span>
          )}
        </button>
      </div>
    </form>
  )
}

export default OneStepCheckout
