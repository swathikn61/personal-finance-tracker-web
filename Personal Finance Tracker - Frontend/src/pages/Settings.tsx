import { useState } from "react"
import { toast } from "sonner"
import { MonitorIcon, MoonIcon, SunIcon } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/lib/auth"
import { CURRENCIES, currencySymbol, useMoney } from "@/lib/money"
import { useTheme, type ThemePreference } from "@/lib/theme"
import { cn } from "@/lib/utils"

const themeOptions: { value: ThemePreference; label: string; icon: typeof SunIcon }[] = [
  { value: "light", label: "Light", icon: SunIcon },
  { value: "dark", label: "Dark", icon: MoonIcon },
  { value: "system", label: "System", icon: MonitorIcon },
]

const currencyItems = CURRENCIES.map((c) => ({
  value: c.code,
  label: `${currencySymbol(c.code, c.locale)}  ${c.code} · ${c.label}`,
}))

export function Settings() {
  const { preference, setPreference } = useTheme()
  const { currency, setCurrency } = useAuth()
  const money = useMoney()
  const [saving, setSaving] = useState(false)

  const changeCurrency = async (code: string) => {
    if (code === currency) return
    setSaving(true)
    try {
      await setCurrency(code)
      toast.success(`Currency set to ${code}`)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to update currency")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">Settings</h1>
        <p className="mt-1 text-sm text-muted-foreground">Personalise how Spend Journal looks.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appearance</CardTitle>
          <CardDescription>Choose a theme, or follow your device setting.</CardDescription>
        </CardHeader>
        <CardContent>
          <div role="radiogroup" aria-label="Theme" className="grid max-w-md grid-cols-3 gap-2">
            {themeOptions.map(({ value, label, icon: Icon }) => {
              const selected = preference === value
              return (
                <button
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => setPreference(value)}
                  className={cn(
                    "flex flex-col items-center gap-2 rounded-lg border px-3 py-4 text-sm font-medium transition-colors outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
                    selected ? "border-brand bg-accent text-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )}
                >
                  <Icon className={cn("size-5", selected && "text-brand")} />
                  {label}
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Currency</CardTitle>
          <CardDescription>
            Changes how amounts are displayed across your account. Existing amounts are not converted.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid max-w-md gap-2">
          <Label>Display currency</Label>
          <Select
            items={currencyItems}
            value={currency}
            disabled={saving}
            onValueChange={(value) => value && changeCurrency(value as string)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {currencyItems.map((item) => (
                <SelectItem key={item.value} value={item.value}>
                  {item.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Example: <span className="font-medium text-foreground tabular-nums">{money.format(1234.5)}</span>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
