import { Heading, Text } from "@medusajs/ui"
import InteractiveLink from "@modules/common/components/interactive-link"

const EmptyCartMessage = () => {
  return (
    <div
      className="py-48 px-2 flex flex-col justify-center items-start"
      data-testid="empty-cart-message"
    >
      <Heading
        level="h1"
        className="flex flex-row text-3xl-regular font-black gap-x-2 items-baseline text-zinc-900 dark:text-zinc-100"
      >
        আপনার শপিং কার্ট খালি!
      </Heading>
      <Text className="text-base-regular mt-4 mb-6 max-w-[32rem] text-zinc-600 dark:text-zinc-400 leading-relaxed">
        আপনার কার্টে বর্তমানে কোনো মধু বা পণ্য যোগ করা নেই। আমাদের খাঁটি মধুর
        সংগ্রহ দেখতে নিচের লিংকে ক্লিক করুন।
      </Text>
      <div>
        <InteractiveLink href="/store">আমাদের মধু সমূহ দেখুন →</InteractiveLink>
      </div>
    </div>
  )
}

export default EmptyCartMessage
