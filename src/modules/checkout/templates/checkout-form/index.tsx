import { listCartShippingMethods } from "@lib/data/fulfillment"
import { listCartPaymentMethods } from "@lib/data/payment"
import { HttpTypes } from "@medusajs/types"
import OneStepCheckout from "@modules/checkout/components/one-step-checkout"

export default async function CheckoutForm({
  cart,
  customer,
}: {
  cart: HttpTypes.StoreCart | null
  customer: HttpTypes.StoreCustomer | null
}) {
  if (!cart) {
    return null
  }

  const shippingMethods = await listCartShippingMethods(cart.id)
  const paymentMethods = await listCartPaymentMethods(cart.region?.id ?? "")

  return (
    <div className="w-full">
      <OneStepCheckout
        cart={cart}
        customer={customer}
        shippingMethods={shippingMethods}
        paymentMethods={paymentMethods}
      />
    </div>
  )
}
