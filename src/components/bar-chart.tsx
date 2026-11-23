import { useState } from 'react'
import { cn } from '@/lib/utils'

// Quiet bars: grey by default, only the highlighted bar gets colour. Faint gridlines, value on hover.
export function BarChart({ data, labels, highlight, unit = '', height = 120 }: { data: number[]; labels: string[]; highlight?: number; unit?: string; height?: number }) {
  const [hover, setHover] = useState<number | null>(null)
  const max = Math.max(...data, 1)
  const step = max <= 10 ? 5 : max <= 40 ? 10 : max <= 100 ? 25 : 50
  const top = Math.ceil(max / step) * step
  const ticks = Array.from({ length: top / step + 1 }, (_, i) => i * step)
  const hi = highlight ?? data.length - 1

  return (
    <div className="flex gap-3">
      <div className="relative w-6 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="absolute right-0 -translate-y-1/2" style={{ top: height - (t / top) * height }}>{t}</span>
        ))}
      </div>
      <div className="min-w-0 flex-1">
        <div className="relative" style={{ height }}>
          {ticks.map((t) => (
            <div key={t} className={cn('absolute inset-x-0 border-t', t === 0 ? 'border-border' : 'border-dashed border-border/70')} style={{ top: height - (t / top) * height }} />
          ))}
          <div className="absolute inset-0 flex items-end gap-2 px-1">
            {data.map((v, i) => (
              <div
                key={i}
                className="group relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
              >
                {hover === i && (
                  <div className="pointer-events-none absolute z-10 -translate-y-2 rounded-md border bg-popover px-2 py-1 text-xs whitespace-nowrap shadow-sm" style={{ bottom: (v / top) * height }}>
                    <span className="font-medium tabular-nums">{v}{unit}</span> <span className="text-muted-foreground">{labels[i]}</span>
                  </div>
                )}
                <div
                  className={cn(
                    'w-full max-w-7 rounded-t-[3px] transition-colors',
                    i === hi ? 'bg-aqua-strong' : 'bg-foreground/12 group-hover:bg-foreground/25',
                  )}
                  style={{ height: v ? Math.max(2, (v / top) * height) : 0 }}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 flex gap-2 px-1">
          {labels.map((l, i) => (
            <span key={i} className={cn('flex-1 text-center text-[11px] text-muted-foreground', i === hi && 'font-medium text-foreground')}>{i === hi ? 'Today' : l}</span>
          ))}
        </div>
      </div>
    </div>
  )
}
