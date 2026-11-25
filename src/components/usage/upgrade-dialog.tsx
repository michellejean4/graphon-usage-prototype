import { CalendarDays, Check, CreditCard } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { BrandHeadline, BrandLabel, costPerQuery } from '@/components/usage/brand'
import { GraphonMark } from '@/components/logo'
import { Dialog } from '@/components/ui/dialog'
import { ORDER, PLANS, fmtNum, fmtStorage, nextPlan, type PlanId } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore, type UpgradeReason } from '@/store'

// Upgrade dialog: plan preview on the left, the decision on the right. Opens from every upgrade prompt.

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
      <div className="absolute inset-x-4 -bottom-3 top-3 rounded-xl border border-border bg-card/70" />
      <div className="absolute inset-x-2 -bottom-1.5 top-1.5 rounded-xl border border-border bg-card/85" />
      <div className="relative rounded-xl border bg-card p-5 text-card-foreground shadow-lg">
        <div className="text-sm font-semibold">{p.name}</div>
        <div className="mt-3 flex items-baseline gap-2">
          <span className="text-4xl leading-none font-semibold tracking-tight">${p.monthly}</span>
          <span className="text-xs leading-tight text-muted-foreground">per month<br />{costPerQuery(p.monthly ?? 0, p.queries)}</span>
        </div>
        <ul className="mt-5 space-y-2 border-t pt-4 text-sm">
          {gains.map((g, i) => (
            <li key={g} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-upgrade-text" /><span className={cn(i === 0 && 'font-medium')}>{g}</span></li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// Enterprise preview: what's included instead of a price
function EnterpriseCard() {
  const p = PLANS.enterprise
  return (
    <div className="relative w-[260px]">
      <div className="absolute inset-x-4 -bottom-3 top-3 rounded-xl border border-border bg-card/70" />
      <div className="absolute inset-x-2 -bottom-1.5 top-1.5 rounded-xl border border-border bg-card/85" />
      <div className="relative rounded-xl border bg-card p-5 text-card-foreground shadow-lg">
        <div className="text-sm font-semibold">Enterprise</div>
        <div className="mt-3 text-2xl leading-none font-semibold tracking-tight">Custom pricing</div>
        <div className="mt-1 text-xs text-muted-foreground">Based on your data and deployment</div>
        <div className="mt-4 grid grid-cols-3 gap-px overflow-hidden rounded-lg border bg-border text-center">
          {['storage', 'queries', 'members'].map((k) => (
            <div key={k} className="bg-card px-1 py-2"><div className="text-xs font-semibold">Unlimited</div><div className="text-[11px] text-muted-foreground">{k}</div></div>
          ))}
        </div>
        <ul className="mt-4 space-y-2 border-t pt-4 text-sm">
          {p.features.slice(1, 6).map((g) => (
            <li key={g} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-upgrade-text" />{g}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export function UpgradeDialog() {
  const { upgrade, closeUpgrade, plan, setPlan, status, go, used } = useStore()
  const [target, setTarget] = useState<PlanId>(nextPlan(plan.id).id)
  const [yearly, setYearly] = useState(false)
  const [done, setDone] = useState(false)
  const [wasOut, setWasOut] = useState(false)
  const [requested, setRequested] = useState(false)

  useEffect(() => {
    if (upgrade.open) {
      setTarget(upgrade.target && ORDER.indexOf(upgrade.target) > ORDER.indexOf(plan.id) ? upgrade.target : upgrade.reason === 'users' && ORDER.indexOf('team') > ORDER.indexOf(plan.id) ? 'team' : nextPlan(plan.id).id)
      setYearly(false)
      setDone(false)
      setRequested(false)
      setWasOut(status === 'out')
    }
  }, [upgrade.open]) // eslint-disable-line react-hooks/exhaustive-deps

  const cur = done ? ORDER[ORDER.indexOf(target) - 1] ?? 'free' : plan.id
  const t = PLANS[target]
  const price = t.monthly ?? 0
  const due = yearly ? price * 10 : price
  const options = ORDER.filter((id) => ORDER.indexOf(id) > ORDER.indexOf(cur))
  const ent = target === 'enterprise'

  return (
    <Dialog open={upgrade.open} onClose={closeUpgrade} className="max-w-[880px] overflow-hidden">
      <div className="grid md:min-h-[578px] md:grid-cols-[1fr_400px]">
        {/* Left: plan preview */}
        <div className="hidden flex-col items-center justify-center gap-6 bg-muted px-8 py-12 md:flex">
          {ent ? <EnterpriseCard /> : <PlanCard id={target} cur={cur as PlanId} />}
        </div>

        {/* Right: decision */}
        <div className="flex flex-col justify-center bg-popover p-8">
          <div className="flex items-center gap-2 text-xs font-medium">
            <span className="flex size-5 items-center justify-center rounded-md border bg-background"><GraphonMark className="size-3" /></span>
            Michelle's workspace
          </div>

          {ent ? (
            requested ? (
              <>
                <BrandLabel className="mt-5">Request sent</BrandLabel>
                <BrandHeadline className="mt-2 text-[26px] whitespace-nowrap text-foreground">We'll be in touch.</BrandHeadline>
                <p className="mt-2 text-sm text-muted-foreground">Our sales team will email you to set up a call. You can keep using {plan.name} in the meantime.</p>
                <div className="mt-auto pt-10">
                  <button onClick={closeUpgrade} className="flex h-10 w-full items-center justify-center rounded-lg bg-primary text-sm font-medium text-primary-foreground shadow-xs transition-all duration-150 hover:-translate-y-px hover:bg-primary/85 hover:shadow-md active:scale-[0.98]">Back to work</button>
                </div>
              </>
            ) : (
              <>
                <BrandHeadline className="mt-5 text-[26px] whitespace-nowrap text-foreground">Let's scope it together.</BrandHeadline>
                <p className="mt-2 text-sm text-muted-foreground">Enterprise is set up with our team, so it fits your data, your cloud and your security review.</p>

                <div className="mt-6 flex rounded-lg bg-muted p-0.5 text-sm">
                  {options.map((id) => (
                    <button key={id} onClick={() => setTarget(id)} className={cn('h-8 flex-1 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground', target === id && 'bg-background text-foreground shadow-xs')}>
                      {PLANS[id].name}
                    </button>
                  ))}
                </div>

                <div className="mt-4 rounded-xl border bg-background p-4 text-sm">
                  <div className="font-medium">How it works</div>
                  <ol className="mt-3 space-y-3">
                    {[
                      ['Talk to sales', 'A short call about your data, team size and where it needs to run.'],
                      ['Pick a deployment', 'Graphon cloud, your own VPC, or on device.'],
                      ['Security review and terms', 'SOC 2 report, DPA, SSO setup and custom invoicing.'],
                    ].map(([h, d], i) => (
                      <li key={h} className="flex gap-3">
                        <span className="flex size-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-medium tabular-nums">{i + 1}</span>
                        <div><div className="font-medium">{h}</div><div className="text-xs text-muted-foreground">{d}</div></div>
                      </li>
                    ))}
                  </ol>
                </div>

                <button onClick={() => setRequested(true)} className="bg-upgrade text-upgrade-foreground font-semibold shadow-xs transition-all hover:bg-upgrade-hover hover:shadow-md active:scale-[0.98] group mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium hover:-translate-y-px">
                  <CalendarDays className="size-4" /> Book a call with sales
                </button>
                <p className="mt-3 text-center text-xs text-muted-foreground">
                  Prefer email? <button onClick={() => setRequested(true)} className="underline underline-offset-2 hover:text-foreground">Contact sales</button>
                  {' · '}<button onClick={() => { closeUpgrade(); go('settings/billing') }} className="underline underline-offset-2 hover:text-foreground">Compare all plans</button>
                </p>
              </>
            )
          ) : !done ? (
            <>
              <BrandHeadline className="mt-5 text-[26px] whitespace-nowrap text-foreground">{headline(upgrade.reason, wasOut, plan.name)}</BrandHeadline>
              <p className="mt-2 text-sm text-muted-foreground">{sub(upgrade.reason, wasOut, t)}</p>

              <div className="mt-6 flex rounded-lg bg-muted p-0.5 text-sm">
                {options.map((id) => (
                  <button
                    key={id}
                    onClick={() => setTarget(id)}
                    className={cn('h-8 flex-1 rounded-md font-medium text-muted-foreground transition-colors hover:text-foreground', target === id && 'bg-background text-foreground shadow-xs')}
                  >
                    {PLANS[id].name}
                  </button>
                ))}
              </div>

              <div className="mt-4 divide-y rounded-xl border bg-background text-sm">
                <div className="flex items-center justify-between px-4 py-3">
                  <span>Billing cycle</span>
                  <div className="flex rounded-md bg-muted p-0.5 text-xs">
                    {['Monthly', 'Yearly'].map((l, i) => (
                      <button key={l} onClick={() => setYearly(i === 1)} className={cn('h-7 rounded-md px-2.5 font-medium text-muted-foreground', yearly === (i === 1) && 'bg-background text-foreground shadow-xs')}>
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
                className="bg-upgrade text-upgrade-foreground font-semibold shadow-xs transition-all hover:bg-upgrade-hover hover:shadow-md active:scale-[0.98] group mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-lg text-sm font-medium hover:-translate-y-px"
              >
                Upgrade to {t.name} · ${due}
              </button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Cancel any time.{' '}
                {wasOut ? <button onClick={closeUpgrade} className="underline underline-offset-2 hover:text-foreground">Or wait for {PERIOD.end}</button>
                  : <button onClick={() => { closeUpgrade(); go('settings/billing') }} className="underline underline-offset-2 hover:text-foreground">Compare all plans</button>}
                {' · '}Need SSO? <button onClick={() => setTarget('enterprise')} className="underline underline-offset-2 hover:text-foreground">Talk to us</button>
              </p>
            </>
          ) : (
            <>
              <DrawnCheck className="mt-6" />
              <BrandHeadline className="mt-4 text-[26px] whitespace-nowrap text-foreground">You're on {t.name}.</BrandHeadline>
              <p className="mt-2 text-sm text-muted-foreground">
                {fmtNum(t.queries)} queries a month and {fmtNum(t.users)} members, starting now.{wasOut ? ' Paused calls are already running again.' : ''}
              </p>
              <QueriesRefill used={used} from={PLANS[cur].queries} to={t.queries} className="mt-8" />
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

// Success: a green check that draws itself in
function DrawnCheck({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={cn('size-12 text-success', className)} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="24" cy="24" r="21" pathLength={1} className="gp-draw" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
      <path d="M15 24.5l6 6 12-13" pathLength={1} className="gp-draw [animation-delay:350ms]" style={{ strokeDasharray: 1, strokeDashoffset: 1 }} />
    </svg>
  )
}

// Success: queries left refill from the old plan's allowance to the new one
function QueriesRefill({ used, from, to, className }: { used: number; from: number; to: number; className?: string }) {
  const before = Math.max(0, from - used)
  const after = Math.max(0, to - used)
  const [left, setLeft] = useState(before)
  const [max, setMax] = useState(from)
  const raf = useRef(0)
  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = window.setTimeout(() => {
      setMax(to)
      if (reduce) { setLeft(after); return }
      const t0 = performance.now()
      const tick = (now: number) => {
        const k = Math.min(1, (now - t0) / 1200)
        const ease = 1 - Math.pow(1 - k, 3)
        setLeft(Math.round(before + (after - before) * ease))
        if (k < 1) raf.current = requestAnimationFrame(tick)
      }
      raf.current = requestAnimationFrame(tick)
    }, 600)
    return () => { window.clearTimeout(start); cancelAnimationFrame(raf.current) }
  }, [before, after, to])
  // Bar slides straight from the old share to the new one; the number counts up alongside
  const pct = Math.min(100, (max === from ? before / from : after / to) * 100)
  return (
    <div className={cn('rounded-xl border bg-background p-4', className)}>
      <div className="flex items-baseline justify-between text-sm">
        <span className="font-medium">Queries left this month</span>
        <span className="tabular-nums text-muted-foreground"><span className="font-semibold text-foreground">{fmtNum(left)}</span> / {fmtNum(max)}</span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-foreground/8">
        <div data-slot="meter-indicator" data-color="chart-1" className="h-full rounded-full bg-chart-1 transition-[width] duration-[1200ms] ease-out" style={{ width: `${Math.max(pct, 1.5)}%` }} />
      </div>
    </div>
  )
}
