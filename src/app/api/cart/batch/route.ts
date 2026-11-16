import { NextRequest, NextResponse } from "next/server"
import { batchSyncCart, BatchSyncPayload } from "@lib/data/cart"

export async function POST(req: NextRequest) {
  try {
    const body: BatchSyncPayload = await req.json()
    const result = await batchSyncCart(body)
    const response = NextResponse.json(result)
    if (body.clearAll || (result.success && (!result.items || result.items.length === 0))) {
      response.cookies.set("_medusa_cart_id", "", { maxAge: -1, path: "/" })
    }
    return response
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err?.message || String(err) },
      { status: 500 }
    )
  }
}
