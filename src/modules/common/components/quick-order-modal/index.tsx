"use client"

import { useState } from "react"
import { X, CheckCircle, Truck, ShieldCheck, PhoneCall, ShoppingBag } from "lucide-react"
import { formatPrice, formatSize } from "@lib/util/money"

type QuickOrderModalProps = {
  isOpen: boolean
  onClose: () => void
  product: {
    title: string
    price: number | string
    thumbnail?: string | null
    size?: string
  }
}

export default function QuickOrderModal({
  isOpen,
  onClose,
  product,
}: QuickOrderModalProps) {
  const [quantity, setQuantity] = useState(1)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [deliveryArea, setDeliveryArea] = useState<"inside" | "outside">("inside")
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  // Calculate numeric price
  const unitPrice =
    typeof product.price === "number"
      ? product.price
      : parseInt(String(product.price).replace(/[^0-9]/g, ""), 10) || 750

  const deliveryCharge = deliveryArea === "inside" ? 70 : 130
  const subtotal = unitPrice * quantity
  const total = subtotal + deliveryCharge

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Simulate order placement
    setTimeout(() => {
      setLoading(false)
      setIsSubmitted(true)
    }, 800)
  }

  const resetAndClose = () => {
    setIsSubmitted(false)
    setName("")
    setPhone("")
    setAddress("")
    setQuantity(1)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800 bg-emerald-50/50 dark:bg-emerald-950/20">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-400 font-bold text-base sm:text-lg">
            <ShoppingBag className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>সরাসরি দ্রুত অর্ডার (ক্যাশ অন ডেলিভারি)</span>
          </div>
          <button
            onClick={resetAndClose}
            className="p-1 rounded-full text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {isSubmitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-zinc-100">
              অর্ডারটি সফলভাবে সম্পন্ন হয়েছে!
            </h3>
            <p className="text-sm text-zinc-600 dark:text-zinc-300 max-w-md mx-auto leading-relaxed">
              ধন্যবাদ <strong>{name}</strong>! আপনার <strong>{product.title}</strong> (পরিমাণ: {formatSize(String(quantity))}) এর অর্ডারটি গ্রহণ করা হয়েছে। ডেলিভারির আগে আপনাকে ফোন দেওয়া হবে।
            </p>
            <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700 text-xs text-zinc-600 dark:text-zinc-300">
              মোট প্রদেয় টাকা: <strong className="text-emerald-700 dark:text-emerald-400 text-sm">{formatPrice(total)}</strong> (ক্যাশ অন ডেলিভারি)
            </div>
            <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={resetAndClose}
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950"
              >
                ঠিক আছে
              </button>
              <a
                href={`https://wa.me/8801700000000?text=আসসালামু%20আলাইকুম,%20আমি%20${encodeURIComponent(product.title)}%20(পরিমাণ:%20${quantity})%20অর্ডার%20করেছি।`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-6 py-2.5 rounded-xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center gap-1.5"
              >
                <PhoneCall className="w-4 h-4" />
                <span>হোয়াটসঅ্যাপে ট্র্যাকিং</span>
              </a>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4">
            {/* Product Summary */}
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🍯</span>
                <div>
                  <h4 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 line-clamp-1">
                    {product.title}
                  </h4>
                  <div className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold">
                    {formatPrice(unitPrice)} {product.size && `• ${formatSize(product.size)}`}
                  </div>
                </div>
              </div>

              {/* Quantity Counter */}
              <div className="flex items-center gap-2 border border-zinc-300 dark:border-zinc-700 rounded-xl px-2 py-1 bg-white dark:bg-zinc-900">
                <button
                  type="button"
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="w-6 h-6 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 font-bold"
                >
                  -
                </button>
                <span className="text-xs font-bold text-zinc-900 dark:text-zinc-100 w-4 text-center">
                  {formatSize(String(quantity))}
                </span>
                <button
                  type="button"
                  onClick={() => setQuantity(quantity + 1)}
                  className="w-6 h-6 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-emerald-600 font-bold"
                >
                  +
                </button>
              </div>
            </div>

            {/* Customer Inputs */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                আপনার নাম *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="যেমন: তানভীর আহমেদ"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                মোবাইল নম্বর * (১১ ডিজিট)
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="017XXXXXXXX"
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1">
                সম্পূর্ণ ডেলিভারি ঠিকানা *
              </label>
              <textarea
                required
                rows={2}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="বাসা নং, রোড নং, এলাকা, থানা ও জেলা..."
                className="w-full px-3.5 py-2.5 rounded-xl text-sm bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-300 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none"
              />
            </div>

            {/* Delivery Area Radio */}
            <div>
              <label className="block text-xs font-bold text-zinc-800 dark:text-zinc-200 mb-1.5">
                ডেলিভারি এরিয়া নির্বাচন করুন
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setDeliveryArea("inside")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    deliveryArea === "inside"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold"
                      : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div>ঢাকার ভেতরে</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">৳৭০</div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryArea("outside")}
                  className={`p-3 rounded-xl border text-left text-xs transition-all ${
                    deliveryArea === "outside"
                      ? "border-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-300 font-bold"
                      : "border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800/40 text-zinc-600 dark:text-zinc-300"
                  }`}
                >
                  <div>ঢাকার বাইরে</div>
                  <div className="text-emerald-700 dark:text-emerald-400 font-extrabold mt-0.5">৳১৩০</div>
                </button>
              </div>
            </div>

            {/* Cost Breakdown */}
            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 space-y-1 text-xs">
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>পণ্যের মূল্য ({formatSize(String(quantity))} টি)</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between text-zinc-600 dark:text-zinc-400">
                <span>ডেলিভারি চার্জ</span>
                <span>{formatPrice(deliveryCharge)}</span>
              </div>
              <div className="flex justify-between text-sm font-black text-zinc-900 dark:text-zinc-100 pt-1 border-t border-zinc-200 dark:border-zinc-800">
                <span>সর্বমোট প্রদেয় বিল:</span>
                <span className="text-emerald-700 dark:text-emerald-400">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl font-bold text-sm bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <Truck className="w-4 h-4" />
              <span>{loading ? "অর্ডার সাবমিট হচ্ছে..." : `অর্ডার কনফার্ম করুন (${formatPrice(total)})`}</span>
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>১০০% ক্যাশ অন ডেলিভারি • পার্সেল হাতে পেয়ে পেমেন্ট করুন</span>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
