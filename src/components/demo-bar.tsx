import { Moon, RotateCcw, Sun } from 'lucide-react'
import { SCENARIOS, type ScenarioId } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'

// Prototype-only controls. Not part of the product design.
export function DemoBar() {
  const { scenarioId, setScenario, dark, setDark, planId, setPlan, route, go } = useStore()
  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex max-w-[calc(100vw-16px)] -translate-x-1/2 items-center gap-2 overflow-x-auto rounded-xl border bg-popover p-1.5 text-xs whitespace-nowrap shadow-lg">
      <span className="px-2 font-medium text-muted-foreground">Prototype</span>
      <div className="flex rounded-lg bg-muted p-0.5">
        {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
          <button
            key={id}
            onClick={() => setScenario(id)}
            className={cn('h-6 rounded-md px-2.5 font-medium text-muted-foreground', scenarioId === id && 'bg-background text-foreground shadow-xs')}
          >
            {SCENARIOS[id].label}
          </button>
        ))}
      </div>
      <button
        onClick={() => go(route === 'outside' ? 'home' : 'outside')}
        className={cn('h-7 rounded-md px-2.5 font-medium hover:bg-muted', route === 'outside' && 'bg-muted')}
      >
        Outside the app
      </button>
      {planId !== 'free' && (
        <button onClick={() => setPlan('free')} className="flex h-7 items-center gap-1 rounded-md px-2 font-medium hover:bg-muted" title="Back to Free plan">
          <RotateCcw className="size-3.5" /> Reset plan
        </button>
      )}
      <button onClick={() => setDark(!dark)} aria-label="Toggle theme" className="flex size-7 items-center justify-center rounded-md hover:bg-muted">
        {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
      </button>
    </div>
  )
}
