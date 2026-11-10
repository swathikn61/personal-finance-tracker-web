import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react"

export type ThemePreference = "light" | "dark" | "system"

// Keep in sync with the inline script in index.html that applies the theme before first paint
const STORAGE_KEY = "sj_theme"

interface ThemeContextValue {
  preference: ThemePreference
  resolved: "light" | "dark"
  setPreference: (preference: ThemePreference) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

const systemPrefersDark = () => window.matchMedia("(prefers-color-scheme: dark)").matches

function readPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored === "light" || stored === "dark" || stored === "system") return stored
  } catch {
    // Storage can be unavailable (private mode); fall back to the system setting
  }
  return "system"
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [preference, setPreferenceState] = useState<ThemePreference>(readPreference)
  const [systemDark, setSystemDark] = useState(systemPrefersDark)

  useEffect(() => {
    const media = window.matchMedia("(prefers-color-scheme: dark)")
    const onChange = () => setSystemDark(media.matches)
    media.addEventListener("change", onChange)
    return () => media.removeEventListener("change", onChange)
  }, [])

  const resolved = preference === "system" ? (systemDark ? "dark" : "light") : preference

  const firstApply = useRef(true)
  useEffect(() => {
    const root = document.documentElement
    // Fade colours on real theme changes, but not on first load
    if (!firstApply.current) {
      root.classList.add("theme-switching")
      window.setTimeout(() => root.classList.remove("theme-switching"), 400)
    }
    firstApply.current = false
    root.classList.toggle("dark", resolved === "dark")
  }, [resolved])

  const setPreference = (next: ThemePreference) => {
    setPreferenceState(next)
    try {
      localStorage.setItem(STORAGE_KEY, next)
    } catch {
      // Ignore: the choice still applies for this visit
    }
  }

  return <ThemeContext.Provider value={{ preference, resolved, setPreference }}>{children}</ThemeContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside ThemeProvider")
  return ctx
}
