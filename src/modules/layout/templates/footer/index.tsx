import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PhoneCall, Mail, MapPin } from "lucide-react"

const honeyList = [
  "খলিশা ও সুন্দরবনের ফুল",
  "বনের খাঁটি মধু (সুন্দরবন)",
  "সরিষা ফুলের মধু",
  "লিচু ফুলের মধু",
  "কালোজিরা ফুলের মধু",
  "ধনে ফুলের মধু",
  "পাহাড়ে মৌচাকের মধু",
  "বাবলা ও কুল (বরই) মধু",
  "কুসুম, তিসি ও সূর্যমুখী ফুল",
  "বুনো ফুলের মধু",
]

export default function Footer() {
  return (
    <footer className="border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/80 transition-colors duration-300 w-full mt-auto">
      <div className="content-container flex flex-col w-full py-14 sm:py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand Info & Mission */}
          <div className="space-y-4 md:col-span-1">
            <LocalizedClientLink
              href="/"
              className="flex items-center gap-2"
            >
              <span className="text-2xl">🍯</span>
              <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                PURE<span className="text-amber-600 dark:text-amber-400">HONEY</span>
              </span>
            </LocalizedClientLink>
            <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
              সরাসরি সুন্দরবনের ম্যানগ্রোভ ও গ্রামবাংলার সেরা প্রাকৃতিক মৌচাক থেকে সংগৃহীত শতভাগ খাঁটি ও কাঁচা মধুর বিশ্বস্ত অনলাইন ঠিকানা।
            </p>
            <div className="pt-2 space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 font-medium">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>+৮৮০ ১৭১১-XXXXXX (হোয়াটসঅ্যাপ)</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>support@purehoney.com</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                <span>ঢাকা, বাংলাদেশ</span>
              </div>
            </div>
          </div>

          {/* Honey Varieties List */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
              আমাদের মধুর কালেকশন
            </h4>
            <ul className="grid grid-cols-1 gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              {honeyList.map((item, idx) => (
                <li key={idx}>
                  <LocalizedClientLink
                    href="/store"
                    className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors flex items-center gap-1.5"
                  >
                    <span className="text-amber-500 text-xs">•</span>
                    <span>{item}</span>
                  </LocalizedClientLink>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
              প্রয়োজনীয় লিংক
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
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

          {/* Customer Service & Policies */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
              গ্রাহক সেবা ও নিশ্চয়তা
            </h4>
            <ul className="space-y-2.5 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>🚚 সারা দেশে ক্যাশ অন ডেলিভারি</li>
              <li>🍯 শতভাগ খাঁটি ও ল্যাব টেস্টেড কাঁচা মধু</li>
              <li>🫙 বায়ুরোধী কাচের জারে নিরাপদ প্যাকেজিং</li>
              <li>🔄 পছন্দ না হলে সম্পূর্ণ মানি-ব্যাক গ্যারান্টি</li>
              <li>💬 ২৪/৭ সার্বক্ষণিক হোয়াটসঅ্যাপ হেল্পলাইন</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} PURE HONEY. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-amber-500">❤️</span>
            <span>for 100% pure & raw natural lifestyle</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
