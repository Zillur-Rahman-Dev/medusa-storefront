import { Heading } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import React from "react"

const Help = () => {
  return (
    <div className="mt-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
      <Heading className="text-base font-bold text-zinc-900">অর্ডার সংক্রান্ত সাহায্য প্রয়োজন?</Heading>
      <div className="text-sm my-2 text-zinc-600">
        <p className="mb-2">যেকোনো প্রশ্ন বা ডেলিভারি ট্র্যাকিংয়ের জন্য আমাদের সাথে যোগাযোগ করতে পারেন:</p>
        <ul className="gap-y-1.5 flex flex-col font-medium">
          <li>
            <LocalizedClientLink href="/contact" className="text-amber-700 hover:underline">
              📞 কাস্টমার সাপোর্ট ও হটলাইন
            </LocalizedClientLink>
          </li>
          <li>
            <LocalizedClientLink href="/contact" className="text-amber-700 hover:underline">
              🔄 রিটার্ন ও এক্সচেঞ্জ পলিসি
            </LocalizedClientLink>
          </li>
        </ul>
      </div>
    </div>
  )
}

export default Help
