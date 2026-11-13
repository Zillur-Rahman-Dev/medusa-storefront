import { HttpTypes } from "@medusajs/types"

export const BANGLADESH_REGION_ID = "reg_01M6T7JZFBY9BWE8MMYG6HF4PM"

export const BANGLADESH_REGION: HttpTypes.StoreRegion = {
  id: BANGLADESH_REGION_ID,
  name: "Bangladesh",
  currency_code: "bdt",
  created_at: "2026-11-07T05:27:03.416Z",
  updated_at: "2026-11-07T05:27:03.416Z",
  deleted_at: null,
  metadata: null,
  countries: [
    {
      iso_2: "bd",
      iso_3: "bgd",
      num_code: "050",
      name: "BANGLADESH",
      display_name: "Bangladesh",
      region_id: BANGLADESH_REGION_ID,
      metadata: null,
      created_at: "2026-11-06T13:22:42.650Z",
      updated_at: "2026-11-07T05:27:03.416Z",
      deleted_at: null,
    },
  ],
}

import React from "react"
import { CreditCard } from "@medusajs/icons"

import Ideal from "@modules/common/icons/ideal"
import Bancontact from "@modules/common/icons/bancontact"
import PayPal from "@modules/common/icons/paypal"

/* Map of payment provider_id to their title and icon. Add in any payment providers you want to use. */
export const paymentInfoMap: Record<
  string,
  { title: string; icon: React.JSX.Element }
> = {
  pp_stripe_stripe: {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_medusa-payments_default": {
    title: "Credit card",
    icon: <CreditCard />,
  },
  "pp_stripe-ideal_stripe": {
    title: "iDeal",
    icon: <Ideal />,
  },
  "pp_stripe-bancontact_stripe": {
    title: "Bancontact",
    icon: <Bancontact />,
  },
  pp_paypal_paypal: {
    title: "PayPal",
    icon: <PayPal />,
  },
  pp_system_default: {
    title: "ক্যাশ অন ডেলিভারি (Cash on Delivery)",
    icon: <CreditCard />,
  },
  // Add more payment providers here
}

// This only checks if it is native stripe or medusa payments for card payments, it ignores the other stripe-based providers
export const isStripeLike = (providerId?: string) => {
  return (
    providerId?.startsWith("pp_stripe_") || providerId?.startsWith("pp_medusa-")
  )
}

export const isPaypal = (providerId?: string) => {
  return providerId?.startsWith("pp_paypal")
}
export const isManual = (providerId?: string) => {
  return providerId?.startsWith("pp_system_default")
}

// Add currencies that don't need to be divided by 100
export const noDivisionCurrencies = [
  "krw",
  "jpy",
  "vnd",
  "clp",
  "pyg",
  "xaf",
  "xof",
  "bif",
  "djf",
  "gnf",
  "kmf",
  "mga",
  "rwf",
  "xpf",
  "htg",
  "vuv",
  "xag",
  "xdr",
  "xau",
]
