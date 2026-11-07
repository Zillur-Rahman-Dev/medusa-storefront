import { HttpTypes } from "@medusajs/types"
import { NextRequest, NextResponse } from "next/server"

const BACKEND_URL =
  process.env.MEDUSA_BACKEND_URL || "https://medusa-backend-wqbd.onrender.com"
const PUBLISHABLE_API_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
const DEFAULT_REGION = process.env.NEXT_PUBLIC_DEFAULT_REGION || "bd"

const regionMapCache = {
  regionMap: new Map<string, HttpTypes.StoreRegion>(),
  regionMapUpdated: Date.now(),
}

async function getRegionMap(cacheId: string) {
  const { regionMap, regionMapUpdated } = regionMapCache

  if (!BACKEND_URL) {
    return regionMap
  }

  try {
    if (
      !regionMap.keys().next().value ||
      regionMapUpdated < Date.now() - 3600 * 1000
    ) {
      const response = await fetch(`${BACKEND_URL}/store/regions`, {
        headers: {
          "x-publishable-api-key": PUBLISHABLE_API_KEY || "",
        },
        next: {
          revalidate: 3600,
          tags: [`regions-${cacheId}`],
        },
        cache: "force-cache",
      })

      if (response.ok) {
        const json = await response.json()
        if (json.regions?.length) {
          json.regions.forEach((region: HttpTypes.StoreRegion) => {
            region.countries?.forEach((c) => {
              if (c.iso_2) {
                regionMapCache.regionMap.set(c.iso_2.toLowerCase(), region)
              }
            })
          })
          regionMapCache.regionMapUpdated = Date.now()
        }
      }
    }
  } catch (error) {
    // If backend is sleeping or offline, do not throw in middleware
    console.error("Middleware region fetch error:", error)
  }

  // Ensure default country codes exist
  if (!regionMapCache.regionMap.has("bd")) {
    regionMapCache.regionMap.set("bd", {
      id: "reg_01M6T7JZFBY9BWE8MMYG6HF4PM",
      name: "Bangladesh",
      currency_code: "bdt",
    } as any)
  }
  if (!regionMapCache.regionMap.has("dk")) {
    regionMapCache.regionMap.set("dk", {
      id: "reg_01M6RGE16K4NQS1DA6ZMX1ZKGP",
      name: "Europe",
      currency_code: "eur",
    } as any)
  }

  return regionMapCache.regionMap
}

async function getCountryCode(
  request: NextRequest,
  regionMap: Map<string, HttpTypes.StoreRegion | number>
) {
  try {
    const urlCountryCode = request.nextUrl.pathname.split("/")[1]?.toLowerCase()

    if (
      urlCountryCode &&
      (regionMap.has(urlCountryCode) ||
        urlCountryCode === "bd" ||
        urlCountryCode === "dk")
    ) {
      return urlCountryCode
    }

    const vercelCountryCode = request.headers
      .get("x-vercel-ip-country")
      ?.toLowerCase()

    if (vercelCountryCode && regionMap.has(vercelCountryCode)) {
      return vercelCountryCode
    }

    if (regionMap.has(DEFAULT_REGION)) {
      return DEFAULT_REGION
    }

    return "bd"
  } catch {
    return "bd"
  }
}

export async function middleware(request: NextRequest) {
  // Check if the url is a static asset or API
  if (
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const regionMap = await getRegionMap(cacheId)
  const countryCode = await getCountryCode(request, regionMap)

  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  // If the URL already starts with a valid country code (e.g. /bd or /dk)
  if (
    firstSegment &&
    (regionMap.has(firstSegment) ||
      firstSegment === "bd" ||
      firstSegment === "dk")
  ) {
    const response = NextResponse.next()
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // If URL has no country code (e.g. "/" or "/store"), redirect to `/${countryCode}${pathname}`
  const targetCountry = countryCode || "bd"
  const redirectPath =
    request.nextUrl.pathname === "/" ? "" : request.nextUrl.pathname
  const queryString = request.nextUrl.search || ""
  const redirectUrl = new URL(
    `/${targetCountry}${redirectPath}${queryString}`,
    request.nextUrl.origin
  )

  const response = NextResponse.redirect(redirectUrl, 307)
  if (!cacheIdCookie) {
    response.cookies.set("_medusa_cache_id", cacheId, {
      maxAge: 60 * 60 * 24,
    })
  }

  return response
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|images|assets|png|svg|jpg|jpeg|gif|webp).*)",
  ],
}
