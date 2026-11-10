import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, setUnauthorizedHandler, tokens } from "@/lib/api"
import { DEFAULT_CURRENCY, isSupportedCurrency } from "@/lib/currencies"

const EMAIL_KEY = "pft_email"
const NAME_KEY = "pft_name"
const CURRENCY_KEY = "pft_currency"

interface AuthContextValue {
  isAuthenticated: boolean
  email: string | null
  name: string | null
  currency: string
  setCurrency: (currency: string) => Promise<void>
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokens.access))
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY))
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY))
  const [currency, setCurrencyState] = useState(() => {
    const stored = localStorage.getItem(CURRENCY_KEY)
    return isSupportedCurrency(stored) ? stored : DEFAULT_CURRENCY
  })

  // Ignore missing or unknown codes, e.g. from an older API that doesn't send currency yet
  const applyCurrency = (code: unknown) => {
    if (!isSupportedCurrency(code)) return
    localStorage.setItem(CURRENCY_KEY, code)
    setCurrencyState(code)
  }

  const logout = () => {
    tokens.clear()
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(NAME_KEY)
    localStorage.removeItem(CURRENCY_KEY)
    setEmail(null)
    setName(null)
    setCurrencyState(DEFAULT_CURRENCY)
    setIsAuthenticated(false)
  }

  useEffect(() => {
    setUnauthorizedHandler(logout)
  }, [])

  // Refresh the profile whenever a session starts (login or a saved token on reload)
  useEffect(() => {
    if (!isAuthenticated) return
    api
      .me()
      .then((user) => {
        localStorage.setItem(NAME_KEY, user.name)
        localStorage.setItem(EMAIL_KEY, user.email)
        setName(user.name)
        setEmail(user.email)
        applyCurrency(user.currency)
      })
      .catch(() => {})
  }, [isAuthenticated])

  const setCurrency = async (code: string) => {
    const user = await api.updateMe({ currency: code })
    applyCurrency(user.currency)
  }

  const login = async (email: string, password: string) => {
    await api.login(email, password)
    localStorage.setItem(EMAIL_KEY, email)
    setEmail(email)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, name, currency, setCurrency, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider")
  return ctx
}
