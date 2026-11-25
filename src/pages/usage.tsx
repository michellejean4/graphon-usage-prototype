import { ArrowUpRight } from 'lucide-react'
import { useState, type ReactNode } from 'react'
import { BrandCTA, BrandCompare, BrandLabel, costPerQuery } from '@/components/usage/brand'
import { DevUsage } from '@/components/usage/dev-usage'
import { UsageBanner } from '@/components/usage/usage-banner'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Meter, toneFor, type MeterColor, type MeterTone } from '@/components/ui/meter'
import { Switch } from '@/components/ui/switch'
import { fmtNum, fmtStorage, nextPlan } from '@/data/plans'
import { PERIOD, dateFromToday, forecast } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

function MeterRow({ label, value, max, tone, color, valueText, note, noteTone, action }: { label: string; value: number; max: number; tone?: MeterTone; color?: MeterColor; valueText: string; note?: ReactNode; noteTone?: 'warn' | 'out'; action?: ReactNode }) {
  return (
    <div className="px-5 py-5">
      <div className="flex items-baseline justify-between gap-4 text-sm">
        <span className="font-medium">{label}</span>
        <span className="font-medium tabular-nums">{valueText}</span>
      </div>
      <Meter value={value} max={max} tone={tone} color={color} className="mt-3" />
      {(note || action) && (
        <div className="mt-3 flex items-center justify-between gap-4 text-xs">
          <span className={cn('text-muted-foreground', noteTone === 'warn' && 'text-warning-text', noteTone === 'out' && 'text-destructive')}>{note}</span>
          {action}
        </div>
      )}
    </div>
  )
}

// Cumulative queries this period, with the plan limit and a projection to the reset date
function PaceChart() {
  const { scenario, limit } = useStore()
  const f = forecast(scenario, limit)
  const W = 720, H = 180, pad = { l: 8, r: 8, t: 16, b: 22 }
  const cum: number[] = []
  scenario.daily.reduce((a, v, i) => (cum[i] = a + v), 0)
  const proj: number[] = []
  for (let d = cum.length; d < PERIOD.days; d++) proj.push(Math.round(cum[cum.length - 1] + f.perDay * (d - cum.length + 1)))
  const all = [...cum, ...proj]
  const top = Math.max(limit * 1.15, ...all)
  const bw = (W - pad.l - pad.r) / PERIOD.days
  const y = (v: number) => pad.t + (H - pad.t - pad.b) * (1 - Math.min(v, top) / top)
  const ly = y(limit)

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={`Queries used so far and projected to ${PERIOD.end}`}>
      {all.map((v, i) => {
        const isProj = i >= cum.length
        const over = v > limit
        return (
          <rect
            key={i}
            x={pad.l + i * bw + 1.5}
            y={y(v)}
            width={bw - 3}
            height={H - pad.b - y(v)}
            rx={2}
            className={cn(isProj ? (over ? 'fill-destructive/12' : 'fill-chart-1/18') : i === cum.length - 1 ? (over ? 'fill-destructive' : 'fill-chart-1') : over ? 'fill-destructive/60' : 'fill-foreground/15')}
          />
        )
      })}
      <line x1={pad.l} x2={W - pad.r} y1={ly} y2={ly} className="stroke-foreground/30" strokeDasharray="3 4" />
      <text x={W - pad.r} y={ly - 5} textAnchor="end" className="fill-muted-foreground text-[11px]">Limit {fmtNum(limit)}</text>
      <text x={pad.l} y={H - 6} className="fill-muted-foreground text-[11px]">{PERIOD.start}</text>
      <text x={pad.l + (cum.length - 0.5) * bw} y={H - 6} textAnchor="middle" className="fill-foreground text-[11px] font-medium">Today</text>
      <text x={W - pad.r} y={H - 6} textAnchor="end" className="fill-muted-foreground text-[11px]">Resets {PERIOD.end}</text>
    </svg>
  )
}

