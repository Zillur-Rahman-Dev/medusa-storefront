"use client"

import { useState } from "react"
import { Send, CheckCircle2 } from "lucide-react"

export default function ContactForm() {
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "অর্ডার সংক্রান্ত জিজ্ঞাসা",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate sending message
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 800)
  }

  if (submitted) {
    return (
      <div className="p-8 sm:p-10 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
          ধন্যবাদ! আপনার বার্তা সফলভাবে পাঠানো হয়েছে।
        </h3>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mx-auto">
          আমাদের কাস্টমার কেয়ার টিম খুব শীঘ্রই আপনার দেওয়া ফোন নম্বরে যোগাযোগ করবে।
        </p>
        <button
          type="button"
          onClick={() => {
            setSubmitted(false)
            setFormData({ name: "", phone: "", subject: "অর্ডার সংক্রান্ত জিজ্ঞাসা", message: "" })
          }}
          className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 underline underline-offset-4"
        >
          আরেকটি বার্তা পাঠান
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          আপনার পুরো নাম *
        </label>
        <input
          type="text"
          required
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="যেমন: তানভীর আহমেদ"
          className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          মোবাইল নম্বর / হোয়াটসঅ্যাপ *
        </label>
        <input
          type="tel"
          required
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
          placeholder="যেমন: 017XXXXXXXX"
          className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          বিষয়
        </label>
        <select
          value={formData.subject}
          onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
          className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
        >
          <option value="অর্ডার সংক্রান্ত জিজ্ঞাসা">অর্ডার সংক্রান্ত জিজ্ঞাসা</option>
          <option value="পাইকারি / হোলসেল ক্রয়">পাইকারি / হোলসেল ক্রয়</option>
          <option value="ডেলিভারি স্ট্যাটাস">ডেলিভারি স্ট্যাটাস</option>
          <option value="অন্যান্য পরামর্শ">অন্যান্য পরামর্শ</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
          আপনার বার্তা / জিজ্ঞাসা *
        </label>
        <textarea
          required
          rows={4}
          value={formData.message}
          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
          placeholder="আপনার জিজ্ঞাসা বিস্তারিত লিখুন..."
          className="w-full px-4 py-3 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-amber-500/50 resize-none"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-sm bg-amber-500 hover:bg-amber-600 dark:bg-amber-500 dark:hover:bg-amber-400 text-zinc-950 transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
        <span>{loading ? "পাঠানো হচ্ছে..." : "বার্তা পাঠান"}</span>
      </button>
    </form>
  )
}
