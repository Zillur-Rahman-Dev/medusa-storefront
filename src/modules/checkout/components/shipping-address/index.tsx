import { HttpTypes } from "@medusajs/types"
import { Container } from "@medusajs/ui"
import Input from "@modules/common/components/input"
import { mapKeys } from "lodash"
import React, { useEffect, useMemo, useState } from "react"
import AddressSelect from "../address-select"

const ShippingAddress = ({
  customer,
  cart,
  checked,
  onChange,
}: {
  customer: HttpTypes.StoreCustomer | null
  cart: HttpTypes.StoreCart | null
  checked: boolean
  onChange: () => void
}) => {
  const [formData, setFormData] = useState<Record<string, any>>({
    "shipping_address.first_name": cart?.shipping_address?.first_name || "",
    "shipping_address.last_name": cart?.shipping_address?.last_name || ".",
    "shipping_address.address_1": cart?.shipping_address?.address_1 || "",
    "shipping_address.company": cart?.shipping_address?.company || "",
    "shipping_address.postal_code": cart?.shipping_address?.postal_code || "1200",
    "shipping_address.city": cart?.shipping_address?.city || "",
    "shipping_address.country_code": cart?.shipping_address?.country_code || "bd",
    "shipping_address.province": cart?.shipping_address?.province || "",
    "shipping_address.phone": cart?.shipping_address?.phone || "",
    email: cart?.email || "",
  })

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

  const setFormAddress = (
    address?: HttpTypes.StoreCartAddress,
    email?: string
  ) => {
    address &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        "shipping_address.first_name": address?.first_name || "",
        "shipping_address.last_name": address?.last_name || ".",
        "shipping_address.address_1": address?.address_1 || "",
        "shipping_address.company": address?.company || "",
        "shipping_address.postal_code": address?.postal_code || "1200",
        "shipping_address.city": address?.city || "",
        "shipping_address.country_code": address?.country_code || "bd",
        "shipping_address.province": address?.province || "",
        "shipping_address.phone": address?.phone || "",
      }))

    email &&
      setFormData((prevState: Record<string, any>) => ({
        ...prevState,
        email: email,
      }))
  }

  useEffect(() => {
    if (cart && cart.shipping_address) {
      setFormAddress(cart?.shipping_address, cart?.email)
    }

    if (cart && !cart.email && customer?.email) {
      setFormAddress(undefined, customer.email)
    }
  }, [cart])

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement
    >
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <>
      {customer && (addressesInRegion?.length || 0) > 0 && (
        <Container className="mb-6 flex flex-col gap-y-4 p-5 bg-amber-50/50 border border-amber-200/60 rounded-xl">
          <p className="text-small-regular text-amber-900 font-medium">
            {`প্রিয় ${customer.first_name || "সম্মানিত গ্রাহক"}, আপনি কি আপনার পূর্বের সংরক্ষিত ঠিকানা ব্যবহার করতে চান?`}
          </p>
          <AddressSelect
            addresses={customer.addresses}
            addressInput={
              mapKeys(formData, (_, key) =>
                key.replace("shipping_address.", "")
              ) as HttpTypes.StoreCartAddress
            }
            onSelect={setFormAddress}
          />
        </Container>
      )}

      {/* Hidden fields ensuring Medusa API validity */}
      <input type="hidden" name="shipping_address.last_name" value={formData["shipping_address.last_name"] || "."} />
      <input type="hidden" name="shipping_address.postal_code" value={formData["shipping_address.postal_code"] || "1200"} />
      <input type="hidden" name="shipping_address.country_code" value="bd" />
      <input type="hidden" name="shipping_address.company" value={formData["shipping_address.company"] || ""} />
      <input type="hidden" name="shipping_address.province" value={formData["shipping_address.province"] || ""} />
      <input type="hidden" name="same_as_billing" value="on" />

      {/* Streamlined Bangladeshi Customer-Friendly Form */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Input
            label="আপনার পূর্ণ নাম"
            name="shipping_address.first_name"
            autoComplete="name"
            placeholder="যেমন: মোঃ রহিম"
            value={formData["shipping_address.first_name"]}
            onChange={handleChange}
            required
            data-testid="shipping-first-name-input"
          />
        </div>

        <div>
          <Input
            label="সচল মোবাইল নম্বর"
            name="shipping_address.phone"
            type="tel"
            autoComplete="tel"
            placeholder="যেমন: 017xxxxxxxx"
            value={formData["shipping_address.phone"]}
            onChange={handleChange}
            required
            data-testid="shipping-phone-input"
          />
        </div>

        <div className="sm:col-span-2">
          <Input
            label="ডেলিভারি ঠিকানা (বাসা/রোড/এলাকা/থানা)"
            name="shipping_address.address_1"
            autoComplete="address-line1"
            placeholder="যেমন: বাড়ি নং ১২, রোড নং ৫, ধানমন্ডি, ঢাকা"
            value={formData["shipping_address.address_1"]}
            onChange={handleChange}
            required
            data-testid="shipping-address-input"
          />
        </div>

        <div>
          <Input
            label="জেলা / শহর"
            name="shipping_address.city"
            autoComplete="address-level2"
            placeholder="যেমন: ঢাকা / চট্টগ্রাম / ময়মনসিংহ"
            value={formData["shipping_address.city"]}
            onChange={handleChange}
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
            placeholder="আপনার ইমেইল (না দিলেও চলবে)"
            value={formData.email}
            onChange={handleChange}
            data-testid="shipping-email-input"
          />
        </div>
      </div>
    </>
  )
}

export default ShippingAddress
