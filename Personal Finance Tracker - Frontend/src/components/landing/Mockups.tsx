// Decorative product visuals for the landing page. They use the app's own theme tokens,
// so they stay crisp and follow light/dark mode. All are aria-hidden; numbers are sample data.
import type { ReactNode } from "react"
import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  DownloadIcon,
  FileSpreadsheetIcon,
  PaperclipIcon,
  PlusIcon,
  TrendingUpIcon,
} from "lucide-react"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

/* ---------- Receipt token ---------- */

export function ReceiptToken() {
  return (
    <div className="relative w-36 rounded-md border bg-card p-3 font-mono text-[10px] leading-relaxed text-muted-foreground shadow-xl">
      <PaperclipIcon className="absolute -top-3 left-4 size-6 rotate-12 text-primary" />
      <p className="text-center font-sans text-[11px] font-semibold text-card-foreground">CORNER CAFÉ</p>
      <div className="mt-1 flex justify-between"><span>Latte</span><span>4.50</span></div>
      <div className="flex justify-between"><span>Croissant</span><span>3.20</span></div>
      <div className="mt-1 flex justify-between border-t border-dashed pt-1 font-semibold text-card-foreground">
        <span>TOTAL</span><span>7.70</span>
      </div>
    </div>
  )
}

/* ---------- Story step visuals ---------- */

function Frame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div aria-hidden="true" className={cn("w-full max-w-md rounded-3xl border bg-card p-5 text-card-foreground shadow-2xl sm:p-6", className)}>
      {children}
    </div>
  )
}

export function StoryLogVisual() {
  const money = useMoney()
  const entries = [
    { name: "Salary", cat: "Income", amount: 64000, income: true },
    { name: "Groceries", cat: "Food", amount: 2340 },
    { name: "Metro card", cat: "Travel", amount: 600 },
    { name: "Freelance logo", cat: "Income", amount: 12000, income: true },
  ]
  return (
    <Frame>
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">Recent entries</p>
        <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground">
          <PlusIcon className="size-3.5" />
          Add entry
        </span>
      </div>
      <ul className="mt-4 grid gap-2">
        {entries.map((e, i) => (
          <li key={e.name} className="flex animate-pop items-center gap-3 rounded-xl border p-3" style={{ animationDelay: `${i * 110}ms` }}>
            <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-full", e.income ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive")}>
              {e.income ? <ArrowDownLeftIcon className="size-4" /> : <ArrowUpRightIcon className="size-4" />}
            </span>
            <span className="min-w-0 flex-1 text-sm">
              <span className="block truncate font-medium">{e.name}</span>
              <span className="text-xs text-muted-foreground">{e.cat}</span>
            </span>
            <span className={cn("text-sm font-semibold tabular-nums", e.income ? "text-success" : "text-destructive")}>
              {e.income ? "+" : "−"}
              {money.format(e.amount)}
            </span>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

const chartLine = "M0 92 C 30 88, 46 70, 76 72 S 124 86, 150 62 S 196 30, 226 40 S 270 22, 300 10"

export function StorySeeVisual() {
  const money = useMoney()
  const categories = [
    { name: "Rent", share: 46 },
    { name: "Food", share: 30 },
    { name: "Travel", share: 24 },
  ]
  return (
    <Frame>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">Total balance</p>
          <p className="mt-1 font-heading text-3xl font-semibold tracking-tight tabular-nums">{money.format(71200)}</p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-1 text-xs font-semibold text-success">
          <TrendingUpIcon className="size-3.5" />
          38% saved
        </span>
      </div>
      <svg viewBox="0 0 300 100" className="mt-4 h-24 w-full overflow-visible text-primary" preserveAspectRatio="none">
        <defs>
          <linearGradient id="story-area" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="currentColor" stopOpacity="0.18" />
            <stop offset="100%" stopColor="currentColor" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={`${chartLine} L300 100 L0 100 Z`} fill="url(#story-area)" />
        <path d={chartLine} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" pathLength={1} strokeDasharray={1} className="animate-draw" />
      </svg>
      <ul className="mt-4 grid gap-3">
        {categories.map((c, i) => (
          <li key={c.name}>
            <div className="flex justify-between text-xs">
              <span className="font-medium">{c.name}</span>
              <span className="text-muted-foreground">{c.share}%</span>
            </div>
            <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full origin-left animate-grow-x rounded-full bg-[var(--chart-category)]"
                style={{ width: `${(c.share / 46) * 100}%`, animationDelay: `${300 + i * 120}ms` }}
              />
            </div>
          </li>
        ))}
      </ul>
    </Frame>
  )
}

export function StoryKeepVisual() {
  const rows = [
    ["date", "description", "amount"],
    ["2026-11-04", "Groceries", "2340.00"],
    ["2026-11-03", "Salary", "64000.00"],
    ["2026-11-02", "Metro card", "600.00"],
  ]
  return (
    <div aria-hidden="true" className="relative w-full max-w-md">
      <Frame>
        <div className="flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-sm font-semibold">
            <FileSpreadsheetIcon className="size-4 text-success" />
            entries.csv
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium">
            <DownloadIcon className="size-3.5" />
            Export
          </span>
        </div>
        <div className="mt-4 overflow-hidden rounded-xl border font-mono text-[11px]">
          {rows.map((row, i) => (
            <div
              key={i}
              className={cn("grid animate-pop grid-cols-[1.1fr_1.2fr_0.9fr] gap-2 px-3 py-2", i === 0 ? "bg-muted font-semibold" : "border-t")}
              style={{ animationDelay: `${i * 90}ms` }}
            >
              {row.map((cell, j) => (
                <span key={j} className={cn("truncate", j === 2 && "text-right")}>{cell}</span>
              ))}
            </div>
          ))}
        </div>
      </Frame>
      <div className="absolute -top-8 -right-4 rotate-6 animate-pop [animation-delay:350ms] sm:-right-10">
        <ReceiptToken />
      </div>
    </div>
  )
}