export function UsagePage() {
  const { plan, scenario, used, limit, status, go, openUpgrade, bannerDismissed } = useStore()
  const f = forecast(scenario, limit)
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  const membersMax = plan.users

  // The banner above already says when you'll run out, so the row doesn't repeat it
  const bannerShowing = status !== 'ok' && !bannerDismissed
  const queryNote =
    status === 'out'
      ? `Paused until ${PERIOD.end}. API calls return 429 quota_exceeded.`
      : f.daysLeft < PERIOD.resetsIn
        ? `At ~${f.perDay.toFixed(1)} a day you'll run out ${dateFromToday(f.daysLeft)}`
        : `On track. About ${f.projected} by ${PERIOD.end} at ~${f.perDay.toFixed(1)} a day`

  return (
    <div className="mx-auto w-full max-w-4xl px-6 pt-8 pb-28">
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Usage</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {plan.name} plan · {PERIOD.start} to {PERIOD.end} · resets in {PERIOD.resetsIn} days <span title="2026-12-18T00:00:00Z" className="cursor-help underline decoration-dotted underline-offset-2">(Dec 18, 00:00 UTC)</span>
          </p>
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => go('settings/billing')}>Billing</Button>
        </div>
      </div>

      {status !== 'ok' && <UsageBanner className="mt-8" />}

      <Card className="mt-8 divide-y">
        <MeterRow
          label="Queries this month"
          value={used}
          max={limit}
          valueText={`${used} of ${fmtNum(limit)}`}
          note={bannerShowing ? undefined : queryNote}
          noteTone={status === 'out' ? 'out' : status === 'close' ? 'warn' : undefined}
          action={<span className="text-muted-foreground tabular-nums">{scenario.queries.search} search · {scenario.queries.answer} answer · {scenario.queries.research} research</span>}
        />
        <MeterRow
          label="Storage"
          color="chart-2"
          value={scenario.storageGB}
          max={plan.storageGB}
          valueText={`${scenario.storageGB} GB of ${fmtStorage(plan.storageGB)}`}
          note={`${scenario.objects.toLocaleString()} objects in 2 buckets`}
        />
        <MeterRow
          label="Members"
          color="chart-3"
          tone="default"
          value={1}
          max={membersMax}
                    valueText={`1 of ${fmtNum(membersMax)}`}
          note={toneFor((1 / membersMax) * 100) !== 'default' ? 'Your plan is full. Upgrade to invite teammates.' : undefined}
          noteTone={toneFor((1 / membersMax) * 100) !== 'default' ? 'warn' : undefined}
          action={toneFor((1 / membersMax) * 100) !== 'default' && <button onClick={() => openUpgrade('users')} className="font-medium text-primary hover:underline">Add seats</button>}
        />
        <div className="grid grid-cols-2 divide-x text-sm">
          <div className="px-5 py-5"><div className="text-xs text-muted-foreground">Data in</div><div className="mt-2 font-medium tabular-nums">{scenario.dataInGB} GB</div><div className="mt-1.5 text-xs text-muted-foreground">No limit on your plan</div></div>
          <div className="px-5 py-5"><div className="text-xs text-muted-foreground">Data out</div><div className="mt-2 font-medium tabular-nums">{scenario.bytesOutGB} GB</div><div className="mt-1.5 text-xs text-muted-foreground">No limit on your plan</div></div>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Queries this period" meta={f.onTrack ? 'On track' : `Projected ${f.projected} by ${PERIOD.end}`} />
        <div className="p-4"><PaceChart /></div>
      </Card>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <BreakdownCard title="Queries by API key" total={used} rows={scenario.byKey.map((k) => ({ name: k.name, sub: k.kind, queries: k.queries }))} />
        <BreakdownCard title="Queries by bucket" total={used} rows={scenario.byBucket.map((b) => ({ name: b.name, sub: b.storage, queries: b.queries }))} />
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2">
        <UsageAlerts />

        <DevUsage className="mt-0" />
      </div>

      {!isTop && <NextPlanPromo />}
    </div>
  )
}

