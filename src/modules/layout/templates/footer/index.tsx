import { listCategories } from "@lib/data/categories"
import { listCollections } from "@lib/data/collections"
import { clx } from "@medusajs/ui"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { PhoneCall, Mail, MapPin } from "lucide-react"

export default async function Footer() {
  const { collections } = await listCollections({
    fields: "*products",
  })
  const productCategories = await listCategories()

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
              সরাসরি সুন্দরবন ও প্রাকৃতিক খামার থেকে সংগৃহীত শতভাগ খাঁটি ও ভেজালমুক্ত প্রাকৃতিক মধুর বিশ্বস্ত ঠিকানা।
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

          {/* Categories */}
          <div className="space-y-3">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-100 text-sm tracking-wide">
              ক্যাটাগরি
            </h4>
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              {productCategories && productCategories?.length > 0 ? (
                productCategories.slice(0, 6).map((c) => (
                  <li key={c.id}>
                    <LocalizedClientLink
                      className="hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                      href={`/categories/${c.handle}`}
                    >
                      {c.name}
                    </LocalizedClientLink>
                  </li>
                ))
              ) : (
                <>
                  <li>সুন্দরবনের মধু</li>
                  <li>সরিষা ফুলের মধু</li>
                  <li>কালোজিরা মধু</li>
                  <li>লিচু ফুলের মধু</li>
                </>
              )}
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
                  সকল পণ্য
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
            <ul className="space-y-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              <li>🚚 সারা দেশে ক্যাশ অন ডেলিভারি</li>
              <li>🛡️ ১০০% খাঁটি পণ্য ও ল্যাব টেস্টেড</li>
              <li>🔄 ৭ দিনের সহজ রিটার্ন পলিসি</li>
              <li>💬 ২৪/৭ কাস্টমার সাপোর্ট</li>
            </ul>
          </div>
        </div>

        {/* Bottom Copyright */}
        <div className="mt-14 pt-6 border-t border-zinc-200 dark:border-zinc-850 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-500">
          <p>© {new Date().getFullYear()} PURE HONEY. সর্বস্বত্ব সংরক্ষিত।</p>
          <p className="flex items-center gap-1">
            <span>Made with</span>
            <span className="text-amber-500">❤️</span>
            <span>for natural & organic lifestyle</span>
          </p>
        </div>
      </div>
    </footer>
  )
}
