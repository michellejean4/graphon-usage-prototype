import { Check, ChevronDown, CircleCheck, CreditCard, FileText, Minus } from 'lucide-react'
import { useState } from 'react'
import { costPerQuery } from '@/components/brand'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Meter } from '@/components/ui/meter'
import { ORDER, PLANS, fmtNum, fmtStorage, nextPlan, type PlanId } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

const PAID: PlanId[] = ['personal', 'team', 'business']
const ALL: PlanId[] = ['free', 'personal', 'team', 'business', 'enterprise']

const TAGLINE: Record<PlanId, string> = {
  free: 'Try it on your own data.',
  personal: 'For one developer shipping a real project.',
  team: 'For a team building on shared data.',
  business: 'For production workloads across a company.',
  enterprise: 'Your cloud, your terms, your security review.',
}

// Personal's own list is mostly the basics every plan has, so spell out what changes from Free
const CARD_FEATURES: Partial<Record<PlanId, string[]>> = {
  personal: ['Everything in Free', '5x the queries of Free', 'Invite up to 3 people', 'MCP server for coding agents'],
}

// Rows a developer scans before buying
const COMPARE: { label: string; get: (id: PlanId) => string | boolean }[] = [
  { label: 'Queries per month', get: (id) => fmtNum(PLANS[id].queries) },
  { label: 'Storage', get: (id) => fmtStorage(PLANS[id].storageGB) },
  { label: 'Members', get: (id) => fmtNum(PLANS[id].users) },
  { label: 'S3 compatible API', get: () => true },
  { label: 'Search, answer and research', get: () => true },
  { label: 'MCP server for coding agents', get: (id) => id !== 'free' },
  { label: 'Role based access control', get: (id) => ['team', 'business', 'enterprise'].includes(id) },
  { label: 'Workspace API keys and webhooks', get: (id) => ['team', 'business', 'enterprise'].includes(id) },
  { label: 'Support', get: (id) => ({ free: 'Docs', personal: 'Docs', team: 'Email', business: 'Priority', enterprise: 'Named contact' })[id] },
  { label: 'SSO, SCIM and audit logs', get: (id) => id === 'enterprise' },
]

