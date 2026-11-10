// Decorative product mockups for the landing page. They use the app's own theme tokens,
// so they stay crisp and follow light/dark mode. All are aria-hidden; numbers are sample data.
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  LayoutDashboardIcon,
  PaperclipIcon,
  ReceiptTextIcon,
  SettingsIcon,
} from "lucide-react"
import type { ReactNode } from "react"
import { LogoMark } from "@/components/Logo"
import { useInView } from "@/components/landing/Reveal"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

/* ---------- Hero journal ---------- */

// An open ledger page: entries "written" one by one, the balance circled in gold,
// a bookmark ribbon (the logo's gold dot), a sticky note and a clipped receipt
export function HeroJournal() {
  const money = useMoney()
  const entries = [
    { what: "Salary", tag: "Income", amount: 64000, income: true },
    { what: "Groceries", tag: "Food", amount: 2340 },
    { what: "Metro card", tag: "Travel", amount: 600 },
    { what: "Freelance logo", tag: "Income", amount: 12000, income: true },
    { what: "Dinner out", tag: "Food", amount: 1860 },
  ]
  return (
    <div aria-hidden="true" className="relative mx-auto w-full max-w-md px-4 pt-8 pb-20 sm:px-0">
      {/* page underneath */}
      <div className="absolute inset-x-6 top-12 bottom-22 -rotate-[5deg] rounded-2xl border bg-secondary shadow-lg sm:inset-x-2" />

      {/* front page */}
      <div className="relative rotate-[1.5deg] rounded-2xl border bg-card shadow-2xl shadow-black/15">
        {/* bookmark ribbon */}
        <div className="absolute -top-2 right-36 h-20 w-6 bg-brand shadow-md [clip-path:polygon(0_0,100%_0,100%_100%,50%_82%,0_100%)]" />

        {/* binder rings */}
        <div className="absolute top-8 bottom-8 -left-2.5 flex flex-col justify-between">
          {Array.from({ length: 7 }).map((_, i) => (
            <span key={i} className="block size-5 rounded-full border-2 border-muted-foreground/40 bg-background shadow-inner" />
          ))}
        </div>

        <div className="relative py-6 pr-6 pl-12">
          {/* margin line */}
          <div className="absolute top-0 bottom-0 left-9 w-px bg-destructive/30" />

          <p className="font-hand text-3xl leading-none">my spend journal</p>

          {/* ruled lines + entries */}
          <ul className="mt-4 [background-image:repeating-linear-gradient(to_bottom,transparent_0,transparent_39px,var(--border)_39px,var(--border)_40px)]">
            {entries.map((e, i) => (
              <li
                key={e.what}
                className="flex h-10 animate-pop items-center gap-2.5"
                style={{ animationDelay: `${500 + i * 260}ms` }}
              >
                <span className={cn("size-2 shrink-0 rounded-full", e.income ? "bg-success" : "bg-destructive")} />
                <span className="min-w-0 flex-1 truncate text-sm font-medium">{e.what}</span>
                <span
                  className={cn(
                    "hidden rounded-md border px-1.5 py-0.5 text-[10px] font-semibold tracking-wide uppercase sm:inline",
                    e.income ? "border-success/40 text-success" : "border-border text-muted-foreground",
                  )}
                >
                  {e.tag}
                </span>
                <span className={cn("w-24 text-right text-sm font-semibold tabular-nums", e.income ? "text-success" : "text-destructive")}>
                  {e.income ? "+" : "−"}
                  {money.format(e.amount)}
                </span>
              </li>
            ))}
          </ul>

          {/* balance, circled by hand */}
          <div className="mt-3 flex items-center justify-between">
            <span className="font-hand text-xl whitespace-nowrap text-muted-foreground sm:text-2xl">balance so far</span>
            <span className="relative px-3 py-1">
              <span className="font-heading text-xl font-semibold tabular-nums sm:text-2xl">{money.format(71200)}</span>
              <svg viewBox="0 0 200 70" preserveAspectRatio="none" className="pointer-events-none absolute -inset-x-2 -inset-y-2 h-[calc(100%+1rem)] w-[calc(100%+1rem)] text-brand">
                <path
                  d="M30 12 C 90 0, 190 8, 194 34 C 198 60, 120 68, 70 64 C 20 60, 2 44, 8 28 C 14 14, 50 6, 110 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  pathLength={1}
                  strokeDasharray={1}
                  className="animate-draw"
                  style={{ animationDelay: "2s" }}
                />
              </svg>
            </span>
          </div>
        </div>
      </div>

      {/* sticky note */}
      <div className="absolute top-0 -right-1 w-36 rotate-[7deg] animate-float rounded-sm bg-[#F2E2B0] p-3 text-[#3B3220] shadow-lg [animation-delay:-2s] sm:-right-8">
        <span className="absolute -top-2.5 left-1/2 h-5 w-14 -translate-x-1/2 -rotate-3 bg-white/60 shadow-sm" />
        <p className="font-hand text-2xl leading-tight">38% saved!</p>
        <p className="mt-0.5 font-hand text-base leading-tight opacity-70">keep it up ✓</p>
      </div>

      {/* clipped receipt */}
      <div className="absolute bottom-0 left-2 w-32 -rotate-[9deg] animate-float rounded-sm border bg-background p-2.5 font-mono text-[9px] leading-relaxed text-muted-foreground shadow-lg [animation-delay:-4s] sm:-left-6">
        <PaperclipIcon className="absolute -top-3 left-4 size-6 rotate-12 text-brand" />
        <p className="text-center font-sans text-[10px] font-semibold text-foreground">CORNER CAFÉ</p>
        <div className="mt-1 flex justify-between"><span>Latte</span><span>4.50</span></div>
        <div className="flex justify-between"><span>Croissant</span><span>3.20</span></div>
        <div className="mt-0.5 flex justify-between border-t border-dashed pt-0.5 font-semibold text-foreground">
          <span>TOTAL</span><span>7.70</span>
        </div>
      </div>
    </div>
  )
}

