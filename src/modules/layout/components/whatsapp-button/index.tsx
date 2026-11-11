"use client"

import React from "react"

export default function WhatsAppButton() {
  const whatsappNumber =
    process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "8801700000000"

  const defaultMessage = encodeURIComponent(
    "আসসালামু আলাইকুম, আমি খাঁটি মধু অর্ডার করতে চাই।"
  )

  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${defaultMessage}`

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-40 group select-none">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="হোয়াটসঅ্যাপে সরাসরি অর্ডার করুন"
        className="flex items-center gap-2.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white px-3.5 sm:px-4 py-3 rounded-full shadow-lg hover:shadow-emerald-500/30 transition-all duration-300 relative border-2 border-white/80 dark:border-zinc-800"
      >
        {/* Subtle Pulse Radar Animation */}
        <span className="absolute -inset-1 rounded-full bg-emerald-500 opacity-25 animate-ping pointer-events-none" />

        {/* WhatsApp Official Vector Icon */}
        <svg
          viewBox="0 0 24 24"
          width="26"
          height="26"
          fill="currentColor"
          className="shrink-0 drop-shadow-xs"
        >
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.04 20.16C10.56 20.16 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.16 12.04 20.16ZM16.56 14.37C16.31 14.24 15.09 13.64 14.86 13.56C14.64 13.48 14.47 13.44 14.3 13.69C14.13 13.94 13.65 14.51 13.5 14.68C13.35 14.85 13.2 14.87 12.95 14.75C12.7 14.62 11.9 14.36 10.95 13.52C10.21 12.86 9.71 12.04 9.56 11.79C9.41 11.54 9.54 11.4 9.67 11.27C9.78 11.16 9.92 10.98 10.04 10.84C10.16 10.7 10.21 10.59 10.29 10.43C10.37 10.26 10.33 10.12 10.27 10C10.21 9.87 9.71 8.65 9.5 8.15C9.3 7.66 9.09 7.73 8.94 7.72C8.8 7.71 8.63 7.71 8.46 7.71C8.29 7.71 8.02 7.77 7.79 8.02C7.56 8.27 6.92 8.87 6.92 10.09C6.92 11.31 7.81 12.48 7.93 12.65C8.06 12.82 9.67 15.31 12.14 16.38C12.73 16.63 13.19 16.78 13.55 16.9C14.14 17.08 14.68 17.06 15.11 16.99C15.59 16.92 16.58 16.39 16.79 15.8C17 15.21 17 14.7 16.93 14.6C16.87 14.49 16.72 14.43 16.56 14.37Z" />
        </svg>

        {/* Text Label on Desktop */}
        <span className="hidden sm:inline-block font-extrabold text-xs tracking-tight whitespace-nowrap drop-shadow-xs">
          WhatsApp অর্ডার
        </span>
      </a>
    </div>
  )
}
