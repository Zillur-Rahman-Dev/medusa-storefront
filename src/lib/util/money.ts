import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount?: number | null | undefined
  currency_code?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

const bnDigits: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
}

/**
 * Enterprise Dual-Mode Price Formatter with comma grouping
 * - bn: 1350 -> "৳১,৩৫০"
 * - en: 1350 -> "৳1,350"
 */
export function formatPrice(
  amount: number | null | undefined,
  locale: "bn" | "en" = "bn"
): string {
  const num =
    typeof amount === "number" && !isNaN(amount) ? amount : Number(amount) || 0
  const rounded = Math.round(num)
  const enFormatted = rounded.toLocaleString("en-US")

  if (locale === "en") {
    return `৳${enFormatted}`
  }

  const bnFormatted = enFormatted.replace(/\d/g, (d) => bnDigits[d] || d)
  return `৳${bnFormatted}`
}

/**
 * Enterprise Dual-Mode Weight / Size Formatter
 * - bn: "500gm" -> "৫০০ গ্রাম", "1kg" -> "১ কেজি"
 * - en: "500gm" -> "500 gm", "1kg" -> "1 kg"
 */
export function formatSize(
  sizeStr: string = "",
  locale: "bn" | "en" = "bn"
): string {
  if (!sizeStr) return ""

  if (locale === "en") {
    return sizeStr
      .replace(/kg/gi, " kg")
      .replace(/\b(gm|g)\b/gi, " gm")
      .replace(/\s+/g, " ")
      .trim()
  }

  let converted = sizeStr.replace(/\d/g, (d) => bnDigits[d] || d)
  converted = converted
    .replace(/kg/gi, " কেজি")
    .replace(/\b(gm|g)\b/gi, " গ্রাম")
    .replace(/\s+/g, " ")
    .trim()
  return converted
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "bn",
}: ConvertToLocaleParams) => {
  const code = (currency_code || "bdt").toLowerCase()

  // Format BDT with Taka symbol ৳ and proper comma separation
  if (code === "bdt" || code === "eur" || !currency_code) {
    const isEn = locale === "en" || locale === "en-US"
    return formatPrice(amount, isEn ? "en" : "bn")
  }

  const num =
    typeof amount === "number" && !isNaN(amount) ? amount : Number(amount) || 0

  return !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(num)
    : formatPrice(amount, locale === "en" ? "en" : "bn")
}

export type ItemDiscountInfo = {
  hasDiscount: boolean
  discountRate: number
  badgeText: string
  discountedUnitPrice: number
  discountedTotalPrice: number
}

/**
 * Enterprise Per-Item Promo Discount Calculator
 * Computes direct line discounts, coupon/promo percentage, or proportional cart discounts.
 */
export function getItemDiscountInfo(
  unitPrice: number,
  quantity: number,
  promotions: any[] = [],
  discountTotal: number = 0,
  subtotal: number = 0,
  rawItem?: any
): ItemDiscountInfo {
  const activePromos = promotions || []
  const originalItemTotal = unitPrice * quantity

  // 1. Calculate actual direct discount on this line item
  const rawAdjustmentsTotal = rawItem?.adjustments?.reduce(
    (acc: number, adj: any) => acc + (Number(adj.amount) || 0),
    0
  )
  const itemTotal =
    typeof rawItem?.total === "number" && rawItem.total > 0
      ? rawItem.total
      : null

  let directDiscount = 0
  if (typeof rawItem?.discount_total === "number" && rawItem.discount_total > 0) {
    directDiscount = rawItem.discount_total
  } else if (rawAdjustmentsTotal > 0) {
    directDiscount = rawAdjustmentsTotal
  } else if (itemTotal !== null && itemTotal < originalItemTotal) {
    directDiscount = originalItemTotal - itemTotal
  } else if (discountTotal > 0 && subtotal > 0 && originalItemTotal > 0) {
    // Proportional cart-level discount
    directDiscount = Math.round((originalItemTotal / subtotal) * discountTotal)
  }

  // 2. Identify promo details (percentage or fixed)
  const pctPromo = activePromos.find(
    (p: any) =>
      p?.application_method?.type === "percentage" &&
      typeof p?.application_method?.value === "number" &&
      p?.application_method?.value > 0
  )

  const fixedPromo = activePromos.find(
    (p: any) =>
      p?.application_method?.type === "fixed" &&
      typeof p?.application_method?.value === "number" &&
      p?.application_method?.value > 0
  )

  let discountRate = 0
  let badgeText = ""

  if (directDiscount > 0 && originalItemTotal > 0) {
    discountRate = Math.min(1, directDiscount / originalItemTotal)
    const pct = Math.round(discountRate * 100)
    if (pctPromo) {
      const pVal = Number(pctPromo.application_method.value)
      badgeText = `${formatSize(String(pVal))}% ছাড়`
    } else if (pct > 0) {
      badgeText = `${formatSize(String(pct))}% ছাড়`
    } else {
      badgeText = `${formatPrice(directDiscount)} ছাড়`
    }
  } else if (pctPromo) {
    const pct = Number(pctPromo.application_method.value)
    discountRate = pct / 100
    badgeText = `${formatSize(String(pct))}% ছাড়`
  } else if (fixedPromo && unitPrice > 0) {
    const amount = Number(fixedPromo.application_method.value)
    discountRate = Math.min(1, amount / unitPrice)
    badgeText = `${formatPrice(amount)} ছাড়`
  }

  const hasDiscount = discountRate > 0 && (directDiscount > 0 || pctPromo || fixedPromo)

  const discountedTotalPrice =
    itemTotal !== null && itemTotal < originalItemTotal
      ? itemTotal
      : hasDiscount
      ? Math.max(0, Math.round(originalItemTotal * (1 - discountRate)))
      : originalItemTotal

  const discountedUnitPrice =
    hasDiscount && quantity > 0
      ? Math.max(0, Math.round(discountedTotalPrice / quantity))
      : unitPrice

  return {
    hasDiscount: Boolean(hasDiscount && discountedUnitPrice < unitPrice),
    discountRate,
    badgeText,
    discountedUnitPrice,
    discountedTotalPrice,
  }
}

