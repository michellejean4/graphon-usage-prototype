import { Meter } from '@/components/ui/meter'
import { fmtNum } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { useCollapsed } from './sidebar-state'

// NEW: plan + usage, always visible at the bottom of the sidebar
export function PlanCard() {
  const { plan, used, limit, status, go, openUpgrade } = useStore()
  const collapsed = useCollapsed()
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  if (collapsed) {
    // Small usage ring keeps the limit visible when the sidebar is collapsed
    const C = 2 * Math.PI * 9
    return (
      <button onClick={() => go('settings/usage')} title={`${plan.name} plan · ${used} of ${fmtNum(limit)} queries used`} aria-label="Usage" className="mx-auto flex size-10 items-center justify-center rounded-md hover:bg-sidebar-accent">
        <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" className="stroke-foreground/10" />
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${C * Math.min(1, used / limit)} ${C}`} className={status === 'out' ? 'stroke-destructive' : 'stroke-chart-1'} />
        </svg>
      </button>
    )
  }
  return (
    <div className="rounded-xl border bg-card p-3 text-xs">
      <button onClick={() => go('settings/usage')} className="block w-full text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium">{plan.name} plan</span>
          <span className={cn('tabular-nums text-muted-foreground', status === 'close' && 'text-warning-text', status === 'out' && 'text-destructive')}>
            {used} / {fmtNum(limit)}
          </span>
        </div>
        <Meter value={used} max={limit} size="sm" className="mt-2.5" />
        <div className="mt-2.5 text-muted-foreground">
          {status === 'out' ? `Queries paused until ${PERIOD.end}` : `${fmtNum(limit - used)} queries left · resets ${PERIOD.end}`}
        </div>
      </button>
      {!isTop && (
        <button onClick={() => openUpgrade(status === 'ok' ? 'general' : 'queries')} className="mt-2 font-medium text-primary hover:underline">
          Get more
        </button>
      )}
    </div>
  )
}
