"use client"

import { useState } from "react"
import { ChevronDown, HelpCircle } from "lucide-react"

type FAQItem = {
  question: string
  answer: string
}

const faqs: FAQItem[] = [
  {
    question: "মধু খাঁটি কিনা বোঝার সবচেয়ে সঠিক উপায় কি?",
    answer:
      "খাঁটি মধুর প্রধান বৈশিষ্ট্য এর প্রাকৃতিক স্বাদ, তীব্র সুবাস এবং গলার ভেতরে কিছুটা ঝাঁঝালো অনুভূতি। মোমবাতি বা পানিতে দ্রবীভূত করার ঘরোয়া পরীক্ষাগুলো সবসময় শতভাগ বৈজ্ঞানিক নয়; একমাত্র ল্যাব টেস্ট (HMF, সুগার প্রোফাইল ও পোলেন অ্যানালাইসিস)-এর মাধ্যমেই খাঁটি মধুর নির্ভুল প্রমাণ পাওয়া সম্ভব। আমাদের মধু সম্পূর্ণ প্রাকৃতিক ও মাননিয়ন্ত্রিত।",
  },
  {
    question: "শীতকালে বা ফ্রিজে রাখলে মধু জমে যায় কেন? এটা কি নকলের লক্ষণ?",
    answer:
      "একদমই না! বরং খাঁটি কাঁচা মধুর একটি প্রাকৃতিক বৈশিষ্ট্য হলো ক্রিস্টালাইজেশন বা জমে যাওয়া। ফুলে থাকা গ্লুকোজ ও ফ্রুক্টোজের প্রাকৃতিক অনুপাতের কারণে বিশেষ করে সরিষা ও লিচু ফুলের মধু শীতকালে ঘি বা ক্রিমের মতো জমে যায়। এতে মধুর খাদ্যগুণ এতটুকুও নষ্ট হয় না।",
  },
  {
    question: "অর্ডার করার পর ডেলিভারি পেতে কত দিন সময় লাগে?",
    answer:
      "ঢাকা সিটির মধ্যে সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে এবং ঢাকার বাইরে সারা বাংলাদেশে ২ থেকে ৩ কার্যদিবসের মধ্যে আপনার দোরগোড়ায় পৌঁছে দেওয়া হয়।",
  },
  {
    question: "ক্যাশ অন ডেলিভারি (Cash on Delivery) সুবিধা আছে কি?",
    answer:
      "হ্যাঁ, সারা বাংলাদেশে ১০০% ক্যাশ অন ডেলিভারি সুবিধা রয়েছে। আপনি পার্সেল হাতে পেয়ে দেখে তারপর সম্পূর্ণ মূল্য পরিশোধ করতে পারবেন।",
  },
  {
    question: "পণ্য ডেলিভারির সময় পাত্রে কোনো ক্ষতি বা লিক হলে কী করণীয়?",
    answer:
      "আমরা ফুড-গ্রেড লিক-প্রুফ পাত্রে বাবুল র‍্যাপ দিয়ে অত্যন্ত নিরাপদ প্যাকেজিং করি। এরপরও যদি পরিবহনে কোনো ক্ষতি বা লিক পরিলক্ষিত হয়, ডেলিভারি ম্যানের উপস্থিতিতে চেক করে জানালে সাথে সাথে সম্পূর্ণ ফ্রিতে নতুন মধু প্রতিস্থাপন অথবা মানি-ব্যাক দেওয়া হয়।",
  },
]

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx)
  }

  return (
    <section className="py-16 sm:py-24 bg-white dark:bg-zinc-950 transition-colors">
      <div className="content-container max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300 mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span>সাধারণ জিজ্ঞাসা ও উত্তর</span>
          </div>
          <h2 className="text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">
            সচরাচর জিজ্ঞাসিত প্রশ্নসমূহ
          </h2>
          <p className="mt-2 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
            মধুর বিশুদ্ধতা, সংরক্ষণ ও অর্ডার সম্পর্কিত আপনার যেকোনো প্রশ্নের স্পষ্ট উত্তর।
          </p>
        </div>

        {/* Accordion list */}
        <div className="space-y-3 sm:space-y-4">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx
            return (
              <div
                key={idx}
                className="border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-zinc-50/50 dark:bg-zinc-900/40 transition-colors"
              >
                <button
                  type="button"
                  onClick={() => toggle(idx)}
                  className="w-full py-4 sm:py-5 px-5 sm:px-6 flex items-center justify-between text-left gap-4 hover:bg-zinc-100/50 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <span className="font-semibold text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-zinc-500 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180 text-amber-600 dark:text-amber-400" : ""
                    }`}
                  />
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60">
                    {faq.answer}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </section>
  )
}
