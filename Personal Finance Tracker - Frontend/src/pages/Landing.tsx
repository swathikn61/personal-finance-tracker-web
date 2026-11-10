import { useState, type ReactNode } from "react"
import { Link } from "react-router-dom"
import {
  ArrowDownLeftIcon,
  ArrowRightIcon,
  ChartColumnIcon,
  CheckIcon,
  DownloadIcon,
  GlobeIcon,
  MoonIcon,
  PaperclipIcon,
  PlusIcon,
  ShieldCheckIcon,
  SlidersHorizontalIcon,
  SparklesIcon,
  XIcon,
} from "lucide-react"
import { DashboardShowcase, FloatingNote, HeroJournal } from "@/components/landing/Mockups"
import { Reveal } from "@/components/landing/Reveal"
import { Logo, LogoMark } from "@/components/Logo"
import { ThemeToggle } from "@/components/ThemeToggle"
import { Button } from "@/components/ui/button"

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#faq", label: "FAQ" },
]

const trackables = [
  "Salary", "Groceries", "Rent", "Freelance", "Coffee", "Utilities", "Travel", "Subscriptions",
  "Dining out", "Fuel", "Gifts", "Gym", "Shopping", "Medical", "Savings", "Bonus",
]

const features = [
  { icon: ChartColumnIcon, title: "Live dashboard", body: "Balance, savings rate, 12-month cash flow and top categories, updated as you add entries." },
  { icon: PaperclipIcon, title: "Receipt photos", body: "Attach a photo to any expense. Resized in your browser, private to your account." },
  { icon: SlidersHorizontalIcon, title: "Filter & sort", body: "Find any entry by type, category or date range, and sort by date, amount or category." },
  { icon: GlobeIcon, title: "9 currencies", body: "Show amounts in ₹, $, €, £, ¥ and more, formatted the way you're used to." },
  { icon: MoonIcon, title: "Light & dark mode", body: "Pick a theme or follow your device. Looks right on phone and laptop." },
  { icon: DownloadIcon, title: "CSV export", body: "Take every entry into Excel or Google Sheets in one click." },
]

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

/* ---------- Building blocks ---------- */

// Gold gradient word with a hand-drawn underline that draws itself in
function Accent({ children }: { children: ReactNode }) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      <span className="bg-gradient-to-r from-[#B08A4E] via-brand to-[#D9BE8C] bg-clip-text text-transparent">{children}</span>
      <svg viewBox="0 0 200 12" preserveAspectRatio="none" className="absolute -bottom-1 left-0 h-[0.18em] w-full text-brand" aria-hidden="true">
        <path
          d="M2 9 C 50 2, 110 2, 198 7"
          fill="none"
          stroke="currentColor"
          strokeWidth="4"
          strokeLinecap="round"
          pathLength={1}
          strokeDasharray={1}
          className="animate-draw"
        />
      </svg>
    </span>
  )
}

function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 text-xs font-semibold tracking-[0.18em] text-brand uppercase">
      <span className="h-px w-6 bg-brand" />
      {children}
    </p>
  )
}

function Sparkle({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <path d="M12 0c.8 6.6 5.4 11.2 12 12-6.6.8-11.2 5.4-12 12-.8-6.6-5.4-11.2-12-12C6.6 11.2 11.2 6.6 12 0Z" fill="currentColor" />
    </svg>
  )
}

/* ---------- Page ---------- */

