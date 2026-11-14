import { Container, Heading, Text } from "@medusajs/ui"

import { isStripeLike, paymentInfoMap } from "@lib/constants"
import Divider from "@modules/common/components/divider"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"

type PaymentDetailsProps = {
  order: HttpTypes.StoreOrder
}

const PaymentDetails = ({ order }: PaymentDetailsProps) => {
  const payment = order.payment_collections?.[0]?.payments?.[0]

  return (
    <div>
      <Heading level="h2" className="flex flex-row text-2xl font-bold my-6 text-gray-900">
        পেমেন্ট তথ্য
      </Heading>
      <div>
        <div className="flex flex-col sm:flex-row items-start gap-6 sm:gap-x-8 w-full">
          <div className="flex flex-col w-full sm:w-1/3">
            <Text className="txt-medium-plus font-bold text-ui-fg-base mb-1">
              পেমেন্ট মাধ্যম
            </Text>
            <Text
              className="txt-medium text-ui-fg-subtle"
              data-testid="payment-method"
            >
              {payment?.provider_id && paymentInfoMap[payment.provider_id]
                ? paymentInfoMap[payment.provider_id].title
                : "ক্যাশ অন ডেলিভারি (পণ্য হাতে পেয়ে মূল্য পরিশোধ)"}
            </Text>
          </div>
          <div className="flex flex-col w-full sm:w-2/3">
            <Text className="txt-medium-plus font-bold text-ui-fg-base mb-1">
              পেমেন্ট স্ট্যাটাস
            </Text>
            <div className="flex gap-2 txt-medium text-ui-fg-subtle items-center">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900">
                📦 ক্যাশ অন ডেলিভারি (পার্সেল পাওয়ার পর মূল্য পরিশোধযোগ্য)
              </span>
            </div>
          </div>
        </div>
      </div>

      <Divider className="mt-8" />
    </div>
  )
}

export default PaymentDetails
