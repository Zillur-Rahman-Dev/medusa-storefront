import { retrieveCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import CartTemplate from "@modules/cart/templates"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const metadata: Metadata = {
  title: "Cart",
  description: "View your cart",
}

export default async function Cart(props: {
  params: Promise<{ countryCode: string }>
  searchParams?: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const { countryCode } = await props.params
  const searchParams = props.searchParams ? await props.searchParams : {}

  const cart = await retrieveCart().catch((error) => {
    console.error(error)
    return null
  })

  // Direct-to-Checkout Funnel:
  // Unconditionally redirect regular shoppers to /checkout.
  // Preserves CartTemplate code intact; ?view=raw allows developer access if needed.
  if (searchParams.view !== "raw") {
    redirect(`/${countryCode}/checkout`)
  }

  const customer = await retrieveCustomer()

  return <CartTemplate cart={cart} customer={customer} />
}
