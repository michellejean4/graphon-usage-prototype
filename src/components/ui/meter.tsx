import { cn } from '@/lib/utils'

export type MeterTone = 'default' | 'warning' | 'destructive'

export function toneFor(pct: number): MeterTone {
  if (pct >= 100) return 'destructive'
  if (pct >= 80) return 'warning'
  return 'default'
}

// Same meter as Graphon's Billing page: h-2 rounded-full track at primary/15
export type MeterColor = 'aqua' | 'mint' | 'coral'
const FILL: Record<MeterColor, string> = { aqua: 'bg-aqua-strong', mint: 'bg-mint-strong', coral: 'bg-coral-strong' }

export function Meter({ value, max, tone, color = 'aqua', className, size = 'default' }: { value: number; max: number; tone?: MeterTone; color?: MeterColor; className?: string; size?: 'default' | 'sm' }) {
  const pct = max === Infinity ? 0 : Math.min(100, (value / max) * 100)
  const t = tone ?? toneFor(pct)
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max === Infinity ? undefined : max}
      className={cn('overflow-hidden rounded-full bg-foreground/8', size === 'sm' ? 'h-1' : 'h-2', className)}
    >
      <div
        className={cn('h-full rounded-full transition-[width] duration-500', t === 'destructive' ? 'bg-destructive' : FILL[color])}
        style={{ width: `${Math.max(pct, value > 0 ? 1.5 : 0)}%` }}
      />
    </div>
  )
}
