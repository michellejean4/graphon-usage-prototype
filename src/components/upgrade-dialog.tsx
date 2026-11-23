import { Check, CreditCard } from 'lucide-react'
import { useEffect, useState } from 'react'
import { BrandHeadline, BrandLabel, costPerQuery } from '@/components/brand'
import { GraphonMark } from '@/components/logo'
import { Dialog } from '@/components/ui/dialog'
import { ORDER, PLANS, fmtNum, fmtStorage, nextPlan, type PlanId } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore, type UpgradeReason } from '@/store'

// Layout after Jitter's upgrade modal (plan preview left, decision right), styled in Graphon's brand.

function headline(reason: UpgradeReason, out: boolean, planName: string) {
  if (reason === 'users') return 'Bring your team in.'
  if (reason === 'queries' && out) return `Don't wait for ${PERIOD.end}.`
  if (reason === 'queries') return 'Keep the answers coming.'
  return `Room to grow past ${planName}.`
}

function sub(reason: UpgradeReason, out: boolean, t: { name: string; queries: number; users: number }) {
  if (reason === 'users') return `Free is a workspace for one. ${t.name} fits ${fmtNum(t.users)} people on the same data.`
  if (out) return 'The new limit starts the moment you upgrade. Paused calls pick up straight away.'
  return 'The new limit starts the moment you upgrade.'
}

