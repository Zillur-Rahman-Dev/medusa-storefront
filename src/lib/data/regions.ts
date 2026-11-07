"use server"

import { sdk } from "@lib/config"
import { HttpTypes } from "@medusajs/types"
import { BANGLADESH_REGION_ID, BANGLADESH_REGION } from "../constants"

export const listRegions = async () => {
  try {
    const res = await sdk.client.fetch<{ regions: HttpTypes.StoreRegion[] }>(
      `/store/regions`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
    if (res?.regions && res.regions.length > 0) {
      return res.regions
    }
  } catch (err) {
    console.warn("listRegions fetch error, returning fallback region:", err)
  }

  return [BANGLADESH_REGION]
}

export const retrieveRegion = async (id: string) => {
  try {
    const res = await sdk.client.fetch<{ region: HttpTypes.StoreRegion }>(
      `/store/regions/${id}`,
      {
        method: "GET",
        cache: "no-store",
      }
    )
    if (res?.region) {
      return res.region
    }
  } catch (err) {
    console.warn("retrieveRegion fetch error, returning fallback region:", err)
  }

  return BANGLADESH_REGION
}

const regionMap = new Map<string, HttpTypes.StoreRegion>()

export const getRegion = async (countryCode: string = "bd") => {
  try {
    const code = (countryCode && countryCode.toLowerCase() !== "dk") ? countryCode.toLowerCase() : "bd"

    if (regionMap.has(code)) {
      return regionMap.get(code)!
    }

    const regions = await listRegions()

    if (regions && regions.length > 0) {
      regions.forEach((region) => {
        region.countries?.forEach((c) => {
          if (c?.iso_2) {
            regionMap.set(c.iso_2.toLowerCase(), region)
          }
        })
      })
    }

    const matchedRegion =
      regionMap.get(code) ||
      regionMap.get("bd") ||
      (regions && regions.find((r) => r.id === BANGLADESH_REGION_ID)) ||
      (regions && regions[0]) ||
      BANGLADESH_REGION

    if (matchedRegion) {
      regionMap.set(code, matchedRegion)
      return matchedRegion
    }
  } catch (e: any) {
    console.error("getRegion error:", e)
  }

  return BANGLADESH_REGION
}
