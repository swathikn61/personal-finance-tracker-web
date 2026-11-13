import { useCallback, useEffect, useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import { toast } from "sonner"
import {
  ArrowDownLeftIcon,
  ArrowDownRightIcon,
  ArrowRightIcon,
  ArrowUpRightIcon,
  BriefcaseIcon,
  CarIcon,
  FilmIcon,
  GiftIcon,
  HeartPulseIcon,
  HomeIcon,
  MinusIcon,
  LaptopIcon,
  PaperclipIcon,
  PlusIcon,
  ReceiptIcon,
  ShoppingBagIcon,
  UtensilsIcon,
  ZapIcon,
  type LucideIcon,
} from "lucide-react"
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps } from "recharts"
import { EntryFormDialog } from "@/components/EntryFormDialog"
import { ReceiptViewer } from "@/components/ReceiptViewer"
import { Button } from "@/components/ui/button"
import { Card, CardAction, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { api, type Entry, type EntryInput, type EntryType, type Insights, type Totals } from "@/lib/api"
import { useAuth } from "@/lib/auth"
import { formatDate, formatMonth } from "@/lib/format"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

type Month = Insights["monthly"][number]

const greeting = () => {
  const h = new Date().getHours()
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening"
}

// "Today" / "Yesterday" for recent entries, otherwise the short date
function relativeDay(iso: string) {
  const day = new Date(`${iso}T00:00:00`).getTime()
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const diff = Math.round((today.getTime() - day) / 86_400_000)
  return diff === 0 ? "Today" : diff === 1 ? "Yesterday" : formatDate(iso)
}

// Categories are free text, so match on keywords and fall back to a receipt
const CATEGORY_ICONS: [RegExp, LucideIcon][] = [
  [/food|grocer|dining|restaurant|cafe|coffee|meal/, UtensilsIcon],
  [/transport|travel|cab|taxi|fuel|metro|car|bus/, CarIcon],
  [/salary|pay|wage|bonus/, BriefcaseIcon],
  [/freelance|side|contract/, LaptopIcon],
  [/util|electric|water|bill|internet|phone/, ZapIcon],
  [/entertain|movie|film|music|game/, FilmIcon],
  [/shop|cloth|amazon/, ShoppingBagIcon],
  [/health|medic|doctor|gym|pharma/, HeartPulseIcon],
  [/rent|home|house/, HomeIcon],
  [/gift/, GiftIcon],
]
const categoryIcon = (category: string) =>
  CATEGORY_ICONS.find(([re]) => re.test(category.toLowerCase()))?.[1] ?? ReceiptIcon

// Percent change between two months; null when there is nothing to compare against
function change(current?: number, previous?: number) {
  if (current === undefined || previous === undefined || previous === 0) return null
  return Math.round(((current - previous) / previous) * 100)
}

export function Overview() {
  const { name } = useAuth()
  const [totals, setTotals] = useState<Totals | null>(null)
  const [insights, setInsights] = useState<Insights | null>(null)
  const [recent, setRecent] = useState<Entry[] | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [formType, setFormType] = useState<EntryType>("expense")
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

  const monthly = insights?.monthly
  const thisMonth = monthly?.at(-1)
  const lastMonth = monthly?.at(-2)
  const savingsRate =
    totals && totals.totalIncome > 0 ? Math.max(0, Math.min(1, totals.balance / totals.totalIncome)) : null
  const hasAny = totals ? totals.totalIncome + totals.totalExpense > 0 : null
  const mood = moodOf(thisMonth, hasAny)

  const openForm = (type: EntryType) => {
    setFormType(type)
    setFormOpen(true)
  }

  return (
    <div className="grid gap-6">
      {/* Greeting, a one-line read of the month, and the two everyday actions */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <Sprout mood={mood} className="hidden size-16 shrink-0 sm:block" />
          <div className="min-w-0 max-w-2xl">
            <p className="text-sm text-muted-foreground">
              {new Date().toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long" })}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight md:text-3xl">
              {greeting()}
              {name && <span className="text-brand">, {name}</span>}
            </h1>
            <MonthSummary month={thisMonth} hasAny={hasAny} mood={mood} />
          </div>
        </div>
        <div className="flex w-full gap-2 sm:w-auto">
          <Button size="lg" className="flex-1 rounded-full px-5 sm:flex-none" onClick={() => openForm("expense")}>
            <MinusIcon />
            Add expense
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="flex-1 rounded-full border-transparent bg-mint px-5 text-mint-foreground hover:bg-mint/70 hover:text-mint-foreground sm:flex-none dark:bg-mint dark:hover:bg-mint/70"
            onClick={() => openForm("income")}
          >
            <PlusIcon />
            Add income
          </Button>
        </div>
      </div>

      {/* Headline numbers */}
      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-12">
        <BalanceCard totals={totals} savingsRate={savingsRate} monthly={monthly} className="md:col-span-2 lg:col-span-6" />
        <StatTile
          className="lg:col-span-3"
          label="Income"
          tone="income"
          total={totals?.totalIncome}
          series={monthly?.slice(-6).map((m) => ({ month: m.month, value: m.income }))}
          delta={change(thisMonth?.income, lastMonth?.income)}
        />
        <StatTile
          className="lg:col-span-3"
          label="Spending"
          tone="expense"
          total={totals?.totalExpense}
          series={monthly?.slice(-6).map((m) => ({ month: m.month, value: m.expense }))}
          delta={change(thisMonth?.expense, lastMonth?.expense)}
        />
      </section>

      {/* Charts */}
      <section className="grid gap-4 lg:grid-cols-12">
        <CashFlowCard data={monthly} className="lg:col-span-8" />
        {/* On phones this comes before the chart: "where does my money go" is the quicker question */}
        <Card className="order-first lg:order-none lg:col-span-4">
          <CardHeader>
            <CardTitle>Where it goes</CardTitle>
            <CardDescription>All-time spending by category</CardDescription>
          </CardHeader>
          <CardContent>
            <CategoryBreakdown data={insights?.categories} />
          </CardContent>
        </Card>
      </section>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent activity</CardTitle>
          <CardDescription>Your latest five entries</CardDescription>
          <CardAction>
            <Button variant="ghost" size="sm" className="group" nativeButton={false} render={<Link to="/transactions" />}>
              View all
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </CardAction>
        </CardHeader>
        <CardContent>
          {recent === null ? (
            <div className="grid gap-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-14 animate-pulse rounded-xl bg-muted" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <EmptyState onAdd={() => openForm("expense")} />
          ) : (
            <ul className="-mx-3 grid">
              {recent.map((entry) => (
                <RecentRow key={entry.id} entry={entry} onViewReceipt={() => setViewingReceipt(entry)} />
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <EntryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        entry={null}
        defaultType={formType}
        onSubmit={handleCreate}
        onSaved={load}
      />
      <ReceiptViewer entry={viewingReceipt} onClose={() => setViewingReceipt(null)} />
    </div>
  )
}

/* ---------- Header summary ---------- */

type Mood = "fresh" | "thriving" | "steady" | "careful"

// How this month is going, from the share of income kept
function moodOf(month: Month | undefined, hasAny: boolean | null): Mood {
  if (!month || !hasAny || (month.income === 0 && month.expense === 0)) return "fresh"
  if (month.income === 0) return "careful"
  const kept = (month.income - month.expense) / month.income
  return kept >= 0.5 ? "thriving" : kept >= 0.15 ? "steady" : "careful"
}

const MOTTOS: Record<Mood, string> = {
  fresh: "A fresh page. Log an entry and watch your journal grow.",
  thriving: "You're keeping more than half of what comes in. Lovely work.",
  steady: "Steady progress. Small savings add up.",
  careful: "Spending is running ahead this month. See where it goes below.",
}

function MonthSummary({ month, hasAny, mood }: { month?: Month; hasAny: boolean | null; mood: Mood }) {
  const money = useMoney()
  if (!month || hasAny === null) return <div className="mt-2 h-5 w-72 animate-pulse rounded bg-muted" />
  const strong = (v: ReactNode) => <span className="font-medium text-foreground">{v}</span>
  let text: ReactNode
  if (!hasAny) text = "Your journal is empty. Add your first entry to see your money take shape."
  else if (month.income === 0 && month.expense === 0) text = "Nothing logged this month yet."
  else if (month.income > 0) {
    const kept = Math.max(0, Math.round(((month.income - month.expense) / month.income) * 100))
    text = (
      <>
        This month you've spent {strong(money.format(month.expense))} and kept {strong(`${kept}%`)} of what came in.
      </>
    )
  } else text = <>This month you've spent {strong(money.format(month.expense))} so far.</>
  return (
    <>
      <p className="mt-2 text-sm text-pretty text-muted-foreground md:text-base">{text}</p>
      {hasAny && <p className="mt-1 text-sm font-medium text-brand">{MOTTOS[mood]}</p>}
    </>
  )
}

// A small potted sprout that grows a leaf for each step up in how the month is going
function Sprout({ mood, className }: { mood: Mood; className?: string }) {
  const leaves = { fresh: 1, careful: 1, steady: 2, thriving: 3 }[mood]
  const leaf = "M0 0 C-3 -7 -10 -9 -14 -7 C-12 -1 -6 2 0 0Z"
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true">
      <circle cx="32" cy="32" r="31" fill="var(--mint)" />
      <g className="origin-[32px_40px] animate-sway">
        <path d="M32 41 C32 34 32 28 32 19" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" />
        <path d={leaf} transform="translate(32 33)" fill="var(--brand-soft)" />
        {leaves >= 2 && <path d={leaf} transform="translate(32 27) scale(-1 1)" fill="var(--brand-soft)" />}
        {leaves >= 3 && <path d={leaf} transform="translate(32 21) rotate(35) scale(0.8)" fill="var(--brand-soft)" />}
        <circle cx="32" cy="18" r="2.5" fill="var(--brand)" />
      </g>
      <path d="M21 41 H43 L40 54 H24 Z" fill="var(--blush)" stroke="var(--blush-foreground)" strokeOpacity="0.35" strokeWidth="1.2" strokeLinejoin="round" />
      <rect x="19" y="38" width="26" height="5" rx="2.5" fill="var(--blush)" stroke="var(--blush-foreground)" strokeOpacity="0.35" strokeWidth="1.2" />
    </svg>
  )
}

/* ---------- Balance card ---------- */

function BalanceCard({
  totals,
  savingsRate,
  monthly,
  className,
}: {
  totals: Totals | null
  savingsRate: number | null
  monthly?: Month[]
  className?: string
}) {
  const money = useMoney()
  const net = monthly?.slice(-6).map((m) => m.income - m.expense)
  const thisNet = net?.at(-1)
  return (
    <div className={cn("relative isolate overflow-hidden rounded-2xl bg-hero p-6 text-hero-foreground shadow-elevated ring-1 ring-border sm:p-7", className)}>
      <div className="pointer-events-none absolute -top-24 -right-20 -z-10 size-64 rounded-full bg-hero-accent/15 blur-3xl" />
      <div className="flex items-start justify-between gap-6">
        <div className="min-w-0">
          <p className="text-sm font-medium text-hero-foreground/70">Total balance</p>
          <p className="mt-2 truncate font-heading text-4xl font-semibold tracking-tight tabular-nums sm:text-5xl">
            {totals ? money.format(totals.balance) : "—"}
          </p>
          {thisNet !== undefined && (
            <span
              className={cn(
                "mt-4 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium tabular-nums",
                thisNet >= 0 ? "bg-hero-accent/15 text-hero-accent" : "bg-hero-foreground/10 text-hero-foreground",
              )}
            >
              {thisNet >= 0 ? <ArrowUpRightIcon className="size-3.5" /> : <ArrowDownRightIcon className="size-3.5" />}
              {thisNet >= 0 ? "+" : "−"}
              {money.format(Math.abs(thisNet))} net this month
            </span>
          )}
        </div>
        <SavingsRing rate={savingsRate} />
      </div>
      <NetSparkline values={net} labels={monthly?.slice(-6).map((m) => m.month)} />
    </div>
  )
}

function SavingsRing({ rate }: { rate: number | null }) {
  const r = 30
  const c = 2 * Math.PI * r
  const pct = rate === null ? null : Math.round(rate * 100)
  return (
    <div className="relative hidden shrink-0 sm:block" title="Share of all income you've kept">
      <svg viewBox="0 0 72 72" className="size-24 -rotate-90" aria-hidden="true">
        <circle cx="36" cy="36" r={r} fill="none" strokeWidth="6" className="stroke-hero-foreground/15" />
        <circle
          cx="36"
          cy="36"
          r={r}
          fill="none"
          strokeWidth="6"
          strokeLinecap="round"
          className="stroke-hero-accent transition-[stroke-dashoffset] duration-1000 ease-out"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - (rate ?? 0))}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-heading text-xl font-semibold tabular-nums">{pct === null ? "—" : `${pct}%`}</span>
        <span className="text-[10px] tracking-wide text-hero-foreground/70 uppercase">saved</span>
      </div>
    </div>
  )
}

// Six-month net trend drawn as a soft line; hover a month to read its value
function NetSparkline({ values, labels }: { values?: number[]; labels?: string[] }) {
  const money = useMoney()
  const [hover, setHover] = useState<number | null>(null)
  if (!values || !labels || values.length < 2) return <div className="mt-6 h-16" />
  const w = 300
  const h = 56
  const min = Math.min(0, ...values)
  const max = Math.max(...values, 1)
  const x = (i: number) => (i / (values.length - 1)) * w
  const y = (v: number) => h - 4 - ((v - min) / (max - min || 1)) * (h - 8)
  const line = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(v).toFixed(1)}`).join(" ")
  const shown = hover ?? values.length - 1
  return (
    <div className="mt-6">
      <div className="mb-2 flex items-baseline justify-between text-xs text-hero-foreground/70">
        <span>Net per month</span>
        <span className="tabular-nums">
          {formatMonth(labels[shown])} · <span className="font-medium text-hero-foreground">{money.format(values[shown])}</span>
        </span>
      </div>
      <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className="h-14 w-full overflow-visible" onMouseLeave={() => setHover(null)}>
        <defs>
          <linearGradient id="net-fill" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--hero-accent)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="var(--hero-accent)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${line} L${w} ${h} L0 ${h} Z`} fill="url(#net-fill)" />
        <path d={line} fill="none" stroke="var(--hero-accent)" strokeWidth="2" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        <line x1={x(shown)} x2={x(shown)} y1="0" y2={h} stroke="var(--hero-foreground)" strokeOpacity="0.2" vectorEffect="non-scaling-stroke" />
        {values.map((_, i) => (
          <rect key={i} x={x(i) - w / values.length / 2} y="0" width={w / values.length} height={h} fill="transparent" onMouseEnter={() => setHover(i)} />
        ))}
      </svg>
      <div className="relative -mt-14 h-14 pointer-events-none" aria-hidden="true">
        <span
          className="absolute size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hero-accent ring-2 ring-hero"
          style={{ left: `${(x(shown) / w) * 100}%`, top: `${(y(values[shown]) / h) * 100}%` }}
        />
      </div>
    </div>
  )
}

/* ---------- Income / spending tiles ---------- */

function StatTile({
  label,
  tone,
  total,
  series,
  delta,
  className,
}: {
  label: string
  tone: "income" | "expense"
  total?: number
  series?: { month: string; value: number }[]
  delta: number | null
  className?: string
}) {
  const money = useMoney()
  const [hover, setHover] = useState<number | null>(null)
  const max = series ? Math.max(...series.map((s) => s.value), 1) : 1
  const shown = series ? series[hover ?? series.length - 1] : undefined
  const color = tone === "income" ? "var(--chart-income)" : "var(--chart-expense)"
  // Rising spending is the "bad" direction, rising income the good one
  const good = delta !== null && (tone === "income" ? delta >= 0 : delta <= 0)

  return (
    <Card className={cn("transition-[translate,box-shadow] duration-200 hover:-translate-y-0.5 hover:shadow-lg", className)}>
      <CardHeader>
        <CardDescription className="flex items-center gap-2">
          <span
            className={cn(
              "flex size-7 items-center justify-center rounded-lg",
              tone === "income" ? "bg-mint text-mint-foreground" : "bg-blush text-blush-foreground",
            )}
          >
            {tone === "income" ? <ArrowDownLeftIcon className="size-4" /> : <ArrowUpRightIcon className="size-4" />}
          </span>
          {label}
        </CardDescription>
        {delta !== null && (
          <CardAction>
            <span
              title="This month compared with last month"
              className={cn(
                "inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium tabular-nums",
                good ? "bg-mint text-mint-foreground" : "bg-blush text-blush-foreground",
              )}
            >
              {delta >= 0 ? <ArrowUpRightIcon className="size-3" /> : <ArrowDownRightIcon className="size-3" />}
              {Math.abs(delta)}%
            </span>
          </CardAction>
        )}
        <CardTitle className="mt-1 font-heading text-2xl font-semibold tracking-tight tabular-nums xl:text-3xl">
          {total === undefined ? "—" : money.format(total)}
        </CardTitle>
      </CardHeader>
      <CardContent className="mt-auto">
        {series ? (
          <>
            <div className="flex h-12 items-end gap-1.5" onMouseLeave={() => setHover(null)} aria-hidden="true">
              {series.map((s, i) => {
                const active = i === (hover ?? series.length - 1)
                return (
                  <div key={s.month} className="flex h-full flex-1 cursor-default items-end" onMouseEnter={() => setHover(i)}>
                    <div
                      className="w-full rounded-t-[4px] transition-[opacity,height] duration-300"
                      style={{ height: `${Math.max(6, (s.value / max) * 100)}%`, background: color, opacity: active ? 1 : 0.28 }}
                    />
                  </div>
                )
              })}
            </div>
            <p className="mt-2 text-xs text-muted-foreground">
              {hover === null ? "This month" : formatMonth(shown!.month)}{" "}
              <span className="font-medium text-foreground tabular-nums">{money.format(shown!.value)}</span>
            </p>
          </>
        ) : (
          <div className="h-16 animate-pulse rounded-lg bg-muted" />
        )}
      </CardContent>
    </Card>
  )
}

/* ---------- Cash flow ---------- */

const RANGES = [3, 6, 12] as const
type Range = (typeof RANGES)[number]

function CashFlowCard({ data, className }: { data?: Month[]; className?: string }) {
  const money = useMoney()
  const [range, setRange] = useState<Range>(6)
  const rows = data?.slice(-range)
  const income = rows?.reduce((s, m) => s + m.income, 0) ?? 0
  const expense = rows?.reduce((s, m) => s + m.expense, 0) ?? 0

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>Cash flow</CardTitle>
        <CardDescription>Money in and out, month by month</CardDescription>
        <CardAction>
          <div role="group" aria-label="Time range" className="inline-flex rounded-full bg-muted p-0.5 text-xs font-medium">
            {RANGES.map((r) => (
              <button
                key={r}
                type="button"
                aria-pressed={range === r}
                onClick={() => setRange(r)}
                className={cn(
                  "rounded-full px-3 py-1 transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none",
                  range === r ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
                )}
              >
                {r}M
              </button>
            ))}
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="grid gap-5">
        <dl className="grid gap-2 sm:grid-cols-3 sm:gap-3">
          <Figure label="In" color="var(--chart-income)" value={rows ? money.format(income) : "—"} />
          <Figure label="Out" color="var(--chart-expense)" value={rows ? money.format(expense) : "—"} />
          <Figure label="Net" value={rows ? `${income - expense < 0 ? "−" : ""}${money.format(Math.abs(income - expense))}` : "—"} />
        </dl>
        <CashFlowChart data={rows} />
      </CardContent>
    </Card>
  )
}

function Figure({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 rounded-xl border px-3 py-2.5 sm:block">
      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {color && <span className="size-2 rounded-sm" style={{ background: color }} />}
        {label}
      </dt>
      <dd className="mt-0.5 truncate text-sm font-semibold tabular-nums sm:text-base">{value}</dd>
    </div>
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

function CashFlowChart({ data }: { data?: Month[] }) {
  const money = useMoney()
  const [active, setActive] = useState<number | null>(null)
  if (!data) return <div className="h-60 animate-pulse rounded-lg bg-muted" />
  if (data.every((d) => d.income === 0 && d.expense === 0)) {
    return (
      <div className="flex h-60 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No transactions in this period.
      </div>
    )
  }
  // Fade the other months while one is hovered so the focused month stands out
  const opacity = (i: number) => (active === null || active === i ? 1 : 0.35)
  return (
    <div className="h-60" role="img" aria-label={`Bar chart of monthly income and expense for the last ${data.length} months`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          barGap={3}
          barCategoryGap="28%"
          margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
          onMouseMove={(s) => setActive(s.activeTooltipIndex == null ? null : Number(s.activeTooltipIndex))}
          onMouseLeave={() => setActive(null)}
        >
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 4" />
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
          <Tooltip content={(props) => <CashFlowTooltip {...props} />} cursor={{ fill: "var(--muted)", radius: 8 }} />
          <Bar dataKey="income" name="Income" fill="var(--chart-income)" radius={[4, 4, 0, 0]} maxBarSize={22}>
            {data.map((m, i) => (
              <Cell key={m.month} fillOpacity={opacity(i)} />
            ))}
          </Bar>
          <Bar dataKey="expense" name="Expense" fill="var(--chart-expense)" radius={[4, 4, 0, 0]} maxBarSize={22}>
            {data.map((m, i) => (
              <Cell key={m.month} fillOpacity={opacity(i)} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

/* ---------- Categories ---------- */

const MAX_CATEGORIES = 5

function CategoryBreakdown({ data }: { data?: Insights["categories"] }) {
  const money = useMoney()
  const [hover, setHover] = useState<string | null>(null)
  if (!data) return <div className="h-64 animate-pulse rounded-lg bg-muted" />
  if (data.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-xl border border-dashed text-sm text-muted-foreground">
        No spending logged yet.
      </div>
    )
  }

  // Fold the long tail into "Other" so the list stays short
  const top = data.slice(0, MAX_CATEGORIES)
  const rest = data.slice(MAX_CATEGORIES).reduce((sum, c) => sum + c.total, 0)
  const rows = rest > 0 ? [...top, { category: "Other", total: rest }] : top
  const total = data.reduce((sum, c) => sum + c.total, 0)
  const max = Math.max(...rows.map((r) => r.total))
  const lead = rows[0]
  const LeadIcon = categoryIcon(lead.category)

  return (
    <div className="grid gap-5">
      <div className="flex items-center gap-3 rounded-xl bg-muted p-3">
        <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-card text-foreground shadow-sm">
          <LeadIcon className="size-5" />
        </span>
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground">Biggest spend</p>
          <p className="truncate text-sm">
            <span className="font-semibold">{lead.category}</span>
            <span className="text-muted-foreground"> · {Math.round((lead.total / total) * 100)}% of spending</span>
          </p>
        </div>
      </div>
      <ul className="grid gap-1" onMouseLeave={() => setHover(null)}>
        {rows.map((row) => {
          const Icon = categoryIcon(row.category)
          const dim = hover !== null && hover !== row.category
          return (
            <li
              key={row.category}
              onMouseEnter={() => setHover(row.category)}
              className={cn("-mx-2 rounded-lg px-2 py-2 transition-[opacity,background-color] duration-200", dim ? "opacity-40" : "", hover === row.category && "bg-muted/60")}
            >
              <div className="flex items-center gap-2 text-sm">
                <Icon className="size-4 shrink-0 text-muted-foreground" />
                <span className="truncate font-medium">{row.category}</span>
                <span className="ml-auto shrink-0 tabular-nums">{money.format(row.total)}</span>
                <span className="w-9 shrink-0 text-right text-xs text-muted-foreground tabular-nums">
                  {Math.round((row.total / total) * 100)}%
                </span>
              </div>
              <div className="mt-1.5 ml-6 h-1.5 rounded-full bg-muted">
                <div
                  className="h-full origin-left animate-grow-x rounded-full bg-[var(--chart-category)]"
                  style={{ width: `${(row.total / max) * 100}%` }}
                />
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

/* ---------- Recent activity ---------- */

function RecentRow({ entry, onViewReceipt }: { entry: Entry; onViewReceipt: () => void }) {
  const money = useMoney()
  const income = entry.type === "income"
  const Icon = categoryIcon(entry.category)
  return (
    <li className="group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-muted/60">
      <span
        className={cn(
          "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform group-hover:scale-105",
          income ? "bg-mint text-mint-foreground" : "bg-blush text-blush-foreground",
        )}
      >
        <Icon className="size-4" />
      </span>
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
              onClick={onViewReceipt}
            >
              <PaperclipIcon />
            </Button>
          )}
        </p>
        <p className="text-xs text-muted-foreground">
          {entry.category} · {relativeDay(entry.date)}
        </p>
      </div>
      <span
        className={cn(
          "rounded-full px-2.5 py-1 text-sm font-semibold tabular-nums",
          income ? "bg-mint text-mint-foreground" : "text-blush-foreground",
        )}
      >
        {income ? "+" : "−"}
        {money.format(Number(entry.amount))}
      </span>
    </li>
  )
}

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed py-10 text-center">
      <span className="flex size-12 items-center justify-center rounded-2xl bg-muted text-muted-foreground">
        <ReceiptIcon className="size-5" />
      </span>
      <div>
        <p className="text-sm font-medium">No entries yet</p>
        <p className="text-sm text-muted-foreground">Log your first income or expense to start your journal.</p>
      </div>
      <Button variant="outline" size="sm" className="rounded-full" onClick={onAdd}>
        <PlusIcon />
        Add entry
      </Button>
    </div>
  )
}
