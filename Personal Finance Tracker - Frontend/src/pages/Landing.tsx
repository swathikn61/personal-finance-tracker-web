import { useEffect, useRef, useState, type CSSProperties } from "react"
import { Link } from "react-router-dom"
import { ArrowRightIcon, CheckIcon, PlusIcon } from "lucide-react"
import { StoryKeepVisual, StoryLogVisual, StorySeeVisual } from "@/components/landing/Mockups"
import { Reveal } from "@/components/landing/Reveal"
import { Logo, LogoMark } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"
import { useMoney } from "@/lib/money"
import { cn } from "@/lib/utils"

const navLinks = [
  { href: "#how-it-works", label: "How it works" },
  { href: "#savings", label: "Savings" },
  { href: "#faq", label: "FAQ" },
]

const trackables = ["Salary", "Groceries", "Rent", "Freelance", "Coffee", "Utilities", "Travel", "Subscriptions", "Dining out", "Gifts"]

const steps = [
  {
    word: "Log",
    title: "Write it down in seconds",
    body: "Amount, category, date, done. Every rupee in and out lands in one tidy timeline you can filter and sort.",
    visual: <StoryLogVisual />,
    surface: "bg-background text-foreground",
  },
  {
    word: "See",
    title: "Watch the picture form",
    body: "Your balance, savings rate, cash flow and top categories update the moment you add an entry.",
    visual: <StorySeeVisual />,
    surface: "bg-hero text-hero-foreground",
  },
  {
    word: "Keep",
    title: "Keep every receipt, take it anywhere",
    body: "Attach receipt photos to expenses and export everything to CSV whenever you need it.",
    visual: <StoryKeepVisual />,
    surface: "bg-secondary text-secondary-foreground",
  },
]

const extras = ["Receipt photos", "9 display currencies", "Light & dark mode", "CSV export", "Private to you", "Works on any screen"]

const faqs = [
  { q: "Is Spend Journal free?", a: "Yes. Create an account and use every feature without paying or adding a card." },
  {
    q: "Who can see my entries and receipts?",
    a: "Only you. Every request is tied to your signed-in account, and receipts can only be opened by the account that uploaded them.",
  },
  {
    q: "Does switching currency convert my amounts?",
    a: "No. It only changes how amounts are displayed (symbol and number format). Your numbers stay exactly as entered.",
  },
  { q: "Can I get my data out?", a: "Any time. Export all your entries to CSV and open them in Excel, Numbers or Google Sheets." },
]

const prefersReducedMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches

/* ---------- Intro curtain: a short navy reveal, once per visit ---------- */

const CURTAIN_KEY = "sj_intro_seen"

function shouldPlayIntro() {
  try {
    return !sessionStorage.getItem(CURTAIN_KEY) && !prefersReducedMotion()
  } catch {
    return false
  }
}

function IntroCurtain() {
  const [show, setShow] = useState(true)
  useEffect(() => {
    try {
      sessionStorage.setItem(CURTAIN_KEY, "1")
    } catch {
      // Storage unavailable: the curtain just shows again next time
    }
    const t = window.setTimeout(() => setShow(false), 1900)
    return () => window.clearTimeout(t)
  }, [])
  if (!show) return null
  return (
    <div aria-hidden="true" className="fixed inset-0 z-50 flex animate-curtain flex-col items-center justify-center gap-4 bg-hero text-hero-foreground">
      <LogoMark className="h-14 animate-pop [--foreground:var(--hero-foreground)]" />
      <p className="animate-fade-up font-mono text-xs tracking-[0.3em] text-hero-foreground/70 uppercase [animation-delay:200ms]">spend journal</p>
    </div>
  )
}

/* ---------- Header + scroll progress ---------- */

