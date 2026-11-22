import { NextRequest, NextResponse } from "next/server"
import { getDbReviews, insertDbReview } from "@lib/neon-db"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const reviews = await getDbReviews()
    return NextResponse.json({
      success: true,
      reviews: reviews || [],
    })
  } catch (error) {
    console.error("GET /api/reviews error:", error)
    return NextResponse.json(
      { success: false, reviews: [] },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { name, rating, productTitle, comment, avatarUrl } = body

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "নাম আবশ্যক" },
        { status: 400 }
      )
    }

    if (!comment || typeof comment !== "string" || comment.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: "মতামত আবশ্যক" },
        { status: 400 }
      )
    }

    const validatedRating = Math.max(1, Math.min(5, Number(rating) || 5))

    const newReview = await insertDbReview({
      name: name.trim(),
      rating: validatedRating,
      productTitle: productTitle ? String(productTitle).trim() : undefined,
      comment: comment.trim(),
      avatarUrl: avatarUrl ? String(avatarUrl).trim() : undefined,
    })

    return NextResponse.json({
      success: true,
      review: newReview,
    })
  } catch (error) {
    console.error("POST /api/reviews error:", error)
    return NextResponse.json(
      { success: false, error: "রিভিউ সেভ করতে সমস্যা হয়েছে" },
      { status: 500 }
    )
  }
}
