"use server"

import { sdk } from "@lib/config"

export type GlobalStorePolicies = {
  codNote: string
  returnPolicy: string
  deliveryNote: string
  hotline: string
}

/**
 * Global Store Policies fetched from Medusa Admin Store Metadata
 * Falls back safely to default Bengali / English policies if not yet set in Admin.
 */
export const getStorePolicies = async (
  locale: "bn" | "en" = "bn"
): Promise<GlobalStorePolicies> => {
  const defaultPolicies: Record<"bn" | "en", GlobalStorePolicies> = {
    bn: {
      codNote: "সারা বাংলাদেশে ক্যাশ অন ডেলিভারি সুবিধা",
      returnPolicy:
        "ডেলিভারির সময় পাত্রে কোনো ক্ষতি বা লিক পরিলক্ষিত হলে সাথে সাথে সম্পূর্ণ ফ্রিতে নতুন মধু প্রদান",
      deliveryNote: "ঢাকার ভেতরে ৳৬০, ঢাকার বাইরে ৳১২০",
      hotline: "09678812525",
    },
    en: {
      codNote: "Cash on delivery available nationwide",
      returnPolicy:
        "Instant free replacement if jar is damaged or leaking during delivery",
      deliveryNote: "Inside Dhaka: ৳60, Outside Dhaka: ৳120",
      hotline: "09678812525",
    },
  }

  try {
    const res = await sdk.client
      .fetch<{ store?: any }>(`/store/store`, {
        method: "GET",
        next: { tags: ["store-metadata"], revalidate: 3600 },
      })
      .catch(() => null)

    const metadata = res?.store?.metadata as Record<string, any> | undefined

    if (metadata) {
      const isEn = locale === "en"
      return {
        codNote:
          (isEn ? metadata.cod_note_en : metadata.cod_note_bn) ||
          metadata.cod_note ||
          defaultPolicies[locale].codNote,
        returnPolicy:
          (isEn ? metadata.return_policy_en : metadata.return_policy_bn) ||
          metadata.return_policy ||
          defaultPolicies[locale].returnPolicy,
        deliveryNote:
          (isEn ? metadata.delivery_note_en : metadata.delivery_note_bn) ||
          metadata.delivery_note ||
          defaultPolicies[locale].deliveryNote,
        hotline:
          metadata.hotline ||
          metadata.support_phone ||
          defaultPolicies[locale].hotline,
      }
    }
  } catch {
    // Fail-safe: Fallback gracefully to default policies
  }

  return defaultPolicies[locale]
}
