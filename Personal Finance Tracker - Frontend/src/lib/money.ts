import { useMemo } from "react"
import { useAuth } from "@/lib/auth"

// Keep in sync with SUPPORTED_CURRENCIES in the backend AuthController
export const CURRENCIES = [
  { code: "INR", label: "Indian Rupee", locale: "en-IN" },
  { code: "USD", label: "US Dollar", locale: "en-US" },
  { code: "EUR", label: "Euro", locale: "de-DE" },
  { code: "GBP", label: "British Pound", locale: "en-GB" },
  { code: "JPY", label: "Japanese Yen", locale: "ja-JP" },
  { code: "AUD", label: "Australian Dollar", locale: "en-AU" },
  { code: "CAD", label: "Canadian Dollar", locale: "en-CA" },
  { code: "SGD", label: "Singapore Dollar", locale: "en-SG" },
  { code: "AED", label: "UAE Dirham", locale: "en-AE" },
] as const

export const currencySymbol = (code: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? code

// Formatters for the signed-in user's currency, using that currency's usual number grouping
export function useMoney() {
  const { currency } = useAuth()
  return useMemo(() => {
    const locale = CURRENCIES.find((c) => c.code === currency)?.locale ?? "en-US"
    const full = new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol" })
    const compact = new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      currencyDisplay: "narrowSymbol",
      notation: "compact",
      maximumFractionDigits: 1,
    })
    return {
      code: currency,
      symbol: currencySymbol(currency, locale),
      format: (value: number) => full.format(value),
      formatCompact: (value: number) => compact.format(value),
    }
  }, [currency])
}
