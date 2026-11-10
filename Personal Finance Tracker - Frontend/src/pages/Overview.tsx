import { useCallback, useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  PiggyBankIcon,
  PlusIcon,
  PaperclipIcon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts"
import { EntryFormDialog } from "@/components/EntryFormDialog"
import { ReceiptViewer } from "@/components/ReceiptViewer"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Entry, type EntryInput, type Insights, type Totals } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { formatDate, formatMonth } from "@/lib/format"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

export function Overview() {
  const { name } = useAuth()
  const money = useMoney()
  const [totals, setTotals] = useState<Totals | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [recent, setRecent] = useState<Entry[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [viewingReceipt, setViewingReceipt] = useState<Entry | null>(null)

  const load = useCallback(async () => {
    try {
      const [t, i, r] = await Promise.all([
        api.getTotals(),
        api.getInsights(),
        api.getEntries({ page: 1, limit: 5, sortBy: "date", sortOrder: "DESC" }),
      ])
      setTotals(t)
      setInsights(i)
      setRecent(r.entries)
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to load overview")
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async (values: EntryInput) => {
    const { entry } = await api.createEntry(values)
    toast.success("Entry added")
    return entry.id
  }

  const thisMonth = insights?.monthly.at(-1)
  const savingsRate =
    totals && totals.totalIncome > 0 ? Math.max(0, Math.min(1, totals.balance / totals.totalIncome)) : null

  return (
    <div className="grid gap-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-sm text-muted-foreground">
            {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
            {greeting()}
            {name && <span className="text-brand">, {name}</span>}
          </h1>
        </div>
        <Button onClick={() => setFormOpen(true)}>
          <PlusIcon />
          Add entry
        </Button>
      </div>

      {/* Headline numbers */}
      <section className="grid gap-4 lg:grid-cols-3">
        <div className="relative overflow-hidden rounded-xl bg-hero p-6 text-hero-foreground shadow-sm ring-1 ring-border">
          <div className="pointer-events-none absolute -top-16 -right-16 size-48 rounded-full bg-hero-accent/20 blur-2xl" />
          <p className="text-sm font-medium text-hero-accent">Total balance</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight tabular-nums md:text-5xl">
            {totals ? money.format(totals.balance) : "—"}
          </p>
          <div className="mt-6">
            <div className="flex items-center justify-between text-xs text-hero-foreground/70">
              <span className="inline-flex items-center gap-1.5">
                <PiggyBankIcon className="size-3.5" />
                Savings rate
              </span>
              <span className="font-medium text-hero-foreground tabular-nums">
                {savingsRate === null ? "—" : `${Math.round(savingsRate * 100)}%`}
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-hero-foreground/15">
              <div
                className="h-full rounded-full bg-hero-accent transition-[width] duration-500"
                style={{ width: `${(savingsRate ?? 0) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <StatTile
          label="Total income"
          value={totals?.totalIncome}
          monthValue={thisMonth?.income}
          icon={<ArrowDownLeftIcon className="size-4" />}
          tone="income"
        />
        <StatTile
          label="Total expense"
          value={totals?.totalExpense}
          monthValue={thisMonth?.expense}
          icon={<ArrowUpRightIcon className="size-4" />}
          tone="expense"
        />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Cash flow</CardTitle>
            <CardDescription>Income vs expense, last 12 months</CardDescription>
            <CardAction>
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <LegendItem color="var(--chart-income)" label="Income" />
                <LegendItem color="var(--chart-expense)" label="Expense" />
              </div>
            </CardAction>
          </CardHeader>
          <CardContent>
            <CashFlowChart data={insights?.monthly} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Spending by category</CardTitle>
            <CardDescription>All-time expenses</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBars data={insights?.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent transactions</CardTitle>
          <CardDescription>Your latest five entries</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" nativeButton={false} render={<Link to="/transactions" />}>
              View all
              <ArrowRightIcon />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {recent === null ? (
            <p className="py-6 text-center text-sm text-muted-foreground">Loading…</p>
          ) : recent.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No transactions yet. Add your first entry to get started.
            </p>
          ) : (
            <ul className="divide-y">
              {recent.map((entry) => (
                <li key={entry.id} className="flex items-center gap-3 py-3">
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-full",
                      entry.type === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
                    )}
                  >
                    {entry.type === "income" ? (
                      <ArrowDownLeftIcon className="size-4" />
                    ) : (
                      <ArrowUpRightIcon className="size-4" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 text-sm font-medium">
                      <span className="truncate">{entry.description}</span>
                      {entry.hasReceipt && (
                        <Button
                          variant="ghost"
                          size="icon-xs"
                          aria-label="View receipt"
                          title="View receipt"
                          className="text-muted-foreground"
                          onClick={() => setViewingReceipt(entry)}
                        >
                          <PaperclipIcon />
                        </Button>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {entry.category} · {formatDate(entry.date)}
                    </p>
                  </div>
                  <span
                    className={cn(
                      "text-sm font-semibold tabular-nums",
                      entry.type === "income" ? "text-success" : "text-destructive",
                    )}
                  >
                    {entry.type === "income" ? "+" : "−"}
                    {money.format(Number(entry.amount))}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EntryFormDialog open={formOpen} onOpenChange={setFormOpen} entry={null} onSubmit={handleCreate} onSaved={load} />
      <ReceiptViewer entry={viewingReceipt} onClose={() => setViewingReceipt(null)} />
    </div>
  )
}

function StatTile({
  label,
  value,
  monthValue,
  icon,
  tone,
}: {
  label: string
  value?: number
  monthValue?: number
  icon: React.ReactNode
  tone: "income" | "expense"
}) {
  const money = useMoney()
  return (
    <Card>
      <CardHeader>
        <CardDescription>{label}</CardDescription>
        <CardAction>
          <div
            className={cn(
              "flex size-9 items-center justify-center rounded-full",
              tone === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
            )}
          >
            {icon}
          </div>
        </CardAction>
        <CardTitle className="text-3xl font-semibold tracking-tight tabular-nums">
          {value === undefined ? "—" : money.format(value)}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-auto">
        <p className="text-xs text-muted-foreground">
          This month{" "}
          <span className="font-medium text-foreground tabular-nums">
            {monthValue === undefined ? "—" : money.format(monthValue)}
          </span>
        </p>
      </CardContent>
    </Card>
  )
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="size-2.5 rounded-sm" style={{ background: color }} />
      {label}
    </span>
  )
}

function CashFlowTooltip({ active, payload, label }: TooltipContentProps) {
  const money = useMoney()
  if (!active || !payload?.length) return null
  const income = Number(payload.find((p) => p.dataKey === "income")?.value ?? 0)
  const expense = Number(payload.find((p) => p.dataKey === "expense")?.value ?? 0)
  const net = income - expense
  return (
    <div className="min-w-44 rounded-lg border bg-popover p-3 text-xs shadow-md">
      <p className="mb-2 font-medium text-foreground">{formatMonth(String(label))}</p>
      <div className="grid gap-1.5">
        <TooltipRow color="var(--chart-income)" label="Income" value={money.format(income)} />
        <TooltipRow color="var(--chart-expense)" label="Expense" value={money.format(expense)} />
        <div className="mt-1 flex justify-between border-t pt-1.5">
          <span className="text-muted-foreground">Net</span>
          <span className="font-medium text-foreground tabular-nums">{money.format(net)}</span>
        </div>
      </div>
    </div>
  )
}

function TooltipRow({ color, label, value }: { color: string; label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
        <span className="size-2 rounded-sm" style={{ background: color }} />
        {label}
      </span>
      <span className="font-medium text-foreground tabular-nums">{value}</span>
    </div>
  )
}

function CashFlowChart({ data }: { data?: Insights["monthly"] }) {
  const money = useMoney()
  if (!data) return <div className="h-64 animate-pulse rounded-lg bg-muted" />
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">
        No transactions in the last 12 months.
      </div>
    )
  }
  return (
    <div className="h-64" role="img" aria-label="Bar chart of monthly income and expense for the last 12 months">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={2} barCategoryGap="24%" margin={{ top: 8, right: 4, bottom: 0, left: 0 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="month"
            tickFormatter={formatMonth}
            tickLine={false}
            axisLine={false}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
            interval="preserveStartEnd"
            minTickGap={8}
          />
          <YAxis
            tickFormatter={(v: number) => money.formatCompact(v)}
            tickLine={false}
            axisLine={false}
            width={56}
            tick={{ fill: "var(--muted-foreground)", fontSize: 12 }}
          />
          <Tooltip content={(props) => <CashFlowTooltip {...props} />} cursor={{ fill: "var(--muted)" }} />
          <Bar dataKey="income" name="Income" fill="var(--chart-income)" radius={[4, 4, 0, 0]} maxBarSize={16} />
          <Bar dataKey="expense" name="Expense" fill="var(--chart-expense)" radius={[4, 4, 0, 0]} maxBarSize={16} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

const MAX_CATEGORIES = 5

function CategoryBars({ data }: { data?: Insights["categories"] }) {
  const money = useMoney()
  if (!data) return <div className="h-64 animate-pulse rounded-lg bg-muted" />
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-muted-foreground">No expenses yet.</div>
    )
  }

  // Fold the long tail into "Other" so the list stays short
  const top = data.slice(0, MAX_CATEGORIES)
  const rest = data.slice(MAX_CATEGORIES).reduce((sum, c) => sum + c.total, 0)
  const rows = rest > 0 ? [...top, { category: "Other", total: rest }] : top
  const total = data.reduce((sum, c) => sum + c.total, 0)
  const max = Math.max(...rows.map((r) => r.total))

  return (
    <ul className="grid gap-4">
      {rows.map((row) => (
        <li key={row.category} title={`${row.category}: ${money.format(row.total)}`}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="truncate font-medium">{row.category}</span>
            <span className="shrink-0 tabular-nums">
              {money.format(row.total)}
              <span className="ml-1.5 text-xs text-muted-foreground">{Math.round((row.total / total) * 100)}%</span>
            </span>
          </div>
          <div className="mt-1.5 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-[var(--chart-category)]"
              style={{ width: `${(row.total / max) * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  )
}
