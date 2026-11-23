import { ArrowRight } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Building blocks for upgrade moments: headline, label, before/after compare, price call to action.

export function costPerQuery(monthly: number, queries: number) {
  const c = (monthly / queries) * 100
  if (c < 1) return 'under 1¢ a query'
  return `about ${Math.round(c)}¢ a query`
}

export function BrandLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('text-xs font-medium text-muted-foreground', className)}>{children}</div>
}

export function BrandHeadline({ children, className }: { children: ReactNode; className?: string }) {
  return <h2 className={cn('text-[28px] leading-[1.15] font-semibold tracking-[-0.6px] text-foreground', className)}>{children}</h2>
}

// Before → after rows with hairline rules.
export function BrandCompare({ rows, focus }: { rows: { key: string; label: string; from: string; to: string }[]; focus?: string }) {
  return (
    <div className="border-t border-border">
      {rows.map((r) => {
        const changed = r.from !== r.to
        return (
          <div key={r.key} className="flex items-baseline justify-between gap-4 border-b border-border py-3">
            <span className={cn('text-xs font-medium', r.key === focus ? 'text-foreground' : 'text-muted-foreground')}>{r.label}</span>
            <span className="flex items-baseline gap-3 tabular-nums">
              <span className={cn('text-sm text-muted-foreground', changed && 'line-through decoration-1')}>{r.from}</span>
              <ArrowRight className="size-3.5 self-center text-muted-foreground" />
              <span className={cn('text-xl leading-none font-semibold tracking-tight text-foreground', !changed && 'text-muted-foreground')}>{r.to}</span>
            </span>
          </div>
        )
      })}
    </div>
  )
}

// Price call to action. The whole block is the button.
export function BrandCTA({ title, sub, action = 'Upgrade', className, ...props }: { title: ReactNode; sub?: ReactNode; action?: string } & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn('bg-upgrade text-upgrade-foreground font-semibold shadow-xs transition-all hover:bg-upgrade-hover hover:shadow-md active:scale-[0.98] flex w-full items-center gap-4 px-5 py-[18px] text-left', className)} {...props}>
      <span className="min-w-0 flex-1">
        <span className="block text-lg leading-tight font-semibold tracking-tight">{title}</span>
        {sub && <span className="mt-0.5 block text-xs opacity-70">{sub}</span>}
      </span>
      <span className="flex h-10 shrink-0 items-center gap-1.5 rounded-lg bg-[#111] px-4 text-sm font-medium text-white">
        {action}
      </span>
    </button>
  )
}

export function BrandTabs<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="flex gap-4">
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={cn('text-xs font-medium pb-1', value === o.id ? 'border-b border-foreground text-foreground' : 'text-muted-foreground hover:text-foreground')}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}
