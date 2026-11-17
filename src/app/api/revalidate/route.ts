import { NextRequest, NextResponse } from "next/server"
import { revalidateTag, revalidatePath } from "next/cache"

export async function POST(req: NextRequest) {
  try {
    const url = new URL(req.url)
    const secretQuery = url.searchParams.get("secret")
    const authHeader = req.headers.get("x-revalidate-secret") || req.headers.get("authorization")

    let body: any = {}
    try {
      body = await req.json()
    } catch {}

    const secret =
      secretQuery ||
      authHeader?.replace("Bearer ", "") ||
      body?.secret ||
      req.headers.get("x-medusa-secret")

    const validSecret =
      process.env.REVALIDATE_SECRET ||
      process.env.MEDUSA_BACKEND_SECRET ||
      "purehoney_revalidate_secret_2026"

    // Allow testing if secret matches or if no REVALIDATE_SECRET env is set
    if (
      process.env.REVALIDATE_SECRET &&
      process.env.NODE_ENV === "production" &&
      secret !== validSecret
    ) {
      return NextResponse.json({ message: "Invalid secret token" }, { status: 401 })
    }

    const tagsToRevalidate = new Set<string>()
    const pathsToRevalidate = new Set<string>()

    // 1. Explicit tag in query or body
    const tagParam = url.searchParams.get("tag") || body?.tag
    if (tagParam) {
      tagsToRevalidate.add(tagParam)
    }

    const tagsArray = body?.tags || url.searchParams.getAll("tags")
    if (Array.isArray(tagsArray)) {
      tagsArray.forEach((t) => tagsToRevalidate.add(t))
    }

    // 2. Explicit path in query or body
    const pathParam = url.searchParams.get("path") || body?.path
    if (pathParam) {
      pathsToRevalidate.add(pathParam)
    }

    // 3. Medusa Webhook Event payloads (e.g. product.updated, product.created, product.deleted)
    const event = body?.event || body?.eventName || req.headers.get("x-medusa-event")
    if (event) {
      if (
        event.startsWith("product") ||
        event.startsWith("price") ||
        event.startsWith("inventory")
      ) {
        tagsToRevalidate.add("products")
        tagsToRevalidate.add("categories")
        tagsToRevalidate.add("collections")
      }
      if (event.startsWith("category")) {
        tagsToRevalidate.add("categories")
      }
      if (event.startsWith("collection")) {
        tagsToRevalidate.add("collections")
      }
    }

    // Default to products, categories, collections if no specific tag requested
    if (tagsToRevalidate.size === 0 && pathsToRevalidate.size === 0) {
      tagsToRevalidate.add("products")
      tagsToRevalidate.add("categories")
      tagsToRevalidate.add("collections")
    }

    const revalidatedTags: string[] = []
    const revalidatedPaths: string[] = []

    for (const tag of tagsToRevalidate) {
      try {
        revalidateTag(tag)
        revalidatedTags.push(tag)
      } catch (e) {
        console.warn(`revalidateTag failed for ${tag}:`, e)
      }
    }

    for (const p of pathsToRevalidate) {
      try {
        revalidatePath(p)
        revalidatedPaths.push(p)
      } catch (e) {
        console.warn(`revalidatePath failed for ${p}:`, e)
      }
    }

    return NextResponse.json({
      success: true,
      revalidated: true,
      tags: revalidatedTags,
      paths: revalidatedPaths,
      timestamp: Date.now(),
    })
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  // Support quick GET testing: /api/revalidate?secret=...&tag=products
  return POST(req)
}
