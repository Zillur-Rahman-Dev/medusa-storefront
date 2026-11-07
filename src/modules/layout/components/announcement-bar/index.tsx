import { Sparkles, PhoneCall, Truck } from "lucide-react"

export default function AnnouncementBar() {
  return (
    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 dark:from-amber-700 dark:via-amber-600 dark:to-amber-700 text-white text-xs py-2 px-4 shadow-sm select-none">
      <div className="content-container flex flex-col sm:flex-row items-center justify-between gap-1 text-center font-medium">
        <div className="flex items-center gap-2 justify-center">
          <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-200" />
          <span>
            ১০০% খাঁটি প্রাকৃতিক মধু • হাতে পেয়ে টেস্ট করে মূল্য পরিশোধের সুযোগ (Cash On Delivery)
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-amber-100 text-xs">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>সারা দেশে হোম ডেলিভারি</span>
          </div>
          <span className="opacity-40">|</span>
          <div className="flex items-center gap-1.5 hover:text-white transition-colors cursor-pointer">
            <PhoneCall className="w-3.5 h-3.5" />
            <span>হেল্পলাইন: ০১৭১১-XXXXXX</span>
          </div>
        </div>
      </div>
    </div>
  )
}
