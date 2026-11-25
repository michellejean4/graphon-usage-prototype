import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { fmtNum, nextPlan } from '@/data/plans'
import { PERIOD, dateFromToday, forecast } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

// Information, not an ad: stays in the app's own style. Heads up at 80%, clear at 100%.
export function UsageBanner({ className }: { className?: string }) {
  const { route, status, used, limit, scenario, plan, go, openUpgrade, bannerDismissed, dismissBanner } = useStore()
  if (bannerDismissed) return null
  if (status === 'ok') return plan.id === 'free' ? <FreeNudge className={className} /> : null
  const f = forecast(scenario, limit)
  const next = nextPlan(plan.id)
  const out = status === 'out'
  const left = limit - used
  const early = f.daysLeft < PERIOD.resetsIn
  const weeks = PERIOD.resetsIn - f.daysLeft >= 10 ? 'two weeks' : `${PERIOD.resetsIn - f.daysLeft} days`

  return (
    <div
      role="status"
      className={cn(
        'flex flex-wrap items-center gap-4 rounded-xl border px-5 py-4 text-sm',
        out ? 'border-destructive/30 bg-destructive/5' : 'bg-card dark:bg-background',
        className,
      )}
    >
      <div className="min-w-0 flex-1 basis-72">
        <p className="font-medium">{out ? `Queries are paused until ${PERIOD.end}` : `${left} queries left this month`}</p>
        <p className="mt-0.5 text-muted-foreground">
          {out
            ? `Search, answer and research calls, including from the API, wait until then. Your ${scenario.objects.toLocaleString()} files are safe and storage still works.`
            : early
              ? `At this pace you'll run out ${dateFromToday(f.daysLeft)}, ${weeks} before your reset. ${next.name} gives you ${fmtNum(next.queries)} a month.`
              : `Resets ${PERIOD.end}. ${next.name} gives you ${fmtNum(next.queries)} a month.`}
        </p>
      </div>
      <div className="flex items-center gap-2 self-center">
        {route !== 'settings/usage' && <Button variant="outline" onClick={() => go('settings/usage')}>See usage</Button>}
        <Button variant="upgrade" onClick={() => openUpgrade('queries')}>{out ? `Resume now with ${next.name}` : `Get ${fmtNum(next.queries)} queries`}</Button>
        <button onClick={dismissBanner} aria-label="Dismiss" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Plenty left: one quiet line so people know paid plans exist
function FreeNudge({ className }: { className?: string }) {
  const { used, limit, plan, go, openUpgrade, dismissBanner } = useStore()
  const next = nextPlan(plan.id)
  return (
    <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border bg-card px-5 py-4 text-sm dark:bg-background', className)}>
      <p className="min-w-0 flex-1 text-muted-foreground">
        <span className="font-medium text-foreground">You're on Free.</span> {used} of {limit} queries used this month. {next.name} gives you {fmtNum(next.queries)} a month for ${next.monthly}.
      </p>
      <div className="flex items-center gap-2">
        <Button variant="outline" onClick={() => go('settings/billing')}>See plans</Button>
        <Button variant="upgrade" onClick={() => openUpgrade('general', next.id)}>Upgrade to {next.name}</Button>
        <button onClick={dismissBanner} aria-label="Dismiss" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}
