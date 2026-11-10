import { NextResponse } from "next/server"
import { listProducts } from "@lib/data/products"

// Cache on Vercel CDN for 2 minutes (120 seconds) so Render receives almost 0 load
export const revalidate = 120

export async function GET() {
  try {
    const { response } = await listProducts({
      pageParam: 0,
      queryParams: { limit: 100 },
      countryCode: "bd",
    })

    // Return a slim payload for high performance
    const slimProducts = response.products.map((p) => {
      // Find cheapest price
      let cheapestAmount = 0
      p.variants?.forEach((v: any) => {
        const amt = v.calculated_price?.calculated_amount
        if (typeof amt === "number" && (!cheapestAmount || amt < cheapestAmount)) {
          cheapestAmount = amt
        }
      })

      return {
        id: p.id,
        title: p.title,
        handle: p.handle,
        thumbnail: p.thumbnail,
        price: cheapestAmount,
        weight: (p.metadata?.weight as string) || (p.weight ? `${p.weight}g` : null) || p.variants?.[0]?.title,
        categories: p.categories?.map((c) => c.name),
      }
    })

    return NextResponse.json({ products: slimProducts })
  } catch (error) {
    console.error("Failed to fetch search products:", error)
    return NextResponse.json({ products: [] }, { status: 500 })
  }
}
