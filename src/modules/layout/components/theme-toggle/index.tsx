"use client"

import { useEffect, useState } from "react"
import { Sun, Moon } from "lucide-react"

export default function ThemeToggle() {
  const [theme, setTheme] = useState<"light" | "dark">("light")
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    if (savedTheme) {
      setTheme(savedTheme)
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark")
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark")
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      setTheme("light")
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }

  if (!mounted) {
    return <div className="w-9 h-9 rounded-full" />
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      className="relative p-2 rounded-full border transition-all duration-300 flex items-center justify-center
        bg-zinc-100 hover:bg-zinc-200 border-zinc-200 text-zinc-700
        dark:bg-zinc-900 dark:hover:bg-zinc-800 dark:border-zinc-700 dark:text-amber-400
        focus:outline-none focus:ring-2 focus:ring-amber-500"
      title={theme === "light" ? "ডার্ক মোড চালু করুন" : "লাইট মোড চালু করুন"}
    >
      {theme === "light" ? (
        <Moon className="w-4 h-4 transition-transform duration-300 hover:rotate-12" />
      ) : (
        <Sun className="w-4 h-4 transition-transform duration-300 hover:rotate-45" />
      )}
    </button>
  )
}
