"use client"

import { useState } from "react"
import { Search } from "lucide-react"
import { useRouter, useParams } from "next/navigation"

export default function HeaderSearch() {
  const [query, setQuery] = useState("")
  const router = useRouter()
  const params = useParams()
  const countryCode = (params?.countryCode as string) || "bd"

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) {
      router.push(`/${countryCode}/store`)
      return
    }
    router.push(`/${countryCode}/store?q=${encodeURIComponent(query.trim())}`)
  }

  return (
    <form
      onSubmit={handleSearch}
      className="relative flex items-center w-full max-w-xs sm:max-w-sm mx-auto"
    >
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="খাঁটি মধু খুঁজুন..."
        className="w-full pl-3.5 pr-16 py-1.5 rounded-full text-xs sm:text-sm bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1.5 focus:ring-emerald-600 focus:bg-white dark:focus:bg-zinc-950 transition-all shadow-inner"
      />
      <button
        type="submit"
        aria-label="Search"
        className="absolute right-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 shadow-sm transition-colors"
      >
        <Search className="w-3.5 h-3.5" />
        <span className="hidden sm:inline">সার্চ</span>
      </button>
    </form>
  )
}
