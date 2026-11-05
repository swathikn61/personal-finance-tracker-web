import { cn } from "@/lib/utils"

// SJ monogram: an S built from two half-circle strokes, a J with a hooked base, and a gold dot
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 2 85 70" className={cn("h-9 w-auto shrink-0", className)} role="img" aria-label="Spend Journal">
      <g fill="none" stroke="var(--foreground)" strokeWidth="10">
        <path d="M22.5 8A14.25 14.25 0 0 0 22.5 36.5A14.25 14.25 0 0 1 22.5 65" />
        <path d="M79.5 8.5V50.5A14.5 14.5 0 0 1 50.5 50.5" />
      </g>
      <circle cx="62.5" cy="18.5" r="8" fill="var(--brand)" />
    </svg>
  )
}

function Wordmark({ className }: { className?: string }) {
  return (
    <div className={cn("font-bold leading-[0.95] tracking-tight lowercase", className)}>
      <div>spend</div>
      <div>journal</div>
    </div>
  )
}

export function Logo({ className, size = "md" }: { className?: string; size?: "md" | "lg" }) {
  if (size === "lg") {
    return (
      <div className={cn("flex flex-col items-center gap-5", className)}>
        <LogoMark className="h-16" />
        <Wordmark className="text-3xl" />
      </div>
    )
  }
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <LogoMark />
      <Wordmark className="text-[15px]" />
    </div>
  )
}
