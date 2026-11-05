import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { api, setUnauthorizedHandler, tokens } from "@/lib/api"

const EMAIL_KEY = "pft_email"
const NAME_KEY = "pft_name"

interface AuthContextValue {
  isAuthenticated: boolean
  email: string | null
  name: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(tokens.access))
  const [email, setEmail] = useState(() => localStorage.getItem(EMAIL_KEY))
  const [name, setName] = useState(() => localStorage.getItem(NAME_KEY))

  const logout = () => {
    tokens.clear()
    localStorage.removeItem(EMAIL_KEY)
    localStorage.removeItem(NAME_KEY)
    setEmail(null)
    setName(null)
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
      })
      .catch(() => {})
  }, [isAuthenticated])

  const login = async (email: string, password: string) => {
    await api.login(email, password)
    localStorage.setItem(EMAIL_KEY, email)
    setEmail(email)
    setIsAuthenticated(true)
  }

  return (
    <AuthContext.Provider value={{ isAuthenticated, email, name, login, logout }}>
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
