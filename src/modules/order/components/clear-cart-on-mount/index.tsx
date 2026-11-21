"use client"

import { useEffect } from "react"

export default function ClearCartOnMount() {
  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("purehoney_cart_v2")
        sessionStorage.removeItem("medusa_cart_map")
      } catch (e) {
        console.warn("Failed to clear local cart storage:", e)
      }
      // Broadcast cart clear and sync state to wipe all optimistic cart quantities
      window.dispatchEvent(new CustomEvent("cart:clear"))
      window.dispatchEvent(new CustomEvent("cart:sync-state", { detail: {} }))
    }
  }, [])

  return null
}
