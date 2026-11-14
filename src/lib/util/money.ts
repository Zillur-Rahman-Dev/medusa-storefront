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
