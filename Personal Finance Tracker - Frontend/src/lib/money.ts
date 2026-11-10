import { useMemo } from "react"
import { useAuth } from "@/lib/auth"
import { CURRENCIES, DEFAULT_CURRENCY, isSupportedCurrency } from "@/lib/currencies"

export { CURRENCIES }

export const currencySymbol = (code: string, locale = "en") =>
  new Intl.NumberFormat(locale, { style: "currency", currency: code, currencyDisplay: "narrowSymbol" })
    .formatToParts(0)
    .find((p) => p.type === "currency")?.value ?? code

// Formatters for the signed-in user's currency, using that currency's usual number grouping
export function useMoney() {
  const { currency: saved } = useAuth()
  // Never let a bad value reach Intl.NumberFormat, which throws on unknown codes
  const currency = isSupportedCurrency(saved) ? saved : DEFAULT_CURRENCY
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
