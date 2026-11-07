"use server"

import { sdk } from "@lib/config"
import medusaError from "@lib/util/medusa-error"
import { HttpTypes } from "@medusajs/types"
import { getCacheOptions } from "./cookies"

export const listRegions = async () => {
  const next = {
    ...(await getCacheOptions("regions")),
  }

  return sdk.client
    .fetch<{ regions: HttpTypes.StoreRegion[] }>(`/store/regions`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ regions }) => regions)
    .catch(medusaError)
}

export const retrieveRegion = async (id: string) => {
  const next = {
    ...(await getCacheOptions(["regions", id].join("-"))),
  }

  return sdk.client
    .fetch<{ region: HttpTypes.StoreRegion }>(`/store/regions/${id}`, {
      method: "GET",
      next,
      cache: "force-cache",
    })
    .then(({ region }) => region)
    .catch(medusaError)
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string) => {
  try {
    if (regionMap.has(countryCode)) {
      return regionMap.get(countryCode)
    }

    const regions = await listRegions()

    if (regions && regions.length > 0) {
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          regionMap.set(c?.iso_2?.toLowerCase() ?? "", region)
        })
      })
    }

    const code = (countryCode && countryCode.toLowerCase() !== "dk") ? countryCode.toLowerCase() : "bd"
    const region =
      regionMap.get(code) ||
      regionMap.get("bd") ||
      (regions && regions[0]) ||
      null

    if (region) {
      return region
    }
  } catch (e: any) {
    console.error("getRegion error:", e)
  }

  // Guaranteed fallback for Bangladesh region
  return {
    id: "reg_01M6T7JZFBY9BWE8MMYG6HF4PM",
    name: "Bangladesh",
    currency_code: "bdt",
    countries: [
      {
        iso_2: "bd",
        iso_3: "bgd",
        num_code: "050",
        name: "BANGLADESH",
        display_name: "Bangladesh",
        region_id: "reg_01M6T7JZFBY9BWE8MMYG6HF4PM",
      }
    ]
  } as HttpTypes.StoreRegion
}
