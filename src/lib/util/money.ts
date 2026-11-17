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

  // Check if ALL active promotions are order-level or shipping-level
  // (e.g. "Amount off order", "Percentage off order", "Free shipping")
  // If so, individual product cards MUST NOT display promo tags or slashed prices!
  const hasOnlyOrderPromos =
    activePromos.length > 0 &&
    activePromos.every(
      (p: any) =>
        p?.application_method?.target_type === "order" ||
        p?.application_method?.target_type === "shipping"
    )

  // Find product-specific promotions (target_type === "items")
  const productPromos = activePromos.filter(
    (p: any) => p?.application_method?.target_type === "items"
  )

  let discountRate = 0
  let badgeText = ""

  // Only calculate per-item discount if there are product-level promotions or specific adjustments
  if (!hasOnlyOrderPromos && activePromos.length > 0) {
    // 1. Direct adjustments on this item from Medusa
    const rawAdjustmentsTotal = rawItem?.adjustments?.reduce(
      (acc: number, adj: any) => acc + (Number(adj.amount) || 0),
      0
    )
    const directDiscount =
      typeof rawItem?.discount_total === "number" && rawItem.discount_total > 0
        ? rawItem.discount_total
        : rawAdjustmentsTotal > 0
        ? rawAdjustmentsTotal
        : 0

    // 2. Percentage promo on product
    const pctPromo = productPromos.find(
      (p: any) =>
        p?.application_method?.type === "percentage" &&
        typeof p?.application_method?.value === "number" &&
        p?.application_method?.value > 0
    )

    // 3. Fixed amount promo on product
    const fixedPromo = productPromos.find(
      (p: any) =>
        p?.application_method?.type === "fixed" &&
        typeof p?.application_method?.value === "number" &&
        p?.application_method?.value > 0
    )

    if (pctPromo) {
      const pct = Number(pctPromo.application_method.value)
      discountRate = pct / 100
      badgeText = `${formatSize(String(pct))}% ছাড়`
    } else if (fixedPromo) {
      const amount = Number(fixedPromo.application_method.value)
      if (unitPrice > 0) {
        discountRate = Math.min(1, amount / unitPrice)
        badgeText = `${formatPrice(amount)} ছাড়`
      }
    } else if (directDiscount > 0 && unitPrice * quantity > 0 && productPromos.length > 0) {
      discountRate = directDiscount / (unitPrice * quantity)
      const pct = Math.round(discountRate * 100)
      badgeText = pct > 0 ? `${formatSize(String(pct))}% ছাড়` : `ছাড়`
    }
  }

  const hasDiscount = discountRate > 0
  const discountedUnitPrice = hasDiscount
    ? Math.max(0, Math.round(unitPrice * (1 - discountRate)))
    : unitPrice
  const discountedTotalPrice = discountedUnitPrice * quantity

  return {
    hasDiscount,
    discountRate,
    badgeText,
    discountedUnitPrice,
    discountedTotalPrice,
  }
}

