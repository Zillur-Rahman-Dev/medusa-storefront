import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount?: number | null | undefined
  currency_code?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  locale?: string
}

export const convertToLocale = ({
  amount,
  currency_code,
  minimumFractionDigits,
  maximumFractionDigits,
  locale = "bn-BD",
}: ConvertToLocaleParams) => {
  const num = typeof amount === "number" && !isNaN(amount) ? amount : Number(amount) || 0
  const code = (currency_code || "bdt").toLowerCase()

  // Format BDT with Taka symbol ৳
  if (code === "bdt" || code === "eur") {
    return `৳${Math.round(num)}`
  }

  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(num)
    : `৳${Math.round(num)}`
}
