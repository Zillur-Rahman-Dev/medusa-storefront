import { PhoneCall, Truck, ShieldCheck } from "lucide-react"

export default function AnnouncementBar() {
  return (
    <div className="bg-emerald-800 text-emerald-50 text-[11px] sm:text-xs py-1.5 sm:py-2 px-3 border-b border-emerald-900/40 select-none">
      <div className="content-container flex flex-col sm:flex-row items-center justify-between gap-1 text-center font-medium">
        <div className="flex items-center gap-2 justify-center">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
          <span>
            ১০০% খাঁটি ও প্রাকৃতিক মধুর নিশ্চয়তা • সারা দেশে ক্যাশ অন ডেলিভারি
          </span>
        </div>

        <div className="hidden sm:flex items-center gap-4 text-emerald-200 text-xs">
          <div className="flex items-center gap-1.5">
            <Truck className="w-3.5 h-3.5 text-emerald-300" />
            <span>সারা দেশে হোম ডেলিভারি (ঢাকা ৳৭০, বাইরে ৳১৩০)</span>
          </div>
          <span className="opacity-30">|</span>
          <a
            href="tel:+8801700000000"
            className="flex items-center gap-1.5 hover:text-white transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5 text-emerald-300" />
            <span>হটলাইন: +৮৮০ ১৭১১-XXXXXX</span>
          </a>
        </div>
      </div>
    </div>
  )
}
