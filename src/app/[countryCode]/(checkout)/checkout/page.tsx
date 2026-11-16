import { retrieveCart, getOrSetCart } from "@lib/data/cart"
import { retrieveCustomer } from "@lib/data/customer"
import PaymentWrapper from "@modules/checkout/components/payment-wrapper"
import CheckoutForm from "@modules/checkout/templates/checkout-form"
import CheckoutSummary from "@modules/checkout/templates/checkout-summary"
import { Metadata } from "next"
import { redirect } from "next/navigation"

export const dynamic = "force-dynamic"
export const revalidate = 0

export const metadata: Metadata = {
  title: "চেকআউট | PURE HONEY",
  description: "অর্ডার সম্পন্ন করুন",
}

type Props = {
  params: Promise<{ countryCode: string }>
}

export default async function Checkout(props: Props) {
  const { countryCode } = await props.params
  if (countryCode && countryCode.toLowerCase() !== "bd") {
    redirect("/bd/checkout")
  }
  let cart = await retrieveCart()

  // Grace period retry for in-flight backend commits on Render free tier
  if (!cart || !cart.items || cart.items.length === 0) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    cart = await retrieveCart()
  }

  if (!cart) {
    cart = await getOrSetCart("bd")
  }

  if (!cart || !cart.items || cart.items.length === 0) {
    redirect(`/${countryCode || "bd"}/store`)
  }

  const customer = await retrieveCustomer()

  return (
    <div className="grid grid-cols-1 small:grid-cols-[1fr_416px] content-container gap-x-12 lg:gap-x-20 py-8 lg:py-12">
      <PaymentWrapper cart={cart}>
        <CheckoutForm cart={cart} customer={customer} />
      </PaymentWrapper>
      <CheckoutSummary cart={cart} />
    </div>
  )
}
