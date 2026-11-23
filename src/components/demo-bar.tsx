import { useEffect, useRef, useState } from 'react'
import { ChevronDown, Moon, RotateCcw, SlidersHorizontal, Sun, X } from 'lucide-react'
import { SCENARIOS, type ScenarioId } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore, type Route } from '@/store'

const SEEN = 'gp-intro-seen'
const seen = () => { try { return sessionStorage.getItem(SEEN) === '1' } catch { return false } }
const markSeen = () => { try { sessionStorage.setItem(SEEN, '1') } catch { /* ignore */ } }

// Prototype-only controls. Not part of the product design.
export function DemoBar() {
  const { scenarioId, setScenario, dark, setDark, planId, setPlan, route, go } = useStore()
  const [intro, setIntro] = useState(() => !seen())
  const [hidden, setHidden] = useState(false)
  const lastInApp = useRef<Route>(route === 'outside' ? 'home' : route)
  useEffect(() => { if (route !== 'outside') lastInApp.current = route }, [route])

  const closeIntro = () => { setIntro(false); markSeen() }
  const pickScenario = (id: ScenarioId) => {
    setScenario(id)
    if (route === 'outside') go(lastInApp.current)
  }

  if (hidden) {
    return (
      <button
        onClick={() => setHidden(false)}
        className="fixed bottom-4 left-1/2 z-40 flex h-8 -translate-x-1/2 items-center gap-1.5 rounded-lg px-3 text-xs font-medium hover:bg-background/70 border border-foreground/15 bg-background/55 text-foreground shadow-xl backdrop-blur-xl backdrop-saturate-150"
      >
        <SlidersHorizontal className="size-3.5" /> Prototype controls
      </button>
    )
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-40 flex w-max max-w-[calc(100vw-16px)] -translate-x-1/2 flex-col items-center gap-3">
      {intro && (
        <div role="dialog" aria-label="About this prototype" className="relative w-80 max-w-full rounded-xl bg-upgrade p-4 text-sm text-white shadow-2xl">
          <button onClick={closeIntro} aria-label="Close" className="absolute top-3 right-3 flex size-6 items-center justify-center rounded-md text-white/80 hover:bg-white/15 hover:text-white">
            <X className="size-4" />
          </button>
          <p className="pr-6 font-semibold">This bar is for the prototype only</p>
          <p className="mt-2 text-white/90">
            It isn't part of the product. Use it to switch between usage states, see what developers get in the CLI, API and email, and change light and dark mode. Hide it with the arrow on the right.
          </p>
          <button onClick={closeIntro} className="mt-4 h-7 rounded-md bg-white px-3 text-xs font-semibold text-[#0d1117] hover:bg-white/90">Got it</button>
          <span aria-hidden className="absolute -bottom-[5px] left-1/2 size-3 -translate-x-1/2 rotate-45 bg-upgrade" />
        </div>
      )}
      <div className="flex max-w-full items-center gap-2 overflow-x-auto rounded-xl p-1.5 text-xs whitespace-nowrap border border-foreground/15 bg-background/55 text-foreground shadow-xl backdrop-blur-xl backdrop-saturate-150">
        <span className="flex items-center gap-1.5 px-2 font-semibold"><SlidersHorizontal className="size-3.5" /> Prototype</span>
        <div className="flex rounded-lg bg-foreground/8 p-0.5">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => (
            <button
              key={id}
              onClick={() => pickScenario(id)}
              className={cn('h-7 rounded-md px-3 font-medium text-muted-foreground hover:text-foreground', route !== 'outside' && scenarioId === id && 'bg-foreground text-background shadow-xs hover:text-background')}
            >
              {SCENARIOS[id].label}
            </button>
          ))}
        </div>
        <button
          onClick={() => go(route === 'outside' ? lastInApp.current : 'outside')}
          className={cn('h-7 rounded-md px-2.5 font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground', route === 'outside' && 'bg-foreground text-background hover:bg-foreground hover:text-background')}
        >
          Outside the app
        </button>
        {planId !== 'free' && (
          <button onClick={() => setPlan('free')} className="flex h-7 items-center gap-1 rounded-md px-3 font-medium text-muted-foreground hover:bg-foreground/10 hover:text-foreground" title="Back to Free plan">
            <RotateCcw className="size-3.5" /> Reset plan
          </button>
        )}
        <button onClick={() => setDark(!dark)} aria-label="Toggle theme" title={dark ? 'Light mode' : 'Dark mode'} className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground">
          {dark ? <Sun className="size-4" /> : <Moon className="size-4" />}
        </button>
        <span className="h-4 w-px bg-foreground/15" />
        <button onClick={() => { setHidden(true); if (intro) closeIntro() }} aria-label="Hide prototype controls" title="Hide" className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/10 hover:text-foreground">
          <ChevronDown className="size-4" />
        </button>
      </div>
    </div>
  )
}
