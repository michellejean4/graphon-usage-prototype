import { KeyRound, Plus } from 'lucide-react'
import { BarChart } from '@/components/usage/bar-chart'
import { UsageBanner } from '@/components/usage/usage-banner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Meter, type MeterColor } from '@/components/ui/meter'
import { fmtNum, fmtStorage } from '@/data/plans'
import { dateFromToday } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

function Stat({ label, value, of, sub, meter, tone, onClick }: { label: string; value: string; of?: string; sub: string; meter?: { v: number; max: number; color?: MeterColor }; tone?: 'warn' | 'out'; onClick?: () => void }) {
  return (
    <button onClick={onClick} className={cn('flex flex-col rounded-xl border bg-card px-5 py-4 text-left', onClick && 'hover:bg-muted/40')}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-2 text-2xl font-medium tracking-tight tabular-nums">
        {value}
        {of && <span className={cn('text-base font-normal text-muted-foreground', tone === 'warn' && 'text-warning-text', tone === 'out' && 'text-destructive')}> / {of}</span>}
      </dd>
      {meter && <Meter value={meter.v} max={meter.max} color={meter.color} size="sm" className="mt-3" />}
      <dd className="mt-3 text-xs text-muted-foreground">{sub}</dd>
    </button>
  )
}

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Good morning' : h < 18 ? 'Good afternoon' : 'Good evening'
}

export function HomePage() {
  const { scenario, plan, used, limit, status, go } = useStore()
  const days = Array.from({ length: 7 }, (_, i) => dateFromToday(i - 6))
  const last7 = scenario.daily.slice(-7)

  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-28">
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="text-xl font-medium tracking-[-0.5px]">{greeting()}, Michelle</h1>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost"><KeyRound /> Create API key</Button>
          <Button variant={status === 'ok' ? 'default' : 'outline'}><Plus /> New bucket</Button>
        </div>
      </div>

      <UsageBanner className="mt-6" />

      <dl className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Queries this month"
          value={String(used)}
          of={fmtNum(limit)}
          tone={status === 'close' ? 'warn' : status === 'out' ? 'out' : undefined}
          meter={{ v: used, max: limit }}
          sub={`${scenario.queries.search} search · ${scenario.queries.answer} answer · ${scenario.queries.research} research`}
          onClick={() => go('settings/usage')}
        />
        <Stat
          label="Stored"
          value={`${scenario.storageGB} GB`}
          of={fmtStorage(plan.storageGB)}
          meter={{ v: scenario.storageGB, max: plan.storageGB, color: 'chart-2' }}
          sub="in 2 buckets"
          onClick={() => go('settings/usage')}
        />
        <Stat label="Searchable files" value={scenario.objects.toLocaleString()} sub={`of ${scenario.objects.toLocaleString()} in indexed buckets`} />
        <Stat label="Storage requests · 7 days" value={String(Math.round(scenario.objects * 0.4))} sub="reads, writes, and deletes" />
      </dl>

      <Card className="mt-6">
        <CardHeader title="Buckets" meta="2 buckets" />
        <div className="overflow-x-auto">
        <table className="w-full text-sm whitespace-nowrap">
          <thead>
            <tr className="border-b">
              <th className="h-10 px-2 pl-4 text-left font-medium">Bucket</th>
              <th className="h-10 px-2 text-left font-medium">Search</th>
              <th className="h-10 px-2 text-right font-medium">Queries this month</th>
              <th className="h-10 px-2 pr-4 text-right font-medium">Stored</th>
            </tr>
          </thead>
          <tbody>
            {scenario.byBucket.map((b) => (
              <tr key={b.name} className="border-b last:border-b-0 hover:bg-muted/50">
                <td className="p-2 pl-4 font-medium"><button onClick={() => go('buckets')} className="hover:underline">{b.name}</button></td>
                <td className="p-2"><Badge variant="success">Searchable</Badge></td>
                <td className="p-2 text-right tabular-nums">{b.queries}</td>
                <td className="p-2 pr-4 text-right tabular-nums">{b.storage}</td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </Card>

      <Card className="mt-6">
        <CardHeader title="Activity" meta={<div className="flex gap-1"><span className="rounded-md bg-secondary px-2 py-0.5 text-xs text-foreground">7 days</span><span className="px-2 py-0.5 text-xs">30 days</span></div>} />
        <div className="grid lg:grid-cols-[1fr_auto]">
          <figure className="p-4">
            <figcaption className="mb-4 flex justify-between text-xs text-muted-foreground"><span>Queries per day</span><span className="tabular-nums">{last7.reduce((a, b) => a + b, 0)} this week</span></figcaption>
            <BarChart data={last7} labels={days} />
          </figure>
          <dl className="grid grid-cols-2 border-t text-sm lg:w-96 lg:border-t-0 lg:border-l">
            <div className="border-r border-b px-4 py-3"><dt className="text-xs text-muted-foreground">Search p95</dt><dd className="mt-1 font-medium">420 ms</dd></div>
            <div className="border-b px-4 py-3"><dt className="text-xs text-muted-foreground">Answer p95</dt><dd className="mt-1 font-medium">2.1 s</dd></div>
            <div className="border-r px-4 py-3"><dt className="text-xs text-muted-foreground">Bytes out</dt><dd className="mt-1 font-medium">{scenario.bytesOutGB} GB</dd></div>
            <div className="px-4 py-3">
              <dt className="text-xs text-muted-foreground">Failed calls</dt>
              <dd className="mt-1 font-medium">{status === 'out' ? <span className="text-destructive">14 <span className="text-xs font-normal">429 quota</span></span> : '0'}</dd>
            </div>
          </dl>
        </div>
      </Card>
    </div>
  )
}
