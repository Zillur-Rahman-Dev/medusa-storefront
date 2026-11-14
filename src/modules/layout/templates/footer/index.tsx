import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PhoneCall, Mail, MapPin } from "lucide-react"

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 transition-colors duration-300 w-full mt-auto">
      <div className="content-container flex flex-col w-full py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12">
          {/* 1. Brand Info & Contact (5 Cols) */}
          <div className="space-y-4 md:col-span-5">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2"
            >
              <span className="text-3xl">🍯</span>
              <div>
                <span className="text-xl font-black tracking-tight text-emerald-800 dark:text-emerald-400">
                  PURE<span className="text-amber-500">HONEY</span>
                </span>
                <span className="block text-[10px] text-zinc-500 dark:text-zinc-400 font-medium -mt-1 tracking-wider uppercase">
                  ১০০% খাঁটি প্রাকৃতিক মধু
                </span>
              </div>
            </LocalizedClientLink>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed max-w-md">
              সরাসরি সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে সংগৃহীত শতভাগ খাঁটি ও কাঁচা মধুর বিশ্বস্ত অনলাইন শপ।
            </p>
            <div className="pt-2 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <a
                  href="https://wa.me/8801999602203"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-emerald-700 dark:hover:text-emerald-400 transition-colors"
                >
                  +৮৮০ ১৯৯৯-৬০২২০৩ (হোয়াটসঅ্যাপ)
                </a>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>support@purehoney.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-emerald-700 dark:text-emerald-400 shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* 2. Quick Links (3 Cols) */}
          <div className="space-y-3 md:col-span-3">
            <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>
                <LocalizedClientLink
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  href="/store"
                >
                  সকল ফুলের মধু
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  href="/about"
                >
                  আমাদের সম্পর্কে ও মধুর গল্প
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  href="/contact"
                >
                  যোগাযোগ ও কাস্টমার সাপোর্ট
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  href="/account"
                >
                  আমার অ্যাকাউন্ট
                </LocalizedClientLink>
              </li>
              <li>
                <LocalizedClientLink
                  className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                  href="/cart"
                >
                  শপিং কার্ট
                </LocalizedClientLink>
              </li>
            </ul>
          </div>

          {/* 3. Customer Service & Payment Badges (4 Cols) */}
          <div className="space-y-4 md:col-span-4">
            <div className="space-y-2.5">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
                গ্রাহক সেবা ও নিশ্চয়তা
              </h4>
              <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                <li>🚚 সারা দেশে ক্যাশ অন ডেলিভারি</li>
                <li>🍯 শতভাগ খাঁটি ও ল্যাব টেস্টেড কাঁচা মধু</li>
                <li>🫙 বায়ুরোধী কাচের জারে নিরাপদ প্যাকেজিং</li>
                <li>🔄 পছন্দ না হলে ১০০% মানি-ব্যাক গ্যারান্টি</li>
              </ul>
            </div>

            {/* Payment Methods */}
            <div className="pt-2">
              <div className="text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-2">
                পেমেন্ট পদ্ধতি
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                  ক্যাশ অন ডেলিভারি
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-pink-50 dark:bg-pink-950/40 border border-pink-200 dark:border-pink-800 text-pink-700 dark:text-pink-300">
                  bKash
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800 text-orange-700 dark:text-orange-300">
                  Nagad
                </span>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-bold bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-800 text-purple-700 dark:text-purple-300">
                  Rocket
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 pt-6 border-t border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} PURE HONEY. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            <span>১০০% খাঁটি ও প্রাকৃতিক খাবারের প্রতিশ্রুতি সহ</span>
            <span className="text-amber-600">❤️</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
