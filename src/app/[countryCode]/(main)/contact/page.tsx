import { Metadata } from "next"
import ContactForm from "@modules/contact/components/contact-form"
import { PhoneCall, Mail, MapPin, Clock, MessageSquareQuote } from "lucide-react"

export const metadata: Metadata = {
  title: "যোগাযোগ • PURE HONEY",
  description:
    "যেকোনো অনুসন্ধান, পাইকারি অর্ডার কিংবা পরামর্শের জন্য PURE HONEY টিমের সাথে সহজে যোগাযোগ করুন।",
}

export default function ContactPage() {
  return (
    <div className="bg-white dark:bg-zinc-950 transition-colors duration-300">
      {/* Header Banner */}
      <section className="relative py-16 sm:py-24 bg-zinc-50 dark:bg-zinc-900/40 border-b border-zinc-200/80 dark:border-zinc-800/80">
        <div className="content-container text-center max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
            <MessageSquareQuote className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>আমরা আপনার সেবায় প্রস্তুত</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight">
            আমাদের সাথে যোগাযোগ করুন
          </h1>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            মধু বা যেকোনো অর্গানিক পণ্যের অর্ডার, হোলসেল বা কোনো প্রশ্নের জন্য সরাসরি আমাদের সাথে কল বা মেসেজে যোগাযোগ করুন।
          </p>
        </div>
      </section>

      {/* Main Content: Info Cards & Form */}
      <section className="py-14 sm:py-20">
        <div className="content-container max-w-5xl">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12">
            {/* Left: Contact Info Cards (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 mb-2">
                  সরাসরি যোগাযোগ মাধ্যম
                </h2>
                <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
                  নিচের যেকোনো মাধ্যমে দ্রুত সাড়া পেয়ে যাবেন।
                </p>
              </div>

              {/* WhatsApp & Call */}
              <a
                href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20PURE%20HONEY%20থেকে%20পণ্য%20সম্পর্কে%20জানতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 hover:border-amber-400 dark:hover:border-amber-500/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                  <PhoneCall className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    হোয়াটসঅ্যাপ ও মোবাইল সাপোর্ট
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    +৮৮০ ১৭১১-XXXXXX
                  </p>
                  <span className="inline-block mt-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                    সরাসরি হোয়াটসঅ্যাপে চ্যাট করুন →
                  </span>
                </div>
              </a>

              {/* Email */}
              <div className="flex items-start gap-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
                  <Mail className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                    ইমেইল যোগাযোগ
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    support@purehoney.com
                  </p>
                  <p className="text-[11px] text-zinc-400 mt-1">
                    যেকোনো অফিশিয়াল বা প্রাতিষ্ঠানিক জিজ্ঞাসা
                  </p>
                </div>
              </div>

              {/* Location & Time */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800/80 space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      অফিস ও ওয়্যারহাউজ
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      উত্তরা, ঢাকা-১২৩০, বাংলাদেশ
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3 pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                      কাস্টমার সার্ভিস সময়
                    </h4>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">
                      প্রতিদিন সকাল ৯:০০ টা - রাত ১০:০০ টা (সপ্তাহে ৭ দিন)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Interactive Message Form (7 Cols) */}
            <div className="lg:col-span-7 p-6 sm:p-8 rounded-3xl bg-white dark:bg-zinc-900/60 border border-zinc-200/80 dark:border-zinc-800/80 shadow-sm">
              <div className="mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-100">
                  সরাসরি বার্তা পাঠান
                </h3>
                <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                  আপনার নাম এবং মেসেজ লিখুন, আমরা দ্রুততম সময়ে আপনার সাথে যোগাযোগ করব।
                </p>
              </div>

              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
