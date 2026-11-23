import { Mail, Search, Terminal, UserPlus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Meter } from '@/components/ui/meter'
import { PLANS, fmtNum, nextPlan } from '@/data/plans'
import { PERIOD, SCENARIOS, dateFromToday, forecast } from '@/data/usage'
import { useStore } from '@/store'

export function MembersPage() {
  const { plan, openUpgrade } = useStore()
  const full = plan.users <= 1
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-8 pb-28">
      <h1 className="text-lg font-medium tracking-tight">Members</h1>
      <div className="mt-4 flex items-center gap-3">
        <div className="flex h-8 w-72 items-center gap-2 rounded-lg border px-2.5 text-sm text-muted-foreground"><Search className="size-4" /> Search members</div>
        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-muted-foreground tabular-nums">1 of {fmtNum(plan.users)} seats</span>
          <Button variant={full ? 'outline' : 'default'} onClick={() => full && openUpgrade('users')}><UserPlus /> {full ? 'Upgrade to invite' : 'Invite'}</Button>
        </div>
      </div>
      <Card className="mt-4">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{['Name', 'Email', 'Role', 'Status'].map((h, i) => <th key={h} className={`h-10 px-2 text-left font-medium ${i === 0 ? 'pl-4' : ''}`}>{h}</th>)}</tr></thead>
          <tbody>
            <tr><td className="p-2 pl-4 font-medium">Michelle Jean</td><td className="p-2 text-muted-foreground">you</td><td className="p-2">Admin</td><td className="p-2"><Badge variant="success">Active</Badge></td></tr>
          </tbody>
        </table>
      </Card>
      {full && (
        <p className="mt-3 text-xs text-muted-foreground">
          Free is a workspace for one. {nextPlan(plan.id).name} fits {fmtNum(nextPlan(plan.id).users)} people.{' '}
          <button onClick={() => openUpgrade('users')} className="font-medium text-primary hover:underline">See plans</button>
        </p>
      )}
    </div>
  )
}

export function SimpleSettingsPage({ title }: { title: string }) {
  return (
    <div className="mx-auto w-full max-w-3xl px-6 pt-8 pb-28">
      <h1 className="text-lg font-medium tracking-tight">{title}</h1>
      <Card className="mt-4 p-4 text-sm text-muted-foreground">Unchanged from today's app.</Card>
    </div>
  )
}

export function BucketsPage() {
  const { scenario } = useStore()
  return (
    <div className="mx-auto w-full max-w-6xl px-6 pt-8 pb-28">
      <h1 className="text-xl font-medium tracking-[-0.5px]">Buckets</h1>
      <p className="mt-1 text-sm text-muted-foreground">Store objects in S3-compatible buckets and make them queryable.</p>
      <Card className="mt-6">
        <table className="w-full text-sm">
          <thead><tr className="border-b">{['Bucket', 'Location', 'Objects', 'Status', 'Queries this month'].map((h, i) => <th key={h} className={`h-10 px-2 text-left font-medium ${i === 0 ? 'pl-4' : ''}`}>{h}</th>)}</tr></thead>
          <tbody>
            {scenario.byBucket.map((b) => (
              <tr key={b.name} className="border-b last:border-b-0">
                <td className="p-2 pl-4"><div className="font-mono font-medium">{b.name}</div><div className="text-xs text-muted-foreground">Smart bucket · Private</div></td>
                <td className="p-2">United States</td>
                <td className="p-2 tabular-nums">{b.storage}</td>
                <td className="p-2"><Badge variant="success">Healthy</Badge></td>
                <td className="p-2 tabular-nums">{b.queries}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  )
}

// What developers see where they actually work: API responses, the CLI, and email
export function OutsidePage() {
  // Always tells the Free plan story so the examples stay consistent
  const plan = PLANS.free
  const limit = plan.queries
  const next = nextPlan(plan.id)
  const close = 86
  const runOut = dateFromToday(forecast(SCENARIOS.close, limit).daysLeft)
  return (
    <div className="mx-auto w-full max-w-5xl px-6 pt-8 pb-28">
      <h1 className="text-xl font-medium tracking-[-0.5px]">Outside the app</h1>
      <p className="mt-1 max-w-2xl text-sm text-muted-foreground">
        Most developers hit limits from code, not from this dashboard. The same three moments (heads up, limit reached, way forward) show up where they work.
      </p>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Terminal className="size-4 text-muted-foreground" /> CLI at 80%</span>} meta="Printed once a day, after the result, to stderr" />
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">
{`$ graphon ask "What voltage does the APS-200 need?"

480 V three-phase [1]
[1] manuals/aps-200.pdf p.14

`}<span className="text-warning-text">{`! ${limit - close} queries left this month (${close}/${limit}, resets ${PERIOD.end})`}</span>{`
  `}<span className="text-primary">graphon usage</span>{`    see what's using them
  `}<span className="text-primary">graphon upgrade</span>{`  ${fmtNum(next.queries)}/mo on ${next.name}`}
          </pre>
        </Card>

        <Card>
          <CardHeader title={<span className="flex items-center gap-2"><Terminal className="size-4 text-muted-foreground" /> API at the limit</span>} meta={<Badge variant="destructive">429</Badge>} />
          <pre className="overflow-x-auto p-4 font-mono text-xs leading-5">
{`HTTP/1.1 429 Too Many Requests
X-Graphon-Quota-Limit: ${limit}
X-Graphon-Quota-Remaining: 0
X-Graphon-Quota-Reset: 2026-12-18T00:00:00Z

{
  "error": "quota_exceeded",
  "message": "Monthly query limit reached (${limit}/${limit} on ${plan.name}). Resets 2026-12-18T00:00:00Z.",
  "docs_url": "https://docs.graphon.ai/limits",
  "limit": "queries_per_month",
  "upgrade_url": "https://app.graphon.ai/upgrade?plan=${next.id}"
}`}
          </pre>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader title={<span className="flex items-center gap-2"><Mail className="size-4 text-muted-foreground" /> Email at 80%</span>} meta="To workspace admins" />
          <div className="grid gap-6 p-6 md:grid-cols-[1fr_260px]">
            <div className="text-sm">
              <div className="text-xs text-muted-foreground">Subject</div>
              <div className="font-medium">{limit - close} Graphon queries left this month</div>
              <div className="mt-4 space-y-3 leading-6">
                <p>Michelle Jean's workspace has {limit - close} of {limit} queries left. At this pace you'll run out around {runOut}, before your reset on {PERIOD.end}.</p>
                <p>Most of it came from the <span className="font-mono text-xs">staging-agent</span> key on <span className="font-mono text-xs">support-calls</span>.</p>
                <p>If you hit the limit, search, answer and research calls return 429 until the reset. Storage keeps working either way. {next.name} gives you {fmtNum(next.queries)} a month for ${next.monthly}.</p>
              </div>
              <div className="mt-5 flex gap-2">
                <Button>Get {fmtNum(next.queries)} queries</Button>
                <Button variant="outline">See usage</Button>
              </div>
            </div>
            <div className="rounded-xl border p-4 text-sm">
              <div className="text-xs text-muted-foreground">Queries this month</div>
              <div className="mt-1 text-2xl font-medium tabular-nums">{close} <span className="text-base font-normal text-warning-text">/ {limit}</span></div>
              <Meter value={close} max={limit} className="mt-2" />
              <div className="mt-2 text-xs text-muted-foreground">{next.name}: {fmtNum(next.queries)} a month for ${next.monthly}</div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
