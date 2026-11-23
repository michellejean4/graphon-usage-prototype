import { cn } from '@/lib/utils'

/*
  Meter: a usage bar. Not part of shadcn's default set (closest is Progress), built in the same style.
  color uses the theme's chart tokens: chart-1 queries, chart-2 storage, chart-3 members.
  In dark mode the fill becomes a gradient (see index.css, [data-slot="meter-indicator"]).
  At 100% it turns destructive, unless tone="default" (used for members, where full is normal).
*/
export type MeterTone = 'default' | 'warning' | 'destructive'
export type MeterColor = 'chart-1' | 'chart-2' | 'chart-3' | 'muted'

export function toneFor(pct: number): MeterTone {
  if (pct >= 100) return 'destructive'
  if (pct >= 80) return 'warning'
  return 'default'
}

const FILL: Record<MeterColor, string> = { 'chart-1': 'bg-chart-1', 'chart-2': 'bg-chart-2', 'chart-3': 'bg-chart-3', muted: 'bg-foreground/30' }

export function Meter({ value, max, tone, color = 'chart-1', className, size = 'default' }: { value: number; max: number; tone?: MeterTone; color?: MeterColor; className?: string; size?: 'default' | 'sm' }) {
  const pct = max === Infinity ? 0 : Math.min(100, (value / max) * 100)
  const t = tone ?? toneFor(pct)
  const destructive = t === 'destructive'
  return (
    <div
      data-slot="meter"
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max === Infinity ? undefined : max}
      className={cn('overflow-hidden rounded-full bg-foreground/8', size === 'sm' ? 'h-1' : 'h-2', className)}
    >
      <div
        data-slot="meter-indicator"
        data-color={destructive ? undefined : color}
        className={cn('h-full rounded-full transition-[width] duration-500', destructive ? 'bg-destructive' : FILL[color])}
        style={{ width: `${Math.max(pct, value > 0 ? 1.5 : 0)}%` }}
      />
    </div>
  )
}