/* ---------- Framed dashboard ---------- */

export function DashboardShowcase() {
  const money = useMoney()
  const { ref, inView } = useInView<HTMLDivElement>(0.25)
  const months = [38, 52, 44, 61, 49, 70, 58, 66, 54, 73, 62, 80]
  const spend = [22, 30, 26, 35, 28, 38, 33, 36, 31, 40, 35, 42]
  const rows = [
    { name: "Monthly salary", cat: "Salary", amount: 64000, income: true },
    { name: "Groceries", cat: "Food", amount: 2340 },
    { name: "Metro card top-up", cat: "Transport", amount: 600, receipt: true },
  ]
  return (
    <div aria-hidden="true" className="overflow-hidden rounded-2xl border bg-card shadow-2xl shadow-black/10">
      {/* window chrome */}
      <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
        <span className="size-2.5 rounded-full bg-[#E5655A]" />
        <span className="size-2.5 rounded-full bg-[#E9B949]" />
        <span className="size-2.5 rounded-full bg-[#5BB974]" />
        <span className="mx-auto rounded-md bg-background px-3 py-0.5 text-[11px] text-muted-foreground">spend-journal.vercel.app/dashboard</span>
      </div>
      <div className="grid md:grid-cols-[180px_1fr]">
        <aside className="hidden border-r p-4 md:block">
          <div className="flex items-center gap-2">
            <LogoMark className="h-6" />
            <span className="text-xs leading-[0.95] font-bold lowercase">spend<br />journal</span>
          </div>
          <nav className="mt-6 grid gap-1 text-xs">
            {[
              [LayoutDashboardIcon, "Overview", true],
              [ReceiptTextIcon, "Transactions", false],
              [SettingsIcon, "Settings", false],
            ].map(([Icon, label, active]) => {
              const I = Icon as typeof LayoutDashboardIcon
              return (
                <span key={label as string} className={cn("flex items-center gap-2 rounded-md px-2 py-1.5 text-muted-foreground", active && "bg-accent text-foreground")}>
                  <I className={cn("size-3.5", active && "text-brand")} />
                  {label as string}
                </span>
              )
            })}
          </nav>
        </aside>
        <div className="grid gap-3 p-4 sm:p-5">
          <div>
            <p className="text-lg font-semibold">Good evening</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-hero p-3 text-hero-foreground">
              <p className="text-[10px] text-brand">Total balance</p>
              <p className="mt-1 text-lg font-semibold tabular-nums">{money.format(48250)}</p>
            </div>
            <MiniStat label="Total income" value={money.format(126000)} tone="income" />
            <MiniStat label="Total expense" value={money.format(77750)} tone="expense" />
          </div>
          <div className="grid gap-3 lg:grid-cols-[1.6fr_1fr]">
            <div className="rounded-xl border p-3">
              <div className="flex items-center justify-between text-[11px]">
                <span className="font-medium">Cash flow</span>
                <span className="flex gap-3 text-muted-foreground">
                  <span className="inline-flex items-center gap-1"><i className="size-2 rounded-sm bg-[var(--chart-income)]" />Income</span>
                  <span className="inline-flex items-center gap-1"><i className="size-2 rounded-sm bg-[var(--chart-expense)]" />Expense</span>
                </span>
              </div>
              <div ref={ref} className="mt-3 flex h-28 items-end gap-1.5">
                {months.map((m, i) => (
                  <div key={i} className="flex h-full flex-1 items-end justify-center gap-px">
                    <div
                      className={cn("w-1.5 origin-bottom rounded-t-sm bg-[var(--chart-income)]", inView ? "animate-grow-y" : "scale-y-0")}
                      style={{ height: `${m}%`, animationDelay: `${i * 60}ms` }}
                    />
                    <div
                      className={cn("w-1.5 origin-bottom rounded-t-sm bg-[var(--chart-expense)]", inView ? "animate-grow-y" : "scale-y-0")}
                      style={{ height: `${spend[i]}%`, animationDelay: `${i * 60 + 30}ms` }}
                    />
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-xl border p-3">
              <p className="text-[11px] font-medium">Recent transactions</p>
              <ul className="mt-2 divide-y">
                {rows.map((r) => (
                  <li key={r.name} className="flex items-center gap-2 py-1.5 text-[11px]">
                    <span className={cn("flex size-6 shrink-0 items-center justify-center rounded-full", r.income ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
                      {r.income ? <ArrowDownLeftIcon className="size-3" /> : <ArrowUpRightIcon className="size-3" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1 truncate font-medium">
                        {r.name}
                        {r.receipt && <PaperclipIcon className="size-3 text-muted-foreground" />}
                      </span>
                      <span className="text-muted-foreground">{r.cat}</span>
                    </span>
                    <span className={cn("font-semibold tabular-nums", r.income ? "text-success" : "text-destructive")}>
                      {r.income ? "+" : "−"}{money.format(r.amount)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone: "income" | "expense" }) {
  const Icon = tone === "income" ? ArrowDownLeftIcon : ArrowUpRightIcon
  return (
    <div className="flex items-center justify-between rounded-xl border p-3">
      <div>
        <p className="text-[10px] text-muted-foreground">{label}</p>
        <p className="mt-0.5 text-sm font-semibold tabular-nums">{value}</p>
      </div>
      <span className={cn("flex size-6 items-center justify-center rounded-full", tone === "income" ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
        <Icon className="size-3" />
      </span>
    </div>
  )
}

/* ---------- Floating notifications around the showcase ---------- */

export function FloatingNote({
  icon,
  title,
  detail,
  tone = "neutral",
  className,
}: {
  icon: ReactNode
  title: string
  detail: string
  tone?: "income" | "neutral"
  className?: string
}) {
  return (
    <div
      aria-hidden="true"
      className={cn("flex items-center gap-3 rounded-2xl border bg-card/95 p-3 pr-4 shadow-xl shadow-black/10 backdrop-blur", className)}
    >
      <span
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-xl",
          tone === "income" ? "bg-success/10 text-success" : "bg-brand/15 text-brand",
        )}
      >
        {icon}
      </span>
      <span className="leading-tight">
        <span className="block text-xs font-semibold">{title}</span>
        <span className="block text-[11px] text-muted-foreground">{detail}</span>
      </span>
    </div>
  )
}