function PlanCard({ id, cur }: { id: PlanId; cur: PlanId }) {
  const p = PLANS[id]
  const c = PLANS[cur]
  const x = Math.round(p.queries / c.queries)
  const gains = [
    `${fmtNum(p.queries)} queries a month${x > 1 ? ` (${x}x)` : ''}`,
    `${fmtNum(p.users)} members`,
    `${fmtStorage(p.storageGB)} storage`,
    ...p.features.filter((f) => !['S3 compatible API', 'Search', 'Answers', 'Research'].includes(f)),
  ].slice(0, 6)
  return (
    <div className="relative w-[260px]">
      {/* stacked cards behind hint at the other plans */}
      <div className="absolute inset-x-4 -bottom-3 top-3 rounded-xl border border-ink-line bg-card/70" />
      <div className="absolute inset-x-2 -bottom-1.5 top-1.5 rounded-xl border border-ink-line bg-card/85" />
      <div className="relative rounded-xl border bg-card p-5 text-card-foreground shadow-lg">
        <div className="text-sm font-semibold">{p.name}</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl leading-none font-semibold tracking-tight">${p.monthly}</span>
          <span className="text-xs leading-tight text-muted-foreground">per month<br />{costPerQuery(p.monthly ?? 0, p.queries)}</span>
        </div>
        <ul className="mt-5 space-y-2 border-t pt-4 text-sm">
          {gains.map((g, i) => (
            <li key={g} className="flex gap-2"><Check className={cn('mt-0.5 size-4 shrink-0', i === 0 ? 'text-foreground' : 'text-muted-foreground')} /><span className={cn(i === 0 && 'font-medium')}>{g}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function UpgradeDialog() {
  const { upgrade, closeUpgrade, plan, setPlan, status, go } = useStore()
  const [target, setTarget] = useState<PlanId>(nextPlan(plan.id).id)
  const [yearly, setYearly] = useState(false)
  const [done, setDone] = useState(false)
  const [wasOut, setWasOut] = useState(false)

  useEffect(() => {
    if (upgrade.open) {
      setTarget(upgrade.reason === 'users' && ORDER.indexOf('team') > ORDER.indexOf(plan.id) ? 'team' : nextPlan(plan.id).id)
      setYearly(false)
      setDone(false)
      setWasOut(status === 'out')
    }
  }, [upgrade.open]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = done ? ORDER[ORDER.indexOf(target) - 1] ?? 'free' : plan.id
  const t = PLANS[target]
  const price = t.monthly ?? 0
  const due = yearly ? price * 10 : price
  const options = ORDER.filter((id) => ORDER.indexOf(id) > ORDER.indexOf(cur) && id !== 'enterprise')
  const idx = options.indexOf(target)

  return (
    <Dialog open={upgrade.open} onClose={closeUpgrade} className="max-w-[880px] overflow-hidden">
      <div className="grid md:grid-cols-[1fr_400px]">
        {/* Left: plan preview on paper */}
        <div className="hidden flex-col items-center justify-center gap-6 bg-paper px-8 py-12 md:flex">
          <PlanCard id={target} cur={cur as PlanId} />
          <div className="mt-2 flex gap-1.5">
            {options.map((id, i) => (
              <button key={id} aria-label={PLANS[id].name} onClick={() => !done && setTarget(id)} className={cn('size-1.5 rounded-full', i === idx ? 'bg-aqua-strong' : 'bg-ink/25')} />
            ))}
          </div>
        </div>

        {/* Right: decision */}
        <div className="flex flex-col bg-popover p-8">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex size-5 items-center justify-center rounded-md border bg-background"><GraphonMark className="size-3" /></span>
            Michelle Jean's workspace
          </div>

          {!done ? (
            <>
              <BrandHeadline className="mt-5 text-[32px] text-foreground">{headline(upgrade.reason, wasOut, plan.name)}</BrandHeadline>
              <p className="mt-2 text-sm text-muted-foreground">{sub(upgrade.reason, wasOut, t)}</p>

              <div className="mt-6 flex rounded-lg bg-muted p-0.5 text-sm">
                {[...options, 'enterprise' as PlanId].map((id) => (
                  <button
                    key={id}
                    onClick={() => (id === 'enterprise' ? undefined : setTarget(id))}
                    className={cn('h-8 flex-1 rounded-md font-medium text-muted-foreground', target === id && 'bg-background text-foreground shadow-xs', id === 'enterprise' && 'cursor-default opacity-60')}
                  >
                    {PLANS[id].name}
                  </button>
                ))}
              </div>

              <div className="mt-4 divide-y rounded-xl border text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Billing cycle</span>
                  <div className="flex rounded-md bg-muted p-0.5 text-xs">
                    {['Monthly', 'Yearly'].map((l, i) => (
                      <button key={l} onClick={() => setYearly(i === 1)} className={cn('h-6 rounded px-2 font-medium text-muted-foreground', yearly === (i === 1) && 'bg-background text-foreground shadow-xs')}>
                        {l}{i === 1 && <span className="ml-1 text-muted-foreground">−17%</span>}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between px-4 py-3">
                  <div>
                    <div className="font-medium">Graphon {t.name}</div>
                    <div className="text-xs text-muted-foreground">${price} × {yearly ? '10 months, 2 free' : '1 month'}</div>
                  </div>
                  <span className="font-medium tabular-nums">${due}</span>
                </div>
                <div className="flex items-center justify-between px-4 py-3 text-muted-foreground">
                  <span className="flex items-center gap-2"><CreditCard className="size-4" /> Card ending 4242</span>
                  <button className="text-xs hover:text-foreground hover:underline">Change</button>
                </div>
              </div>

              <button
                onClick={() => { setPlan(target); setDone(true) }}
                className="gp-cta group mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium hover:-translate-y-px"
              >
                Upgrade to {t.name} · ${due}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Cancel any time.{' '}
                {wasOut ? <button onClick={closeUpgrade} className="underline underline-offset-2 hover:text-foreground">Or wait for {PERIOD.end}</button>
                  : <button onClick={() => { closeUpgrade(); go('settings/billing') }} className="underline underline-offset-2 hover:text-foreground">Compare all plans</button>}
                {' · '}Need SSO? <button className="underline underline-offset-2 hover:text-foreground">Talk to us</button>
              </p>
            </>
          ) : (
            <>
              <BrandLabel className="mt-5">Done</BrandLabel>
              <BrandHeadline className="mt-2 text-[32px] text-foreground">You're on {t.name}.</BrandHeadline>
              <p className="mt-2 text-sm text-muted-foreground">
                {fmtNum(t.queries)} queries a month and {fmtNum(t.users)} members, starting now.{wasOut ? ' Paused calls are already running again.' : ''}
              </p>
              <div className="mt-auto pt-10">
                <button onClick={closeUpgrade} className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:-translate-y-px hover:bg-primary/85 hover:shadow-md active:scale-[0.98]">Back to work</button>
                <button onClick={() => { closeUpgrade(); go('settings/usage') }} className="mt-3 w-full text-center text-xs text-muted-foreground underline underline-offset-2 hover:text-foreground">View usage</button>
              </div>
            </>
          )}
        </div>
      </div>
    </Dialog>
  )
}
