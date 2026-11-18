"use client"

import { Badge, Heading, Input, Label, Text } from "@medusajs/ui"
import React, { useState, useTransition, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

import { applyPromotions } from "@lib/data/cart"
import { convertToLocale } from "@lib/util/money"
import { HttpTypes } from "@medusajs/types"
import Trash from "@modules/common/icons/trash"

type DiscountCodeProps = {
  cart: HttpTypes.StoreCart & {
    promotions: HttpTypes.StorePromotion[]
  }
}

const DiscountCode: React.FC<DiscountCodeProps> = ({ cart }) => {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [isOpen, setIsOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [codeValue, setCodeValue] = useState("")
  const [isApplying, setIsApplying] = useState(false)
  const [removingCode, setRemovingCode] = useState<string | null>(null)

  const [promotionsList, setPromotionsList] = useState<HttpTypes.StorePromotion[]>(() => {
    if (cart?.promotions && cart.promotions.length > 0) return cart.promotions
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem("purehoney_promotions")
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed.promotions) && parsed.promotions.length > 0) {
            return parsed.promotions
          }
        }
      } catch {}
    }
    return []
  })

  const isTransitioningRef = useRef(false)
  const prevPromotionsCountRef = useRef(promotionsList.length)

  // Sync with Server Component updates
  useEffect(() => {
    if (cart?.promotions && cart.promotions.length > 0) {
      setPromotionsList(cart.promotions)
      try {
        localStorage.setItem(
          "purehoney_promotions",
          JSON.stringify({
            promotions: cart.promotions,
            discount_total: cart.discount_total ?? 0,
            timestamp: Date.now(),
          })
        )
      } catch {}
    }
  }, [cart?.promotions, cart?.discount_total])

  // Listen to broadcast events from other components
  useEffect(() => {
    const handlePromoUpdated = (e: Event) => {
      const detail = (e as CustomEvent).detail
      if (detail && Array.isArray(detail.promotions)) {
        setPromotionsList(detail.promotions)
        try {
          localStorage.setItem(
            "purehoney_promotions",
            JSON.stringify({
              promotions: detail.promotions,
              discount_total: detail.discount_total ?? 0,
              timestamp: Date.now(),
            })
          )
        } catch {}
      }
    }
    window.addEventListener("cart:promo-updated", handlePromoUpdated)
    return () => window.removeEventListener("cart:promo-updated", handlePromoUpdated)
  }, [])

  // 1. When Server Component updates promotionsList:
  useEffect(() => {
    if (promotionsList.length > prevPromotionsCountRef.current) {
      setIsOpen(false)
      setIsApplying(false)
    }
    if (promotionsList.length < prevPromotionsCountRef.current) {
      setRemovingCode(null)
    }
    prevPromotionsCountRef.current = promotionsList.length
  }, [promotionsList.length])

  // 2. Track startTransition(() => router.refresh()) completion without wiping states early:
  useEffect(() => {
    if (isPending) {
      isTransitioningRef.current = true
    } else if (isTransitioningRef.current) {
      isTransitioningRef.current = false
      setIsApplying(false)
      setRemovingCode(null)
    }
  }, [isPending])

  const isApplyLoading = isApplying || isPending
  const isRemoveLoading = (code: string) => removingCode === code

  const removePromotionCode = async (code: string) => {
    setRemovingCode(code)
    setErrorMessage("")

    const validPromotions = promotionsList.filter(
      (promotion) => promotion.code !== code
    )

    setPromotionsList(validPromotions)
    try {
      localStorage.setItem(
        "purehoney_promotions",
        JSON.stringify({
          promotions: validPromotions,
          timestamp: Date.now(),
        })
      )
    } catch {}

    try {
      const res = await applyPromotions(
        validPromotions.filter((p) => p.code !== undefined).map((p) => p.code!)
      )
      if (res && !res.success) {
        setErrorMessage(res.error || "প্রোমো কোড মুছতে সমস্যা হয়েছে।")
        setRemovingCode(null)
      } else {
        if (res?.cart) {
          const updatedPromos = res.cart.promotions || []
          setPromotionsList(updatedPromos)
          try {
            localStorage.setItem(
              "purehoney_promotions",
              JSON.stringify({
                promotions: updatedPromos,
                discount_total: res.cart.discount_total ?? 0,
                timestamp: Date.now(),
              })
            )
          } catch {}
          window.dispatchEvent(
            new CustomEvent("cart:promo-updated", {
              detail: {
                promotions: updatedPromos,
                discount_total: res.cart.discount_total ?? 0,
                subtotal: res.cart.subtotal,
                total: res.cart.total,
              },
            })
          )
        }
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (e: any) {
      setErrorMessage("প্রোমো কোড মুছতে সমস্যা হয়েছে।")
      setRemovingCode(null)
    }
  }

  const handleApplyPromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage("")

    const cleanCode = codeValue.trim()
    if (!cleanCode) {
      setErrorMessage("দয়া করে একটি সঠিক প্রোমো কোড লিখুন।")
      return
    }

    if (promotionsList.some((p) => p.code?.toLowerCase() === cleanCode.toLowerCase())) {
      setErrorMessage("এই প্রোমো কোডটি ইতিমধ্যে প্রয়োগ করা হয়েছে।")
      return
    }

    const currentCodes = promotionsList
      .filter((p) => p.code !== undefined)
      .map((p) => p.code!)
    const updatedCodes = [...currentCodes, cleanCode]

    setIsApplying(true)

    try {
      const res = await applyPromotions(updatedCodes)
      if (res && !res.success) {
        setErrorMessage(
          res.error ||
            "প্রোমো কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে সঠিক কোড দিন।"
        )
        setIsApplying(false)
      } else {
        if (res?.cart) {
          const updatedPromos = res.cart.promotions || []
          setPromotionsList(updatedPromos)
          try {
            localStorage.setItem(
              "purehoney_promotions",
              JSON.stringify({
                promotions: updatedPromos,
                discount_total: res.cart.discount_total ?? 0,
                timestamp: Date.now(),
              })
            )
          } catch {}
          window.dispatchEvent(
            new CustomEvent("cart:promo-updated", {
              detail: {
                promotions: updatedPromos,
                discount_total: res.cart.discount_total ?? 0,
                subtotal: res.cart.subtotal,
                total: res.cart.total,
              },
            })
          )
        }
        setCodeValue("")
        setErrorMessage("")
        startTransition(() => {
          router.refresh()
        })
      }
    } catch (err: any) {
      setErrorMessage(
        "প্রোমো কোডটি সঠিক নয় বা এর মেয়াদ শেষ হয়ে গেছে। দয়া করে সঠিক কোড দিন।"
      )
      setIsApplying(false)
    }
  }

  return (
    <div className="w-full bg-white dark:bg-zinc-900 flex flex-col">
      <div className="txt-medium">
        <form onSubmit={handleApplyPromotion} className="w-full mb-5">
          <Label className="flex gap-x-1 my-2 items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              type="button"
              className="txt-medium text-amber-700 hover:text-amber-800 dark:text-amber-400 dark:hover:text-amber-300 font-semibold hover:underline flex items-center gap-1.5 cursor-pointer"
              data-testid="add-discount-button"
            >
              <span>🏷️</span>
              <span>প্রোমো কোড যোগ করুন</span>
            </button>
          </Label>

          {isOpen && (
            <>
              <div className="flex w-full gap-x-2 mt-2">
                <Input
                  className="size-full"
                  id="promotion-input"
                  name="code"
                  type="text"
                  value={codeValue}
                  onChange={(e) => {
                    setCodeValue(e.target.value)
                    if (errorMessage) setErrorMessage("")
                  }}
                  disabled={isApplyLoading}
                  placeholder="কুপন বা প্রোমো কোড লিখুন"
                  autoFocus={false}
                  data-testid="discount-input"
                />
                <button
                  type="submit"
                  disabled={isApplyLoading}
                  className="h-10 px-5 rounded-lg bg-stone-800 hover:bg-stone-900 text-white font-medium text-sm flex items-center justify-center gap-1.5 shrink-0 transition-colors disabled:opacity-70 disabled:cursor-not-allowed cursor-pointer"
                  data-testid="discount-apply-button"
                >
                  {isApplyLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>প্রয়োগ হচ্ছে...</span>
                    </>
                  ) : (
                    <span>প্রয়োগ করুন</span>
                  )}
                </button>
              </div>

              {errorMessage && (
                <div
                  className="mt-2.5 p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900/60 text-red-700 dark:text-red-300 text-xs font-medium flex items-center gap-2"
                  data-testid="discount-error-message"
                >
                  <span className="text-sm shrink-0">⚠️</span>
                  <span className="leading-relaxed">{errorMessage}</span>
                </div>
              )}
            </>
          )}
        </form>

        {promotionsList.length > 0 && (
          <div className="w-full flex items-center">
            <div className="flex flex-col w-full">
              <Heading className="txt-medium mb-2 font-semibold text-gray-800 dark:text-zinc-200">
                প্রোমো কোড যুক্ত হয়েছে:
              </Heading>

              {promotionsList.map((promotion) => {
                const isThisRemoving = isRemoveLoading(promotion.code || "")

                return (
                  <div
                    key={promotion.id}
                    className="flex items-center justify-between w-full max-w-full mb-2 bg-emerald-50 dark:bg-emerald-950/40 p-2.5 rounded-xl border border-emerald-200 dark:border-emerald-800"
                    data-testid="discount-row"
                  >
                    <Text className="flex gap-x-1 items-baseline txt-small-plus w-4/5 pr-1 text-emerald-900 dark:text-emerald-200">
                      <span className="truncate flex items-center gap-2" data-testid="discount-code">
                        <Badge
                          color={promotion.is_automatic ? "green" : "grey"}
                          size="small"
                        >
                          {promotion.code}
                        </Badge>{" "}
                        (
                        {promotion.application_method?.value !== undefined &&
                          promotion.application_method.currency_code !==
                            undefined && (
                            <>
                              {promotion.application_method.type ===
                              "percentage"
                                ? `${promotion.application_method.value}%`
                                : convertToLocale({
                                    amount: +promotion.application_method.value,
                                    currency_code:
                                      promotion.application_method
                                        .currency_code,
                                  })}
                            </>
                          )}
                        )
                      </span>
                    </Text>
                    {!promotion.is_automatic && (
                      <div className="shrink-0 flex items-center">
                        {isThisRemoving ? (
                          <div className="flex items-center gap-1.5 text-red-600 dark:text-red-400 font-semibold text-xs px-2 py-1 bg-red-50 dark:bg-red-950/60 rounded-md">
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-red-600 shrink-0" />
                            <span>মুছছে...</span>
                          </div>
                        ) : (
                          <button
                            type="button"
                            className="flex items-center gap-1 text-red-600 hover:text-red-700 dark:text-red-400 px-2 py-1 rounded-md hover:bg-red-100/60 dark:hover:bg-red-950/60 transition-colors disabled:opacity-50 cursor-pointer text-xs font-semibold"
                            disabled={Boolean(removingCode) || isApplyLoading}
                            onClick={() => {
                              if (!promotion.code || removingCode) return
                              removePromotionCode(promotion.code)
                            }}
                            data-testid="remove-discount-button"
                            title="প্রোমো কোড মুছুন"
                          >
                            <Trash size={14} />
                            <span>মুছুন</span>
                            <span className="sr-only">
                              Remove discount code from order
                            </span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default DiscountCode
