import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { PLANS, type Plan, type PlanId } from '@/data/plans'
import { SCENARIOS, totalQueries, type Scenario, type ScenarioId } from '@/data/usage'

export type Route =
  | 'home' | 'buckets' | 'playground' | 'get-started'
  | 'settings/usage' | 'settings/billing' | 'settings/members' | 'settings/notifications' | 'settings/profile' | 'settings/workspace'
  | 'outside'

export type UpgradeReason = 'queries' | 'users' | 'storage' | 'general'

interface Store {
  route: Route
  go: (r: Route) => void
  scenarioId: ScenarioId
  setScenario: (s: ScenarioId) => void
  scenario: Scenario
  planId: PlanId
  plan: Plan
  setPlan: (p: PlanId) => void
  dark: boolean
  setDark: (d: boolean) => void
  upgrade: { open: boolean; reason: UpgradeReason; target?: PlanId }
  openUpgrade: (reason?: UpgradeReason, target?: PlanId) => void
  closeUpgrade: () => void
  bannerDismissed: boolean
  wantsTeam: boolean
  dismissBanner: () => void
  // derived
  used: number
  limit: number
  pct: number
  status: 'ok' | 'close' | 'out'
}

const Ctx = createContext<Store | null>(null)

const readRoute = (): Route => (window.location.hash.replace(/^#\/?/, '') || 'home') as Route

export function StoreProvider({ children }: { children: ReactNode }) {
  const [route, setRoute] = useState<Route>(readRoute)
  const [scenarioId, setScenarioId] = useState<ScenarioId>('close')
  const [planId, setPlan] = useState<PlanId>('free')
  const [dark, setDark] = useState(true)
  const [upgrade, setUpgrade] = useState<{ open: boolean; reason: UpgradeReason; target?: PlanId }>({ open: false, reason: 'general' })
  const [bannerDismissed, setBannerDismissed] = useState(false)
  const [wantsTeam, setWantsTeam] = useState(false)

  useEffect(() => {
    const onHash = () => {
      setRoute(readRoute())
      setUpgrade((u) => ({ ...u, open: false }))
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark)
  }, [dark])

  const go = useCallback((r: Route) => {
    window.location.hash = '/' + r
    window.scrollTo(0, 0)
  }, [])

  const setScenario = useCallback((s: ScenarioId) => {
    setScenarioId(s)
    setBannerDismissed(false)
  }, [])

  const openUpgrade = useCallback((reason: UpgradeReason = 'general', target?: PlanId) => {
    if (reason === 'users') setWantsTeam(true)
    setUpgrade({ open: true, reason, target })
  }, [])
  const closeUpgrade = useCallback(() => setUpgrade((u) => ({ ...u, open: false })), [])

  const value = useMemo<Store>(() => {
    const scenario = SCENARIOS[scenarioId]
    const plan = PLANS[planId]
    const used = totalQueries(scenario)
    const limit = plan.queries
    const pct = Math.min(100, (used / limit) * 100)
    const status = pct >= 100 ? 'out' : pct >= 80 ? 'close' : 'ok'
    return {
      route, go, scenarioId, setScenario, scenario, planId, plan, setPlan, dark, setDark,
      upgrade, openUpgrade, closeUpgrade, bannerDismissed, dismissBanner: () => setBannerDismissed(true), wantsTeam,
      used, limit, pct, status,
    }
  }, [route, go, scenarioId, setScenario, planId, dark, upgrade, openUpgrade, closeUpgrade, bannerDismissed, wantsTeam])

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useStore() {
  const s = useContext(Ctx)
  if (!s) throw new Error('useStore outside provider')
  return s
}
