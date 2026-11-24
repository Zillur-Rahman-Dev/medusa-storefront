"use client"

import React, { useState, useEffect, useRef } from "react"
import { usePathname } from "next/navigation"
import { X } from "lucide-react"
import HeaderSearch from "@modules/layout/components/header-search"

export default function MobileSearchRow() {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  // Close search row on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  useEffect(() => {
    const handleToggle = () => {
      setIsOpen((prev) => {
        const nextState = !prev
        if (nextState) {
          window.scrollTo({ top: 0, behavior: "smooth" })
          setTimeout(() => {
            const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement
            if (input) {
              input.focus()
            }
          }, 150)
        }
        return nextState
      })
    }

    const handleOpen = () => {
      setIsOpen(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
      setTimeout(() => {
        const input = containerRef.current?.querySelector('input[type="text"]') as HTMLInputElement
        if (input) {
          input.focus()
        }
      }, 150)
    }

    const handleClose = () => {
      setIsOpen(false)
    }

    window.addEventListener("toggle-mobile-search", handleToggle)
    window.addEventListener("open-mobile-search", handleOpen)
    window.addEventListener("close-mobile-search", handleClose)

    return () => {
      window.removeEventListener("toggle-mobile-search", handleToggle)
      window.removeEventListener("open-mobile-search", handleOpen)
      window.removeEventListener("close-mobile-search", handleClose)
    }
  }, [])

  if (!isOpen) return null

  return (
    <div
      ref={containerRef}
      className="md:hidden px-3 py-2 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 animate-in slide-in-from-top-2 duration-200 shadow-sm"
    >
      <div className="flex items-center gap-2 max-w-lg mx-auto">
        <div className="flex-1">
          <HeaderSearch />
        </div>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="p-1.5 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors shrink-0 cursor-pointer"
          aria-label="সার্চ বন্ধ করুন"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