export function BillingPage() {
  const { plan, scenario, used, limit, openUpgrade, go, wantsTeam } = useStore()
  const [yearly, setYearly] = useState(false)
  const rank = (id: PlanId) => ORDER.indexOf(id)
  // Next plan up; Team once someone has tried to invite teammates
  const recommended = wantsTeam && ORDER.indexOf('team') > ORDER.indexOf(plan.id) ? 'team' : nextPlan(plan.id).id
  const selected: PlanId = recommended
  const [showCompare, setShowCompare] = useState(false)
  const price = (m: number) => (yearly ? Math.round(((m * 10) / 12) * 100) / 100 : m)

  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-8 pb-28">
      <h1 className="text-lg font-medium tracking-tight">Billing</h1>
      <p className="mt-0.5 text-sm text-muted-foreground">Switch or cancel any time. Changes apply right away.</p>

      {/* Current plan: info left, stacked meters right, upgrade in a footer strip */}
      <Card className="mt-6 overflow-hidden">
        <div className="grid gap-8 p-6 md:grid-cols-[260px_1fr] md:items-center">
          <div>
            <div className="text-xs text-muted-foreground">Current plan</div>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-3xl font-semibold tracking-tight">{plan.name}</span>
              <span className="text-sm text-muted-foreground tabular-nums">${plan.monthly}/month</span>
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Usage resets {PERIOD.end}, 00:00 UTC</p>
            <button onClick={() => go('settings/usage')} className="mt-1 text-xs font-medium text-muted-foreground underline-offset-2 hover:text-foreground hover:underline">See detailed usage</button>
          </div>
          <dl className="space-y-4">
            {[
              { k: 'Queries this month', v: used, max: limit, t: `${used} / ${fmtNum(limit)}`, c: 'aqua' as const },
              { k: 'Storage', v: scenario.storageGB, max: plan.storageGB, t: `${scenario.storageGB} GB / ${fmtStorage(plan.storageGB)}`, c: 'mint' as const },
              { k: 'Members', v: 1, max: plan.users, t: `1 / ${fmtNum(plan.users)}`, c: 'coral' as const },
            ].map((m) => (
              <div key={m.k}>
                <dt className="flex justify-between text-sm"><span className="text-muted-foreground">{m.k}</span><span className="font-medium tabular-nums">{m.t}</span></dt>
                <Meter value={m.v} max={m.max} color={m.c} tone={m.k === 'Members' ? 'default' : undefined} className="mt-2" />
              </div>
            ))}
          </dl>
        </div>
        {rank(recommended) > rank(plan.id) && recommended !== 'enterprise' && (
          <div className="flex flex-wrap items-center justify-between gap-4 border-t bg-muted/40 px-6 py-4">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{PLANS[recommended].name}</span> gives you {PLANS[recommended].queries / plan.queries <= 10 ? `${Math.round(PLANS[recommended].queries / plan.queries)}x the queries` : `${fmtNum(PLANS[recommended].queries)} queries a month`} and room for {fmtNum(PLANS[recommended].users)} people.
            </p>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">Cancel anytime</span>
              <Button variant="upgrade" size="lg" onClick={() => openUpgrade(wantsTeam ? 'users' : used >= limit * 0.8 ? 'queries' : 'general')}>Upgrade to {PLANS[recommended].name}</Button>
            </div>
          </div>
        )}
      </Card>

      {/* Plans */}
      <div className="mt-12 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Plans</h2>
          <p className="mt-1 text-sm text-muted-foreground">Every plan includes the S3 compatible API, search, answers and research.</p>
        </div>
        <div className="flex items-center gap-2">
          {yearly && <span className="text-xs text-muted-foreground">2 months free</span>}
          <div className="flex rounded-lg bg-muted p-0.5 text-sm">
            {['Monthly', 'Yearly'].map((l, i) => (
              <button key={l} onClick={() => setYearly(i === 1)} className={cn('h-7 rounded-md px-2.5 text-muted-foreground', yearly === (i === 1) && 'bg-background text-foreground shadow-xs')}>{l}</button>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-4 md:grid-cols-3">
        {PAID.map((id) => {
          const p = PLANS[id]
          const isRec = id === recommended && rank(id) > rank(plan.id)
          const isSel = id === selected && rank(id) > rank(plan.id)
          const current = plan.id === id
          return (
            <div
              key={id}
              className={cn(
                'relative flex flex-col rounded-xl border bg-card p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-foreground/25 hover:shadow-lg',
                isSel && 'border-aqua-strong bg-aqua/[0.05] shadow-md ring-1 ring-aqua-strong hover:border-aqua-strong dark:bg-aqua/[0.07]',
              )}
            >
              {isRec && <span className="absolute -top-2.5 left-5 rounded-md bg-aqua px-2 py-0.5 text-xs font-medium text-[#111]">Recommended</span>}
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold">{p.name}</span>
                {id === 'business' && <span className="text-xs text-muted-foreground">Most popular</span>}
              </div>
              <p className="mt-1 min-h-10 text-sm text-muted-foreground">{TAGLINE[id]}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-4xl font-semibold tracking-tight tabular-nums">${price(p.monthly ?? 0)}</span>
                <span className="text-sm text-muted-foreground">/ month</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{costPerQuery(p.monthly ?? 0, p.queries)}{yearly ? `, $${(p.monthly ?? 0) * 10} billed yearly` : ''}</p>

              <dl className="mt-5 space-y-2 border-t pt-4 text-sm">
                {([
                  ['Queries / month', fmtNum(p.queries)],
                  ['Storage', fmtStorage(p.storageGB)],
                  ['Members', fmtNum(p.users)],
                ] as const).map(([k, v]) => (
                  <div key={k} className="flex justify-between">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium tabular-nums">{v}</dd>
                  </div>
                ))}
              </dl>

              <ul className="mt-4 flex-1 space-y-1.5 border-t pt-4 text-sm">
                {(CARD_FEATURES[id] ?? p.features).map((f) => (
                  <li key={f} className="flex gap-2"><Check className={cn('mt-0.5 size-4 shrink-0 transition-colors', isSel ? 'text-aqua-strong' : 'text-muted-foreground')} />{f}</li>
                ))}
              </ul>

              <div className="mt-5">
                {current ? (
                  <Button variant="outline" size="lg" className="w-full" disabled><CircleCheck /> Current plan</Button>
                ) : rank(id) < rank(plan.id) ? (
                  <Button variant="ghost" size="lg" className="w-full">Switch to {p.name}</Button>
                ) : (
                  <Button
                    size="lg"
                    variant={isSel ? 'upgrade' : 'outline'}
                    className={cn('w-full transition-all', !isSel && 'border-border bg-white text-[#111] shadow-xs hover:bg-white hover:shadow-md dark:border-white dark:bg-white dark:text-[#111] dark:hover:bg-white/90')}
                    onClick={() => { openUpgrade(id === 'team' && wantsTeam ? 'users' : 'general') }}
                  >
                    Upgrade to {p.name}
                  </Button>
                )}
              </div>
            </div>
          )
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">No commitment. Switch or cancel anytime, and new limits start right away.</p>

      {/* Enterprise: the top tier gets the most presence */}
      <section className="mt-4 overflow-hidden rounded-xl border border-[#1f1f1f] bg-[#0f0f10] text-white dark:border-white/15 dark:bg-[#161618]">
        <div className="grid gap-8 p-8 md:grid-cols-[1fr_1.3fr]">
          <div className="flex flex-col">
            <div className="text-sm font-medium text-aqua">Enterprise</div>
            <h3 className="mt-2 text-3xl font-semibold tracking-tight">Bring the whole data lake.</h3>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/60">
              Unlimited storage, queries and seats, deployed in Graphon cloud, your own VPC or on device. Built for security reviews.
            </p>
            <div className="mt-auto flex flex-wrap gap-3 pt-8">
              <button className="flex h-10 items-center rounded-lg bg-white px-4 text-sm font-medium text-[#111] transition-all hover:-translate-y-px hover:shadow-[0_6px_20px_-6px_rgba(255,255,255,.35)]">Contact sales</button>
              <button className="flex h-10 items-center rounded-lg border border-white/20 px-4 text-sm font-medium text-white transition-colors hover:border-white/40 hover:bg-white/5">Book a demo</button>
            </div>
          </div>
          <div>
            <div className="grid grid-cols-3 gap-px overflow-hidden rounded-lg border border-white/10 bg-white/10 text-center">
              {[['Unlimited', 'storage'], ['Unlimited', 'queries'], ['Unlimited', 'members']].map(([v, k]) => (
                <div key={k} className="bg-[#0f0f10] px-3 py-4 dark:bg-[#161618]">
                  <div className="text-lg font-semibold tracking-tight">{v}</div>
                  <div className="text-xs text-white/50">{k}</div>
                </div>
              ))}
            </div>
            <ul className="mt-6 grid gap-x-6 gap-y-2.5 text-sm text-white/85 sm:grid-cols-2">
              {['Everything in Business', 'SSO with SAML or OIDC', 'SCIM provisioning', 'SOC 2 Type II report', 'HIPAA with a BAA', 'Audit logs', 'Uptime SLA', 'Custom terms and invoicing', 'Named support contact', 'Security review and DPA'].map((f) => (
                <li key={f} className="flex gap-2"><Check className="mt-0.5 size-4 shrink-0 text-aqua" />{f}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Compare: behind a link so the page stays short */}
      <div className="mt-10 flex justify-center">
        <Button variant="outline" size="lg" onClick={() => setShowCompare((v) => !v)} aria-expanded={showCompare}>
          {showCompare ? 'Hide feature comparison' : 'Compare all features'}
          <ChevronDown className={cn('transition-transform', showCompare && 'rotate-180')} />
        </Button>
      </div>
      {showCompare && (
      <Card className="mt-4 overflow-hidden">
        <CardHeader title="Compare plans" />
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="h-10 px-2 pl-4 text-left font-medium" />
                {ALL.map((id) => (
                  <th key={id} className={cn('h-12 px-2 text-center font-medium', id === plan.id && 'bg-muted/50', id === selected && 'rounded-t-xl bg-aqua/5 shadow-[inset_2px_0_0_var(--aqua-strong),inset_-2px_0_0_var(--aqua-strong),inset_0_2px_0_var(--aqua-strong)]')}>
                    {PLANS[id].name}
                    {id === plan.id && <span className="block text-[11px] font-normal text-muted-foreground">Current</span>}
                    {id === recommended && <span className="block text-[11px] font-medium text-aqua-strong">Recommended</span>}{id === selected && id !== recommended && <span className="block text-[11px] font-medium text-aqua-strong">Selected</span>}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {COMPARE.map((r) => (
                <tr key={r.label} className="border-b last:border-b-0">
                  <td className="p-2 pl-4 text-muted-foreground">{r.label}</td>
                  {ALL.map((id) => {
                    const v = r.get(id)
                    return (
                      <td key={id} className={cn('p-2 text-center tabular-nums', id === plan.id && 'bg-muted/50', id === selected && 'bg-aqua/5 font-medium shadow-[inset_2px_0_0_var(--aqua-strong),inset_-2px_0_0_var(--aqua-strong)]')}>
                        {v === true ? <Check className={cn('mx-auto size-4', id === selected ? 'text-aqua-strong' : 'text-foreground')} /> : v === false ? <Minus className="mx-auto size-4 text-muted-foreground/50" /> : v}
                      </td>
                    )
                  })}
                </tr>
              ))}
              <tr>
                <td className="p-2 pl-4" />
                {ALL.map((id) => (
                  <td key={id} className={cn('p-3 text-center', id === plan.id && 'bg-muted/50', id === selected && 'rounded-b-xl bg-aqua/5 shadow-[inset_2px_0_0_var(--aqua-strong),inset_-2px_0_0_var(--aqua-strong),inset_0_-2px_0_var(--aqua-strong)]')}>
                    {id === selected && <Button variant="upgrade" className="w-full" onClick={() => openUpgrade('general')}>Upgrade</Button>}
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
      )}

      {/* Billing details + answers developers look for */}
      <div className="mt-6 grid gap-6 md:grid-cols-2 md:items-start">
        <Card>
          <CardHeader title="Billing details" />
          <div className="divide-y text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-muted-foreground"><CreditCard className="size-4" /> Payment method</span>
              <span>{plan.id === 'free' ? 'None yet' : 'Card ending 4242'}</span>
            </div>
            <div className="flex items-center justify-between px-4 py-3">
              <span className="flex items-center gap-2 text-muted-foreground"><FileText className="size-4" /> Invoices</span>
              <span>{plan.id === 'free' ? 'None yet' : <button className="text-primary hover:underline">View</button>}</span>
            </div>
          </div>
        </Card>
        <Card>
          <CardHeader title="Good to know" />
          <dl className="divide-y text-sm">
            {[
              ['What happens at a limit?', 'Search, answer and research calls return 429 until the reset. Storage keeps working.'],
              ['When do new limits start?', 'The moment you upgrade. Paused calls pick up straight away.'],
              ['Can I downgrade?', 'Any time. You keep the higher plan until the end of the period.'],
            ].map(([q, a]) => (
              <div key={q} className="px-4 py-3">
                <dt className="font-medium">{q}</dt>
                <dd className="mt-0.5 text-muted-foreground">{a}</dd>
              </div>
            ))}
          </dl>
        </Card>
      </div>
    </div>
  )
}