export function Landing() {
  const [showBanner, setShowBanner] = useState(true)

  return (
    <div className="min-h-svh overflow-x-clip bg-background">
      {showBanner && (
        <div className="relative bg-hero px-10 py-2 text-center text-xs text-hero-foreground">
          <Link to="/register" className="group inline-flex items-center gap-1.5">
            <SparklesIcon className="size-3.5 text-brand" />
            New: receipt photos, dark mode and 9 display currencies
            <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
          </Link>
          <button
            type="button"
            aria-label="Dismiss announcement"
            onClick={() => setShowBanner(false)}
            className="absolute top-1/2 right-3 -translate-y-1/2 rounded p-1 text-hero-foreground/70 hover:text-hero-foreground"
          >
            <XIcon className="size-3.5" />
          </button>
        </div>
      )}

      <header className="sticky top-0 z-30 border-b bg-background/75 backdrop-blur-lg">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 md:px-8">
          <Link to="/" aria-label="Spend Journal home">
            <Logo />
          </Link>
          <nav aria-label="Sections" className="hidden items-center gap-1 rounded-full border bg-card/60 p-1 text-sm md:flex">
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} className="rounded-full px-4 py-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                {l.label}
              </a>
            ))}
          </nav>
          <div className="flex items-center gap-1 sm:gap-2">
            <ThemeToggle />
            <Button variant="ghost" nativeButton={false} render={<Link to="/login" />}>
              Sign in
            </Button>
            <Button className="group hidden rounded-full sm:inline-flex" nativeButton={false} render={<Link to="/register" />}>
              Get started
              <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative isolate">
          <div className="pointer-events-none absolute -top-32 right-[-10%] -z-10 size-[34rem] animate-drift rounded-full bg-brand/20 blur-3xl" />
          <div className="pointer-events-none absolute top-40 left-[-15%] -z-10 size-[26rem] animate-drift rounded-full bg-success/10 blur-3xl [animation-delay:-8s]" />
          <div
            className="pointer-events-none absolute inset-0 -z-10 opacity-[0.35] [background-image:radial-gradient(var(--border)_1px,transparent_1px)] [background-size:22px_22px] [mask-image:linear-gradient(to_bottom,black,transparent_75%)]"
            aria-hidden="true"
          />
          <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 pt-14 pb-16 md:px-8 md:pt-20 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
            <div>
              <p className="inline-flex animate-fade-up items-center gap-2 rounded-full border bg-card/80 px-3 py-1 text-xs font-medium shadow-sm">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-success opacity-60" />
                  <span className="relative inline-flex size-2 rounded-full bg-success" />
                </span>
                Free personal money journal
              </p>
              <h1 className="mt-6 animate-fade-up text-5xl leading-[1.02] font-semibold tracking-tight text-balance [animation-delay:100ms] md:text-6xl lg:text-7xl">
                Your money, <Accent>finally</Accent> making sense.
              </h1>
              <p className="mt-6 max-w-lg animate-fade-up text-lg text-pretty text-muted-foreground [animation-delay:200ms]">
                Log income and expenses in seconds. Spend Journal turns them into live balances, clear trends and a tidy
                home for every receipt.
              </p>
              <div className="mt-8 flex animate-fade-up flex-wrap items-center gap-3 [animation-delay:300ms]">
                <Button size="lg" className="group h-12 rounded-full px-7 shadow-lg shadow-black/10" nativeButton={false} render={<Link to="/register" />}>
                  Create free account
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                </Button>
                <Button size="lg" variant="outline" className="h-12 rounded-full px-7" nativeButton={false} render={<Link to="/login" />}>
                  Sign in
                </Button>
              </div>
              <ul className="mt-8 flex animate-fade-up flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground [animation-delay:400ms]">
                {["Free to use", "Works on phone & laptop", "Private to you"].map((t) => (
                  <li key={t} className="inline-flex items-center gap-1.5">
                    <CheckIcon className="size-4 text-brand" />
                    {t}
                  </li>
                ))}
              </ul>
            </div>
            <div className="animate-fade-up [animation-delay:250ms]">
              <HeroJournal />
            </div>
          </div>
        </section>

        {/* Marquee of things you can track */}
        <section aria-label="Things you can track" className="border-y bg-card/60 py-4">
          <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-marquee gap-3 hover:[animation-play-state:paused]">
              {[...trackables, ...trackables].map((t, i) => (
                <span
                  key={i}
                  aria-hidden={i >= trackables.length}
                  className="inline-flex items-center gap-2 rounded-full border bg-background px-4 py-1.5 text-sm whitespace-nowrap text-muted-foreground"
                >
                  <span className="size-1.5 rounded-full bg-brand" />
                  {t}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Dashboard preview with floating notes */}
        <section className="mx-auto max-w-6xl px-4 pt-24 md:px-8">
          <Reveal className="mx-auto mb-12 max-w-2xl text-center">
            <Eyebrow>The dashboard</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Everything at a <Accent>glance</Accent>
            </h2>
          </Reveal>
          <Reveal delay={100} className="relative">
            <div className="pointer-events-none absolute inset-x-10 -top-6 bottom-10 rounded-[3rem] bg-brand/20 blur-3xl" />
            <div className="relative">
              <DashboardShowcase />
            </div>
            <FloatingNote
              className="absolute -top-5 -left-3 hidden animate-float md:flex lg:-left-10"
              icon={<ArrowDownLeftIcon className="size-4" />}
              title="Salary received"
              detail="Added to your income"
              tone="income"
            />
            <FloatingNote
              className="absolute top-1/2 -right-3 hidden animate-float [animation-delay:-3s] md:flex lg:-right-10"
              icon={<PaperclipIcon className="size-4" />}
              title="Receipt attached"
              detail="Groceries · 212 KB"
            />
            <FloatingNote
              className="absolute -bottom-6 left-1/4 hidden animate-float [animation-delay:-5s] md:flex"
              icon={<SparklesIcon className="size-4" />}
              title="38% saved"
              detail="Of income, kept"
            />
          </Reveal>
        </section>

        {/* Features */}
        <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-4 py-24 md:px-8">
          <Reveal className="mx-auto max-w-2xl text-center">
            <Eyebrow>Features</Eyebrow>
            <h2 className="mt-4 text-4xl font-semibold tracking-tight text-balance md:text-5xl">
              Everything you need, <Accent>nothing</Accent> you don't
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, body }, i) => (
              <Reveal
                key={title}
                delay={(i % 3) * 90}
                className="group rounded-3xl border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-brand/40 hover:shadow-xl hover:shadow-black/5"
              >
                <span className="flex size-11 items-center justify-center rounded-2xl bg-brand/15 text-brand transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6">
                  <Icon className="size-5" />
                </span>
                <h3 className="mt-5 text-lg font-semibold">{title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="scroll-mt-24 border-t">
          <div className="mx-auto grid max-w-6xl gap-10 px-4 py-24 md:px-8 lg:grid-cols-[1fr_1.4fr] lg:gap-16">
            <Reveal>
              <Eyebrow>FAQ</Eyebrow>
              <h2 className="mt-4 text-4xl font-semibold tracking-tight md:text-5xl">
                Questions, <Accent>answered</Accent>
              </h2>
              <p className="mt-4 flex items-center gap-2 text-muted-foreground">
                <ShieldCheckIcon className="size-4 text-brand" />
                Your data stays private to your account.
              </p>
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

        {/* Closing CTA */}
        <section className="mx-auto max-w-6xl px-4 pb-24 md:px-8">
          <Reveal className="relative isolate overflow-hidden rounded-[2rem] bg-hero px-6 py-14 text-hero-foreground md:px-14 md:py-16">
            <div className="pointer-events-none absolute -right-20 -bottom-24 -z-10 size-96 animate-drift rounded-full bg-brand/25 blur-3xl" />
            <Sparkle className="absolute top-8 right-10 size-16 animate-float text-brand md:size-24" />
            <Sparkle className="absolute top-28 right-32 size-8 animate-float text-brand/70 [animation-delay:-3s] md:right-40 md:size-12" />
            <div className="relative max-w-xl">
              <h2 className="text-4xl leading-tight font-semibold tracking-tight text-balance md:text-5xl">
                Start your spend journal <span className="text-brand">today.</span>
              </h2>
              <p className="mt-4 text-hero-foreground/70">Free, quick to set up, and ready on your phone and laptop.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  size="lg"
                  className="group h-12 rounded-full bg-brand px-7 text-brand-foreground hover:bg-brand/90"
                  nativeButton={false}
                  render={<Link to="/register" />}
                >
                  Create free account
                  <ArrowRightIcon className="transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="ghost"
                  className="h-12 rounded-full px-7 text-hero-foreground hover:bg-hero-foreground/10 hover:text-hero-foreground"
                  nativeButton={false}
                  render={<Link to="/login" />}
                >
                  I already have an account
                </Button>
              </div>
            </div>
          </Reveal>
        </section>
      </main>

      <footer className="border-t">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
            <Logo />
            <nav aria-label="Footer" className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted-foreground">
              {navLinks.map((l) => (
                <a key={l.href} href={l.href} className="transition-colors hover:text-foreground">{l.label}</a>
              ))}
              <Link to="/login" className="transition-colors hover:text-foreground">Sign in</Link>
              <a
                href="https://github.com/swathikn61/personal-finance-tracker-web"
                target="_blank"
                rel="noreferrer"
                className="transition-colors hover:text-foreground"
              >
                GitHub
              </a>
            </nav>
          </div>
          <div className="flex items-end gap-4 overflow-hidden border-t pt-8" aria-hidden="true">
            <LogoMark className="h-[clamp(3rem,9vw,7rem)]" />
            <p className="font-heading text-[clamp(3.5rem,11vw,9rem)] leading-[0.8] font-bold tracking-tighter lowercase select-none">
              spend journal
            </p>
          </div>
          <p className="py-6 text-xs text-muted-foreground">© {new Date().getFullYear()} Spend Journal</p>
        </div>
      </footer>
    </div>
  )
}
