import { Check, Copy } from 'lucide-react'
import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

// Developers want the same numbers from code: CLI, API, and response headers
export function DevUsage({ className }: { className?: string }) {
  const { used, limit, plan, scenario } = useStore()
  const [tab, setTab] = useState<'cli' | 'api' | 'headers'>('cli')
  const [copied, setCopied] = useState(false)
  const left = Math.max(0, limit - used)

  const snippets = {
    cli: {
      cmd: 'graphon usage',
      out: `Plan        ${plan.name}
Queries     ${used} / ${limit}   (${left} left, resets 2026-12-18T00:00:00Z)
  search    ${scenario.queries.search}
  answer    ${scenario.queries.answer}
  research  ${scenario.queries.research}
Storage     ${scenario.storageGB} GB / ${plan.storageGB} GB
Members     1 / ${plan.users === Infinity ? 'unlimited' : plan.users}`,
    },
    api: {
      cmd: 'curl https://api.graphon.ai/v1/usage -H "Authorization: Bearer $GRAPHON_API_KEY"',
      out: `{
  "plan": "${plan.id}",
  "period": { "start": "2026-11-18T00:00:00Z", "reset": "2026-12-18T00:00:00Z" },
  "queries": { "used": ${used}, "limit": ${limit}, "remaining": ${left} },
  "storage_bytes": { "used": ${Math.round(scenario.storageGB * 1e9)}, "limit": ${plan.storageGB * 1e9} },
  "members": { "used": 1, "limit": ${plan.users === Infinity ? null : plan.users} }
}`,
    },
    headers: {
      cmd: '# Returned on every search, answer and research call',
      out: `X-Graphon-Quota-Limit: ${limit}
X-Graphon-Quota-Remaining: ${left}
X-Graphon-Quota-Reset: 2026-12-18T00:00:00Z`,
    },
  }
  const s = snippets[tab]

  const copy = () => {
    navigator.clipboard?.writeText(s.cmd).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Card className={cn('mt-6 min-w-0', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b px-4 py-3">
        <h2 className="text-sm font-medium">Check usage from code</h2>
        <div className="ml-auto flex rounded-lg bg-muted p-0.5 text-xs">
          {([['cli', 'CLI'], ['api', 'API'], ['headers', 'Headers']] as const).map(([id, l]) => (
            <button key={id} onClick={() => setTab(id)} className={cn('h-7 rounded-md px-3 font-medium text-muted-foreground', tab === id && 'bg-background text-foreground shadow-xs')}>
              {l}
            </button>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-2 border-b bg-muted/40 px-4 py-2 font-mono text-xs">
        <span className="text-muted-foreground">{tab === 'headers' ? '' : '$'}</span>
        <span className="min-w-0 flex-1 truncate">{s.cmd}</span>
        {tab !== 'headers' && (
          <button onClick={copy} aria-label="Copy command" className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
            {copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
          </button>
        )}
      </div>
      <pre className="overflow-x-auto px-4 py-3 font-mono text-xs leading-5 text-muted-foreground">{s.out}</pre>
    </Card>
  )
}
