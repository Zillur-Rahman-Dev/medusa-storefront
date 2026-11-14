"use client"

import { useState, useRef, useEffect } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { Menu, Info, HelpCircle, PhoneCall, MessageCircle } from "lucide-react"

export default function MoreMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const handleMouseEnter = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    timerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 200)
  }

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  return (
    <div
      ref={menuRef}
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Trigger Button: Hamburger icon + "মেনু" text in Amber */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex flex-col items-center justify-center p-1.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors group cursor-pointer focus:outline-none"
        aria-label="মেনু অপশন"
        aria-expanded={isOpen}
      >
        <Menu className="w-5 h-5 text-amber-500 group-hover:text-amber-600 transition-colors stroke-[2.5]" />
        <span className="text-[11px] font-bold text-amber-500 group-hover:text-amber-600 transition-colors leading-tight">
          মেনু
        </span>
      </button>

      {/* Floating Card Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-52 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-200/80 dark:border-zinc-800 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1 duration-150">
          <ul className="divide-y divide-zinc-100 dark:divide-zinc-800 text-sm font-medium">
            {/* 1. About Us */}
            <li>
              <LocalizedClientLink
                href="/about"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                  <Info className="w-5 h-5" />
                </div>
                <span>আমাদের সম্পর্কে</span>
              </LocalizedClientLink>
            </li>

            {/* 2. Faqs */}
            <li>
              <LocalizedClientLink
                href="/#faq"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <span>সাধারণ জিজ্ঞাসা</span>
              </LocalizedClientLink>
            </li>

            {/* 3. Call Us */}
            <li>
              <a
                href="tel:+8801700000000"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center text-emerald-800 dark:text-emerald-400">
                  <PhoneCall className="w-5 h-5" />
                </div>
                <span>কল করুন</span>
              </a>
            </li>

            {/* 4. WhatsApp */}
            <li>
              <a
                href="https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20মধু%20অর্ডার%20করতে%20চাই।"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3.5 px-4 py-3 hover:bg-zinc-50 dark:hover:bg-zinc-800/60 text-zinc-700 dark:text-zinc-200 transition-colors"
              >
                <div className="w-6 h-6 flex items-center justify-center text-[#25D366]">
                  <MessageCircle className="w-5 h-5" />
                </div>
                <span>হোয়াটসঅ্যাপ</span>
              </a>
            </li>
          </ul>
        </div>
      )}
    </div>
  )
}
