import { NextRequest, NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // Check if the url is a static asset or API
  // Let Server Action POST requests or static/API requests proceed directly
  if (
    request.method !== "GET" && request.method !== "HEAD" ||
    request.nextUrl.pathname.includes(".") ||
    request.nextUrl.pathname.startsWith("/api")
  ) {
    return NextResponse.next()
  }

  let cacheIdCookie = request.cookies.get("_medusa_cache_id")
  let cacheId = cacheIdCookie?.value || crypto.randomUUID()

  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  // If root "/" (no country code), redirect to /bd
  if (!firstSegment) {
    const url = request.nextUrl.clone()
    url.pathname = "/bd"
    const response = NextResponse.redirect(url, 307)
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // If firstSegment is not "bd", normalize to /bd
  if (firstSegment !== "bd") {
    const url = request.nextUrl.clone()
    if (firstSegment.length === 2) {
      // 2-character foreign country code (e.g. /us, /dk): replace with /bd
      const remaining = segments.slice(1).join("/")
      url.pathname = `/bd${remaining ? `/${remaining}` : ""}`
    } else if (firstSegment === "cart") {
      // Remove /cart: directly redirect to checkout
      url.pathname = "/bd/checkout"
    } else {
      // Direct route without country code (e.g. /checkout, /store, /products): prepend /bd
      url.pathname = `/bd/${segments.join("/")}`
    }
    const response = NextResponse.redirect(url, 307)
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // If firstSegment is "bd", check if second segment is "cart"
  if (segments[1]?.toLowerCase() === "cart") {
    const url = request.nextUrl.clone()
    url.pathname = "/bd/checkout"
    const response = NextResponse.redirect(url, 307)
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // If firstSegment is "bd", continue
  const response = NextResponse.next()
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
