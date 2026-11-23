import { ArrowUp, Ban, ChevronDown, Cylinder, Pencil } from 'lucide-react'
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { fmtNum, nextPlan } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

type Msg = { q: string; blocked: boolean; resumed?: boolean; n: number; planName: string; planLimit: number; nextName: string; nextQueries: number }

export function PlaygroundPage() {
  const { status, used, limit, plan, openUpgrade, go } = useStore()
  const [input, setInput] = useState('What voltage does the APS-200 charger need?')
  const [msgs, setMsgs] = useState<Msg[]>([])
  const left = Math.max(0, limit - used)
  const next = nextPlan(plan.id)

  // After an upgrade, anything that was blocked runs straight away
  useEffect(() => {
    if (status !== 'out') setMsgs((all) => (all.some((x) => x.blocked) ? all.map((x) => (x.blocked ? { ...x, blocked: false, resumed: true, n: used } : x)) : all))
  }, [status]) // eslint-disable-line react-hooks/exhaustive-deps

  const send = () => {
    if (!input.trim()) return
    setMsgs((m) => [...m, { q: input, blocked: status === 'out', n: used + 1, planName: plan.name, planLimit: limit, nextName: next.name, nextQueries: next.queries }])
    setInput('')
  }

  return (
    <div className="flex min-h-[calc(100vh-48px)]">
      <div className="w-51 shrink-0 border-r p-3">
        <Button variant="outline" size="lg" className="w-full justify-start"><Pencil /> New session</Button>
        <div className="mt-4 text-xs font-medium text-muted-foreground">Past sessions</div>
        <p className="mt-3 text-xs text-muted-foreground">Your sessions will appear here.</p>
      </div>
      <div className="flex flex-1 flex-col">
        <div className="flex items-center gap-2 border-b px-6 py-3 text-sm">
          <button className="flex items-center gap-1.5 rounded-lg border px-2.5 py-1"><Cylinder className="size-4 text-muted-foreground" /> support-calls <ChevronDown className="size-3.5 text-muted-foreground" /></button>
          <div className="flex rounded-lg bg-muted p-0.5 text-xs">
            {['Search', 'Answer', 'Research'].map((m, i) => <span key={m} className={cn('h-6 rounded-md px-2.5 leading-6 text-muted-foreground', i === 1 && 'bg-background text-foreground shadow-xs')}>{m}</span>)}
          </div>
        </div>

        <div className="mx-auto w-full max-w-2xl flex-1 space-y-6 px-6 pt-8 pb-28">
          {msgs.length === 0 && <p className="pt-16 text-center text-sm text-muted-foreground">Ask a question about your data. Answers cite where they came from.</p>}
          {msgs.map((m, i) => (
            <div key={i} className="space-y-3">
              <div className="ml-auto w-fit max-w-[80%] rounded-xl bg-muted px-3 py-2 text-sm">{m.q}</div>
              {m.blocked ? (
                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                  <div className="flex items-center gap-2 font-medium"><Ban className="size-4 text-destructive" /> This one didn't run</div>
                  <p className="mt-1 text-muted-foreground">
                    You've used all {m.planLimit} queries on {m.planName}. Upgrade to {m.nextName} for {fmtNum(m.nextQueries)} a month and it runs straight away, or it'll work again on {PERIOD.end}.
                  </p>
                  <div className="mt-3 flex gap-2">
                    <Button variant="upgrade" onClick={() => openUpgrade('queries')}>Upgrade and run it</Button>
                    <Button variant="outline" onClick={() => go('settings/usage')}>See usage</Button>
                  </div>
                </div>
              ) : (
                <div className="text-sm">
                  <p className="leading-6">
                    The APS-200 charger takes a <strong>480 V three-phase</strong> supply <sup className="text-primary">[1]</sup>. The training video adds that the breaker must be reset after any brownout <sup className="text-primary">[2]</sup>.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    <span className="rounded-md border px-2 py-1">[1] manuals/aps-200.pdf · p. 14</span>
                    <span className="rounded-md border px-2 py-1">[2] training/install.mp4 · 03:12</span>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground tabular-nums">{m.resumed ? `Ran after upgrading to ${plan.name} · ` : ''}1 query · {Math.min(m.n, limit)} of {fmtNum(limit)} used this month</p>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mx-auto w-full max-w-2xl px-6 pb-24">
          <div className={cn('rounded-xl border bg-card p-2', status === 'out' && 'opacity-90')}>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }}
              rows={2}
              placeholder="Ask anything about your data"
              className="w-full resize-none bg-transparent px-2 py-1 text-sm outline-none placeholder:text-muted-foreground"
            />
            <div className="flex items-center justify-between px-2">
              <span className={cn('text-xs text-muted-foreground tabular-nums', status === 'close' && 'text-warning-text', status === 'out' && 'text-destructive')}>
                {status === 'out' ? `0 queries left · resets ${PERIOD.end}` : status === 'close' ? `${left} queries left this month` : ''}
              </span>
              <Button size="icon" variant={status === 'out' ? 'secondary' : 'default'} onClick={send} aria-label="Send"><ArrowUp /></Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