// Share of this period's queries, one row per key or bucket
function BreakdownCard({ title, total, rows }: { title: string; total: number; rows: { name: string; sub: string; queries: number }[] }) {
  return (
    <Card>
      <CardHeader title={title} />
      <table className="w-full text-sm">
        <tbody>
          {rows.map((r) => (
            <tr key={r.name} className="border-b last:border-b-0">
              <td className="p-2 pl-4"><div className="font-medium">{r.name}</div><div className="text-xs text-muted-foreground">{r.sub}</div></td>
              <td className="w-24 p-2"><div className="h-1 overflow-hidden rounded-full bg-foreground/10"><div className="h-full rounded-full bg-foreground/40" style={{ width: `${(r.queries / total) * 100}%` }} /></div></td>
              <td className="p-2 pr-4 text-right tabular-nums">{r.queries}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </Card>
  )
}

// Who gets told, and where, as usage climbs
function UsageAlerts() {
  const { go, openUpgrade } = useStore()
  const [alerts, setAlerts] = useState({ e80: true, e100: true, api: true })
  return (
  <Card>
    <CardHeader title="Usage alerts" meta="Sent to workspace admins" />
    <div className="divide-y text-sm">
      {([
        ['e80', 'Email at 80% of any limit'],
        ['e100', 'Email when a limit is reached'],
        ['api', 'Warn in CLI and API responses'],
      ] as const).map(([k, l]) => (
        <label key={k} className="flex items-center justify-between px-4 py-3">
          {l}
          <Switch checked={alerts[k]} onChange={(v) => setAlerts({ ...alerts, [k]: v })} label={l} />
        </label>
      ))}
    </div>
    <div className="flex items-center justify-between border-t px-4 py-3 text-sm">
      <span>Webhook at 80% and 100% <span className="text-xs text-muted-foreground">· on Team</span></span>
      <button onClick={() => openUpgrade('general')} className="text-xs font-medium text-primary hover:underline">Unlock</button>
    </div>
    <button onClick={() => go('outside')} className="flex items-center gap-1 px-4 pb-3 text-xs text-muted-foreground hover:text-foreground">
      See what these look like <ArrowUpRight className="size-3" />
    </button>
  </Card>
  )
}

// What the next plan up adds
function NextPlanPromo() {
  const { plan, status, go, openUpgrade } = useStore()
  const next = nextPlan(plan.id)
  return (
    <section className="mt-6 grid gap-8 rounded-xl border bg-muted p-8 text-foreground md:grid-cols-[1fr_340px] md:items-end">
      <div>
        <BrandLabel>When you outgrow {plan.name}</BrandLabel>
        <h3 className="mt-2 text-[28px] leading-[1.15] font-semibold tracking-[-0.6px]">
          {Math.round(next.queries / plan.queries)}x the queries for ${next.monthly} a month.
        </h3>
        <div className="mt-6">
          <BrandCompare
            rows={[
              { key: 'queries', label: 'Queries / month', from: fmtNum(plan.queries), to: fmtNum(next.queries) },
              { key: 'users', label: 'Members', from: fmtNum(plan.users), to: fmtNum(next.users) },
              { key: 'storage', label: 'Storage', from: fmtStorage(plan.storageGB), to: fmtStorage(next.storageGB) },
            ].filter((r) => r.from !== r.to)}
          />
        </div>
      </div>
      <div>
        <p className="text-base leading-6 text-muted-foreground">The new limit starts the moment you upgrade. Switch or cancel any time.</p>
        <BrandCTA className="mt-5" title={`$${next.monthly}/month`} sub={costPerQuery(next.monthly ?? 0, next.queries)} action={`Upgrade to ${next.name}`} onClick={() => openUpgrade(status === 'ok' ? 'general' : 'queries')} />
        <button onClick={() => go('settings/billing')} className="mt-3 text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">Compare all plans</button>
      </div>
    </section>
  )
}
