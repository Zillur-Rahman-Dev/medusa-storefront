import { NextRequest, NextResponse } from "next/server"

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

  const segments = request.nextUrl.pathname.split("/").filter(Boolean)
  const firstSegment = segments[0]?.toLowerCase()

  // For this pure Bangladesh Honey store, force all routes to /bd!
  // If someone enters /dk or any other country code, redirect to /bd
  if (firstSegment && firstSegment !== "bd") {
    const remainingSegments = segments.slice(1).join("/")
    const targetPath = `/bd${remainingSegments ? `/${remainingSegments}` : ""}`
    const queryString = request.nextUrl.search || ""
    const redirectUrl = new URL(`${targetPath}${queryString}`, request.nextUrl.origin)
    const response = NextResponse.redirect(redirectUrl, 307)
    if (!cacheIdCookie) {
      response.cookies.set("_medusa_cache_id", cacheId, {
        maxAge: 60 * 60 * 24,
      })
    }
    return response
  }

  // If root "/" (no country code), redirect to /bd
  if (!firstSegment) {
    const queryString = request.nextUrl.search || ""
    const redirectUrl = new URL(`/bd${queryString}`, request.nextUrl.origin)
    const response = NextResponse.redirect(redirectUrl, 307)
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
