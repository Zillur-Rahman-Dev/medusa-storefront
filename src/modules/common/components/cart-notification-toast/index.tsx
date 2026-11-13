"use client"

import React, { useEffect, useState } from "react"
import LocalizedClientLink from "@modules/common/components/localized-client-link"
import { CheckCircle2, AlertTriangle, X, ShoppingCart } from "lucide-react"

type ToastData = {
  type: "success" | "error"
  title: string
  subtitle?: string
  price?: number
}

export default function CartNotificationToast() {
  const [toast, setToast] = useState<ToastData | null>(null)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    let timer: NodeJS.Timeout

    const handleAdded = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      setToast({
        type: "success",
        title: "কার্টে যোগ হয়েছে!",
        subtitle: detail.title ? `${detail.title}${detail.variant ? ` (${detail.variant})` : ""}` : "পণ্যটি কার্টে যুক্ত হয়েছে",
        price: detail.price,
      })
      setVisible(true)

      clearTimeout(timer)
      timer = setTimeout(() => {
        setVisible(false)
      }, 3500)
    }

    const handleFailed = (e: Event) => {
      const detail = (e as CustomEvent).detail || {}
      setToast({
        type: "error",
        title: "যোগ করা সম্ভব হয়নি!",
        subtitle: detail.message || "ইন্টারনেট সংযোগে সমস্যা হয়েছে। দয়া করে আবার চেষ্টা করুন।",
      })
      setVisible(true)

      clearTimeout(timer)
      timer = setTimeout(() => {
        setVisible(false)
      }, 4500)
    }

    window.addEventListener("cart:item-added", handleAdded)
    window.addEventListener("cart:item-failed", handleFailed)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("cart:item-added", handleAdded)
      window.removeEventListener("cart:item-failed", handleFailed)
    }
  }, [])

  if (!visible || !toast) return null

  return (
    <aside
      aria-label="শপিং কার্ট নোটিফিকেশন"
      className="fixed top-4 left-4 right-4 sm:left-auto sm:right-6 sm:top-6 z-50 max-w-md w-auto animate-in fade-in slide-in-from-top-4 duration-300 pointer-events-auto"
    >
      <div
        className={`flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl shadow-2xl backdrop-blur-md border ${
          toast.type === "success"
            ? "bg-white/95 dark:bg-zinc-900/95 border-emerald-500/30 text-zinc-900 dark:text-zinc-100 ring-1 ring-emerald-500/20"
            : "bg-red-50/95 dark:bg-red-950/90 border-red-500/40 text-red-950 dark:text-red-100 ring-1 ring-red-500/20"
        }`}
      >
        {/* Icon */}
        <div className="shrink-0 mt-0.5">
          {toast.type === "success" ? (
            <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/60 flex items-center justify-center text-red-600 dark:text-red-400">
              <AlertTriangle className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 pr-1">
          <h4 className="text-xs sm:text-sm font-bold tracking-tight flex items-center gap-1.5">
            <span>{toast.title}</span>
            {toast.type === "success" && <span className="text-sm">🍯</span>}
          </h4>
          {toast.subtitle && (
            <p className="text-xs text-zinc-600 dark:text-zinc-400 line-clamp-1 mt-0.5 font-medium">
              {toast.subtitle}
            </p>
          )}

          {toast.type === "success" && (
            <div className="mt-2.5 flex items-center gap-2">
              <LocalizedClientLink
                href="/cart"
                onClick={() => setVisible(false)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>কার্ট দেখুন</span>
              </LocalizedClientLink>
              <LocalizedClientLink
                href="/checkout"
                onClick={() => setVisible(false)}
                className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition-colors shadow-sm"
              >
                <span>অর্ডার করুন</span>
              </LocalizedClientLink>
            </div>
          )}
        </div>

        {/* Close Button */}
        <button
          type="button"
          onClick={() => setVisible(false)}
          className="shrink-0 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded-lg transition-colors"
          aria-label="বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </aside>
  )
}
