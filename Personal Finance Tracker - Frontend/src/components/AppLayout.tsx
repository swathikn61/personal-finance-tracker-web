import { NavLink, Outlet } from "react-router-dom"
import { LayoutDashboardIcon, LogOutIcon, ReceiptTextIcon, SettingsIcon } from "lucide-react"
import { Logo } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth"
import { cn } from "@/lib/utils"

const navItems = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboardIcon, end: true },
  { to: "/transactions", label: "Transactions", icon: ReceiptTextIcon, end: false },
  { to: "/settings", label: "Settings", icon: SettingsIcon, end: false },
]

function Brand() {
  return <Logo />
}

export function AppLayout() {
  const { email, name, logout } = useAuth()
  const initial = (name || email)?.[0]?.toUpperCase() ?? "?"

  return (
    <div className="min-h-svh bg-background md:grid md:grid-cols-[240px_1fr]">
      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-svh flex-col border-r bg-card px-4 py-5 md:flex">
        <div className="flex items-center justify-between gap-2">
          <Brand />
          <ThemeToggle />
        </div>
        <nav className="mt-8 grid gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground",
                  isActive && "bg-accent text-foreground",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon className={cn("size-4", isActive && "text-brand")} />
                  {label}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto flex items-center gap-3 rounded-lg border bg-background p-2.5">
          <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
            {initial}
          </div>
          <div className="min-w-0 flex-1 leading-tight">
            {name && <p className="truncate text-sm font-medium">{name}</p>}
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Logout" onClick={logout}>
            <LogOutIcon />
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-10 border-b bg-card md:hidden">
        <div className="flex h-14 items-center justify-between px-4">
          <Brand />
          <div className="flex items-center gap-1">
            <ThemeToggle />
            <Button variant="ghost" size="icon-sm" aria-label="Logout" onClick={logout}>
              <LogOutIcon />
            </Button>
          </div>
        </div>
        <nav className="flex gap-1 px-4 pb-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-medium text-muted-foreground",
                  isActive && "bg-accent text-foreground",
                )
              }
            >
              <Icon className="size-4" />
              {label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="min-w-0">
        <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