function useScrollY() {
  const [y, setY] = useState(0)
  useEffect(() => {
    const onScroll = () => setY(window.scrollY)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  return y
}

function Header() {
  const y = useScrollY()
  const solid = y > 24
  const max = typeof document === "undefined" ? 1 : Math.max(1, document.documentElement.scrollHeight - window.innerHeight)
  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-40 text-foreground transition-colors duration-300",
        solid ? "border-b bg-background/85 backdrop-blur-lg" : "border-b border-transparent",
      )}
    >
      <div
        className="absolute inset-x-0 top-0 h-0.5 origin-left bg-brand"
        style={{ transform: `scaleX(${Math.min(1, y / max)})` }}
        aria-hidden="true"
      />
      <div className="mx-auto grid h-16 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-4 md:px-8">
        <nav aria-label="Sections" className="hidden gap-6 font-mono text-[11px] tracking-[0.18em] uppercase md:flex">
          {navLinks.map((l) => (
            <a key={l.href} href={l.href} className="text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <Link to="/" aria-label="Spend Journal home" className="col-start-1 justify-self-start md:col-start-2 md:justify-self-center">
          <Logo />
        </Link>
        <div className="col-start-3 flex items-center justify-end gap-1 sm:gap-2">
          <ThemeToggle />
          <Button variant="ghost" nativeButton={false} render={<Link to="/login" />}>
            Sign in
          </Button>
          <Button className="hidden rounded-full sm:inline-flex" nativeButton={false} render={<Link to="/register" />}>
            Get started
          </Button>
        </div>
      </div>
    </header>
  )
}

/* ---------- Hero: calm headline beside one product card ---------- */

function HeroPreview() {
  const money = useMoney()
  const rows = [
    { name: "Salary", cat: "Income", amount: 64000, income: true },
    { name: "Groceries", cat: "Food", amount: 2340 },
    { name: "Electricity", cat: "Utilities", amount: 1200 },
  ]
  return (
    <div aria-hidden="true" className="w-full max-w-md rounded-3xl border bg-card p-6 text-card-foreground shadow-elevated sm:p-7">
      <p className="text-xs font-medium text-muted-foreground">Total balance</p>
      <p className="mt-1 font-heading text-4xl font-semibold tracking-tight tabular-nums">{money.format(71200)}</p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="mt-0.5 text-sm font-semibold text-success tabular-nums">{money.format(76000)}</p>
        </div>
        <div className="rounded-xl bg-muted p-3">
          <p className="text-xs text-muted-foreground">Expense</p>
          <p className="mt-0.5 text-sm font-semibold tabular-nums">{money.format(4800)}</p>
        </div>
      </div>
      <ul className="mt-5 divide-y border-t">
        {rows.map((r) => (
          <li key={r.name} className="flex items-center justify-between py-3 text-sm">
            <span>
              <span className="block font-medium">{r.name}</span>
              <span className="text-xs text-muted-foreground">{r.cat}</span>
            </span>
            <span className={cn("font-semibold tabular-nums", r.income ? "text-success" : "text-destructive")}>
              {r.income ? "+" : "−"}
              {money.format(r.amount)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

function Hero() {
  return (
    <section className="mx-auto grid max-w-6xl items-center gap-14 px-4 pt-32 pb-20 md:px-8 lg:grid-cols-[1.15fr_1fr] lg:pt-40 lg:pb-28">
      <div className="text-center lg:text-left">
        <p className="animate-fade-up text-sm font-medium text-brand [animation-delay:var(--intro)]">Personal finance, journaled</p>
        <h1 className="mt-4 animate-fade-up text-4xl leading-[1.05] font-semibold tracking-tight text-balance [animation-delay:calc(var(--intro)+100ms)] sm:text-5xl lg:text-6xl">
          Every rupee tells a story.
        </h1>
        <p className="mx-auto mt-5 max-w-lg animate-fade-up text-lg text-pretty text-muted-foreground [animation-delay:calc(var(--intro)+200ms)] lg:mx-0">
          Spend Journal turns what you earn and spend into a clear picture: live balances, honest trends and a home for every receipt.
        </p>
        <div className="mt-8 flex animate-fade-up flex-wrap items-center justify-center gap-3 [animation-delay:calc(var(--intro)+300ms)] lg:justify-start">
          <Button size="lg" className="group h-11 rounded-full px-6" nativeButton={false} render={<Link to="/register" />}>
            Start your journal
            <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
          </Button>
          <Button size="lg" variant="outline" className="h-11 rounded-full px-6" nativeButton={false} render={<a href="#how-it-works" />}>
            See how it works
          </Button>
        </div>
      </div>
      <div className="flex animate-fade-up justify-center [animation-delay:calc(var(--intro)+400ms)] lg:justify-end">
        <HeroPreview />
      </div>
    </section>
  )
}

/* ---------- Pinned story: Log, See, Keep ---------- */

function Story() {
  const ref = useRef<HTMLDivElement>(null)
  const [step, setStep] = useState(0)
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current
      if (!el) return
      const r = el.getBoundingClientRect()
      const scrollable = r.height - window.innerHeight
      // Hidden (mobile) or not yet laid out: stay on the first step instead of dividing by zero
      if (scrollable <= 0) return setStep(0)
      const progress = Math.min(1, Math.max(0, -r.top / scrollable))
      setStep(Math.min(steps.length - 1, Math.floor(progress * steps.length)))
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])
  const s = steps[step]

  return (
    <section id="how-it-works" className="scroll-mt-16">
      {/* Desktop: pinned, scroll-driven */}
      <div ref={ref} className="relative hidden h-[300svh] md:block">
        <div className={cn("sticky top-0 flex h-svh items-center overflow-hidden transition-colors duration-700", s.surface)}>
          <p
            key={s.word}
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-[-0.12em] animate-fade-up text-center font-heading text-[26vw] leading-none font-bold tracking-tighter opacity-[0.06] select-none"
          >
            {s.word}
          </p>
          <div className="relative mx-auto grid w-full max-w-6xl grid-cols-2 items-center gap-16 px-8">
            <div>
              <p className="font-mono text-xs tracking-[0.25em] uppercase opacity-70">How it works</p>
              <div key={s.word} className="animate-fade-up">
                <p className="mt-6 font-mono text-sm tracking-[0.2em] uppercase">
                  0{step + 1} <span className="opacity-50">/ 03</span> · {s.word}
                </p>
                <h2 className="mt-4 text-5xl leading-[1.05] font-semibold tracking-tight text-balance">{s.title}</h2>
                <p className="mt-5 max-w-md text-lg opacity-75">{s.body}</p>
              </div>
              <div className="mt-10 flex gap-2" aria-hidden="true">
                {steps.map((_, i) => (
                  <span key={i} className={cn("h-1 rounded-full bg-current transition-all duration-500", i === step ? "w-12 opacity-100" : "w-6 opacity-25")} />
                ))}
              </div>
            </div>
            <div key={s.word} className="flex animate-fade-up justify-center">
              {s.visual}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile: the same story, stacked */}
      <div className="md:hidden">
        {steps.map((st, i) => (
          <div key={st.word} className={cn("px-4 py-16", st.surface)}>
            <Reveal>
              <p className="font-mono text-xs tracking-[0.2em] uppercase opacity-70">
                0{i + 1} / 03 · {st.word}
              </p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight text-balance">{st.title}</h2>
              <p className="mt-3 opacity-75">{st.body}</p>
            </Reveal>
            <Reveal delay={120} className="mt-8 flex justify-center">
              {st.visual}
            </Reveal>
          </div>
        ))}
      </div>
    </section>
  )
}

/* ---------- Savings jar: a small interactive toy ---------- */

function SavingsJar() {
  const money = useMoney()
  const [daily, setDaily] = useState(150)
  const yearly = daily * 365
  const fill = Math.min(1, daily / 1000)

  return (
    <section id="savings" className="mx-auto grid max-w-6xl scroll-mt-20 items-center gap-12 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-brand uppercase">Small habits, big numbers</p>
        <h2 className="mt-4 text-4xl leading-[1.05] font-semibold tracking-tight text-balance md:text-5xl">
          What would saving a little every day add up to?
        </h2>
        <p className="mt-4 max-w-md text-muted-foreground">Drag the slider. Spend Journal helps you see habits like this, one entry at a time.</p>

        <div className="mt-10 rounded-3xl border bg-card p-6 shadow-elevated">
          <label htmlFor="daily" className="flex items-baseline justify-between text-sm font-medium">
            Saved per day
            <span className="font-heading text-2xl font-semibold tabular-nums">{money.format(daily)}</span>
          </label>
          <input
            id="daily"
            type="range"
            min={10}
            max={1000}
            step={10}
            value={daily}
            onChange={(e) => setDaily(Number(e.target.value))}
            className="mt-4 w-full cursor-pointer accent-[var(--primary)]"
          />
          <dl className="mt-6 grid grid-cols-2 gap-3">
            <div className="rounded-2xl bg-muted p-4">
              <dt className="text-xs text-muted-foreground">In a month</dt>
              <dd className="mt-1 font-heading text-xl font-semibold tabular-nums">{money.format(daily * 30)}</dd>
            </div>
            <div className="rounded-2xl bg-primary p-4 text-primary-foreground">
              <dt className="text-xs opacity-75">In a year</dt>
              <dd className="mt-1 font-heading text-xl font-semibold tabular-nums">{money.format(yearly)}</dd>
            </div>
          </dl>
        </div>
      </Reveal>

      <Reveal delay={150} className="flex justify-center">
        <div aria-hidden="true" className="relative">
          {/* lid */}
          <div className="mx-auto h-6 w-40 rounded-t-xl rounded-b-sm bg-primary" />
          <div className="mx-auto h-3 w-48 rounded-sm bg-[var(--brand-soft)]/40" />
          {/* jar */}
          <div className="relative h-80 w-60 overflow-hidden rounded-b-[3.5rem] rounded-t-3xl border-4 border-[var(--brand-soft)]/40 bg-card">
            <div className="absolute inset-x-0 bottom-0 bg-[var(--chart-income)] transition-[height] duration-700 ease-out" style={{ height: `${8 + fill * 84}%` }}>
              {/* moving water line */}
              <div className="absolute inset-x-0 -top-3 h-4 overflow-hidden">
                <div className="flex h-full w-[200%] animate-marquee [animation-duration:6s]">
                  {[0, 1].map((k) => (
                    <svg key={k} viewBox="0 0 240 16" preserveAspectRatio="none" className="h-full w-1/2 fill-[var(--chart-income)]">
                      <path d="M0 8 Q 30 0 60 8 T 120 8 T 180 8 T 240 8 V16 H0 Z" />
                    </svg>
                  ))}
                </div>
              </div>
            </div>
            {/* coins resting at the bottom */}
            <div className="absolute inset-x-0 bottom-4 flex flex-wrap justify-center gap-1.5 px-6">
              {Array.from({ length: Math.max(1, Math.round(fill * 12)) }).map((_, i) => (
                <span key={i} className="flex size-7 items-center justify-center rounded-full border-2 border-hero-accent/70 bg-hero-accent/30 text-[11px] font-bold text-hero-foreground">
                  {money.symbol}
                </span>
              ))}
            </div>
            {/* glass shine */}
            <div className="absolute inset-y-6 left-5 w-3 rounded-full bg-white/40" />
          </div>
          <p className="mt-4 text-center font-mono text-[11px] tracking-[0.2em] text-muted-foreground uppercase">
            {money.formatCompact(yearly)} / year
          </p>
        </div>
      </Reveal>
    </section>
  )
}

/* ---------- Page ---------- */

export function Landing() {
  // Decided once on mount so the curtain and the hero's entrance timing agree
  const [playIntro] = useState(shouldPlayIntro)
  return (
    <div className="min-h-svh overflow-x-clip bg-background" style={{ "--intro": playIntro ? "1.7s" : "0s" } as CSSProperties}>
      {playIntro && <IntroCurtain />}
      <Header />

      <main>
        <Hero />

        {/* Marquee band */}
        <section aria-label="Things you can track" className="overflow-hidden border-y py-4 text-muted-foreground">
          <div className="flex w-max animate-marquee gap-10 hover:[animation-play-state:paused]">
            {[...trackables, ...trackables].map((t, i) => (
              <span key={i} aria-hidden={i >= trackables.length} className="flex items-center gap-10 font-heading text-base font-medium whitespace-nowrap md:text-lg">
                {t}
                <span className="text-sm text-brand opacity-60">✦</span>
              </span>
            ))}
          </div>
        </section>

        <Story />

        <SavingsJar />

        {/* What's inside */}
        <section aria-label="What's included" className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
          <Reveal className="flex flex-wrap justify-center gap-3">
            {extras.map((x) => (
              <span key={x} className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-2 text-sm shadow-elevated">
                <CheckIcon className="size-4 text-brand" />
                {x}
              </span>
            ))}
          </Reveal>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-20 border-t">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 md:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <Reveal>
              <p className="font-mono text-xs tracking-[0.25em] text-brand uppercase">FAQ</p>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">Questions, answered</h2>
            </Reveal>
            <Reveal delay={100} className="grid gap-3">
              {faqs.map((f) => (
                <details key={f.q} className="group rounded-2xl border bg-card px-5 transition-colors open:bg-accent/50">
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-4 font-medium [&::-webkit-details-marker]:hidden">
                    {f.q}
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border transition-all duration-300 group-open:rotate-45 group-open:bg-primary group-open:text-primary-foreground">
                      <PlusIcon className="size-3.5" />
                    </span>
                  </summary>
                  <p className="pr-10 pb-5 text-sm text-muted-foreground">{f.a}</p>
                </details>
              ))}
            </Reveal>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="relative isolate overflow-hidden bg-hero text-hero-foreground">
          <div className="pointer-events-none absolute -bottom-40 left-1/2 -z-10 size-[36rem] -translate-x-1/2 rounded-full bg-hero-accent/20 blur-3xl" />
          <div className="mx-auto max-w-6xl px-4 py-24 text-center md:px-8 md:py-32">
            <Reveal>
              <h2 className="text-5xl leading-[0.98] font-semibold tracking-tight text-balance md:text-7xl">
                Start your <span className="text-hero-accent">journal.</span>
              </h2>
              <p className="mx-auto mt-5 max-w-md text-hero-foreground/70">Free, quick to set up, and ready on your phone and laptop.</p>
              <Button size="lg" className="group mt-9 h-12 rounded-full bg-hero-accent px-8 text-hero hover:bg-hero-accent/90" nativeButton={false} render={<Link to="/register" />}>
                Create free account
                <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
              </Button>
            </Reveal>
          </div>
          <footer className="border-t border-hero-foreground/15">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm text-hero-foreground/70 sm:flex-row sm:items-center sm:justify-between md:px-8">
              <p>© {new Date().getFullYear()} Spend Journal</p>
              <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2">
                {navLinks.map((l) => (
                  <a key={l.href} href={l.href} className="transition-colors hover:text-hero-foreground">{l.label}</a>
                ))}
                <Link to="/login" className="transition-colors hover:text-hero-foreground">Sign in</Link>
                <a href="https://github.com/swathikn61/personal-finance-tracker-web" target="_blank" rel="noreferrer" className="transition-colors hover:text-hero-foreground">
                  GitHub
                </a>
              </nav>
            </div>
          </footer>
        </section>
      </main>
    </div>
  )
}
