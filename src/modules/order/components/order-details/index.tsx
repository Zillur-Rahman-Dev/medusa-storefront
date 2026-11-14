import { HttpTypes } from "@medusajs/types"
import { Text } from "@medusajs/ui"
import { formatSize } from "@lib/util/money"

type OrderDetailsProps = {
  order: HttpTypes.StoreOrder
  showStatus?: boolean
}

const statusTranslations: Record<string, string> = {
  not_fulfilled: "প্রক্রিয়াধীন",
  fulfilled: "ডেলিভারি সম্পন্ন",
  partially_fulfilled: "আংশিক ডেলিভারি",
  shipped: "শিপ করা হয়েছে",
  canceled: "বাতিলকৃত",
  not_paid: "ক্যাশ অন ডেলিভারি (বকেয়া)",
  awaiting: "অপেক্ষমান",
  captured: "পরিশোধিত",
  refunded: "টাকা ফেরত",
}

const OrderDetails = ({ order, showStatus }: OrderDetailsProps) => {
  const formatStatus = (str: string) => {
    const key = (str || "").toLowerCase()
    return statusTranslations[key] || str.split("_").join(" ")
  }

  const orderDateBn = new Date(order.created_at).toLocaleDateString("bn-BD", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

  return (
    <div>
      <Text>
        আপনার অর্ডার নিশ্চিতকরণের বিস্তারিত তথ্য{" "}
        <span
          className="text-ui-fg-medium-plus font-semibold"
          data-testid="order-email"
        >
          {order.email}
        </span>
        -এ পাঠিয়ে দেওয়া হয়েছে।
      </Text>
      <Text className="mt-2">
        অর্ডারের তারিখ:{" "}
        <span data-testid="order-date">
          {orderDateBn}
        </span>
      </Text>
      <Text className="mt-2 text-ui-fg-interactive font-medium">
        অর্ডার নম্বর: <span data-testid="order-id">#{formatSize(String(order.display_id))}</span>
      </Text>

      <div className="flex items-center text-compact-small gap-x-4 mt-4">
        {showStatus && (
          <>
            <Text>
              অর্ডার স্ট্যাটাস:{" "}
              <span className="text-ui-fg-subtle " data-testid="order-status">
                {formatStatus(order.fulfillment_status)}
              </span>
            </Text>
            <Text>
              পেমেন্ট স্ট্যাটাস:{" "}
              <span
                className="text-ui-fg-subtle "
                data-testid="order-payment-status"
              >
                {formatStatus(order.payment_status)}
              </span>
            </Text>
          </>
        )}
      </div>
    </div>
  )
}

export default OrderDetails
