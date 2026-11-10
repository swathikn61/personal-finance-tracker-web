import type { ReactNode } from "react"
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom"
import { Toaster } from "@/components/ui/sonner"
import { AppLayout } from "@/components/AppLayout"
import { AuthProvider, useAuth } from "@/lib/auth"
import { ThemeProvider, useTheme } from "@/lib/theme"
import { AuthPage } from "@/pages/AuthPage"
import { Overview } from "@/pages/Overview"
import { Settings } from "@/pages/Settings"
import { Transactions } from "@/pages/Transactions"

function RequireAuth({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? children : <Navigate to="/login" replace />
}

function GuestOnly({ children }: { children: ReactNode }) {
  const { isAuthenticated } = useAuth()
  return isAuthenticated ? <Navigate to="/" replace /> : children
}

function ThemedToaster() {
  const { resolved } = useTheme()
  return <Toaster theme={resolved} richColors position="top-right" />
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<RequireAuth><AppLayout /></RequireAuth>}>
              <Route path="/" element={<Overview />} />
              <Route path="/transactions" element={<Transactions />} />
              <Route path="/settings" element={<Settings />} />
            </Route>
            <Route path="/login" element={<GuestOnly><AuthPage key="login" mode="login" /></GuestOnly>} />
            <Route path="/register" element={<GuestOnly><AuthPage key="register" mode="register" /></GuestOnly>} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
        <ThemedToaster />
      </AuthProvider>
    </ThemeProvider>
  )
}
