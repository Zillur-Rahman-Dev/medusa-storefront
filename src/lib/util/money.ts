import { isEmpty } from "./isEmpty"

type ConvertToLocaleParams = {
  amount: number
  currency_code: string
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
  const code = (currency_code || "bdt").toLowerCase()
  // Format BDT with Taka symbol ৳
  if (code === "bdt" || code === "eur") {
    return `৳${Math.round(amount)}`
  }

  return currency_code && !isEmpty(currency_code)
    ? new Intl.NumberFormat(locale, {
        style: "currency",
        currency: currency_code,
        minimumFractionDigits,
        maximumFractionDigits,
      }).format(amount)
    : `৳${Math.round(amount)}`
}
