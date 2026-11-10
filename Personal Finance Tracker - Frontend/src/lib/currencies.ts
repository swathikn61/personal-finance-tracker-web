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

export const DEFAULT_CURRENCY = "INR"

export const isSupportedCurrency = (code: unknown): code is string =>
  typeof code === "string" && CURRENCIES.some((c) => c.code === code)
