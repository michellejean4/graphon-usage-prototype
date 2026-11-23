import {
  ArrowLeft, Bell, Bot, Building2, ChevronDown, Circle, CircleDashed, CreditCard, FlaskConical, Gauge, GitBranch, House,
  Key, KeyRound, LibraryBig, MessageSquare, PanelLeft, Rocket, Search, Settings, Shield, User, Users, X, Cylinder,
} from 'lucide-react'
import { useState, type ComponentType, type ReactNode } from 'react'
import { GraphonMark } from '@/components/logo'
import { Meter } from '@/components/ui/meter'
import { fmtNum } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore, type Route } from '@/store'

type Item = { label: string; icon: ComponentType<{ className?: string }>; route?: Route; isNew?: boolean }

function NavItem({ item }: { item: Item }) {
  const { route, go } = useStore()
  const active = item.route === route
  const Icon = item.icon
  return (
    <button
      onClick={() => item.route && go(item.route)}
      className={cn(
        'flex h-8 w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
        active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        !item.route && 'cursor-default',
      )}
    >
      <Icon />
      <span className="truncate">{item.label}</span>
    </button>
  )
}

function GroupLabel({ children }: { children: ReactNode }) {
  return <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">{children}</div>
}

// NEW: plan + usage, always visible above the Get started checklist
function PlanCard() {
  const { plan, used, limit, status, go, openUpgrade } = useStore()
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  return (
    <div className="rounded-xl border bg-card p-3 text-xs">
      <button onClick={() => go('settings/usage')} className="block w-full text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium">{plan.name} plan</span>
          <span className={cn('tabular-nums text-muted-foreground', status === 'close' && 'text-warning-text', status === 'out' && 'text-destructive')}>
            {used} / {fmtNum(limit)}
          </span>
        </div>
        <Meter value={used} max={limit} size="sm" className="mt-2" />
        <div className="mt-1.5 text-muted-foreground">
          {status === 'out' ? `Queries paused until ${PERIOD.end}` : `${fmtNum(limit - used)} queries left · resets ${PERIOD.end}`}
        </div>
      </button>
      {!isTop && (
        <button onClick={() => openUpgrade(status === 'ok' ? 'general' : 'queries')} className="mt-2 font-medium text-primary hover:underline">
          Get more
        </button>
      )}
    </div>
  )
}

function GetStarted() {
  const [open, setOpen] = useState(true)
  if (!open) return null
  const steps = ['Install the Graphon plugin', 'Sign in to Graphon', 'Add some data', 'Search, Answer, and Research', 'Invite your team']
  return (
    <div className="rounded-xl border bg-card text-xs">
      <div className="flex items-center gap-2 border-b px-3 py-2.5">
        <Circle className="size-3.5 text-muted-foreground/50" />
        <span className="font-medium text-muted-foreground">Get started</span>
        <span className="ml-auto tabular-nums text-muted-foreground">0/5</span>
        <button onClick={() => setOpen(false)} aria-label="Close" className="text-muted-foreground hover:text-foreground"><X className="size-3" /></button>
      </div>
      <div className="space-y-1 p-2">
        {steps.map((s, i) => (
          <div key={s} className={cn('flex items-start gap-2.5 px-1 py-1', i === 0 ? 'text-foreground' : 'text-muted-foreground')}>
            {i === 0 ? <CircleDashed className="mt-px size-3.5 text-emerald-500" /> : <Circle className="mt-px size-3.5 text-muted-foreground/50" />}
            {s}
          </div>
        ))}
      </div>
    </div>
  )
}

export function Sidebar() {
  const { route, go } = useStore()
  const inSettings = route.startsWith('settings/')

  return (
    <aside className="sticky top-0 hidden h-screen w-61 md:flex shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground">
      <div className="flex h-12 items-center gap-2 px-4">
        <GraphonMark className="size-4" />
        <span className="truncate text-sm">Michelle Jean's workspace</span>
        <ChevronDown className="ml-auto size-4 text-muted-foreground" />
      </div>

      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto p-2">
        {inSettings ? (
          <>
            <NavItem item={{ label: 'Back to workspace', icon: ArrowLeft, route: 'home' }} />
            <div className="mt-3"><GroupLabel>Personal</GroupLabel></div>
            <NavItem item={{ label: 'Profile', icon: User, route: 'settings/profile' }} />
            <NavItem item={{ label: 'Notifications', icon: Bell, route: 'settings/notifications' }} />
            <NavItem item={{ label: 'Security', icon: Shield }} />
            <NavItem item={{ label: 'API keys', icon: KeyRound }} />
            <div className="mt-3"><GroupLabel>Workspace</GroupLabel></div>
            <NavItem item={{ label: 'Workspace', icon: Building2, route: 'settings/workspace' }} />
            <NavItem item={{ label: 'Members', icon: Users, route: 'settings/members' }} />
            <NavItem item={{ label: 'Workspace API keys', icon: Key }} />
            <NavItem item={{ label: 'Usage', icon: Gauge, route: 'settings/usage' }} />
            <NavItem item={{ label: 'Billing', icon: CreditCard, route: 'settings/billing' }} />
          </>
        ) : (
          <>
            <button onClick={() => go('home')} className="mb-2 flex h-8 items-center gap-2 rounded-md border bg-background px-2 text-sm text-muted-foreground shadow-xs">
              <Search className="size-4" /> Quick search...
              <kbd className="ml-auto rounded border px-1 text-[10px]">K</kbd>
            </button>
            <NavItem item={{ label: 'Get started', icon: Rocket }} />
            <NavItem item={{ label: 'Home', icon: House, route: 'home' }} />
            <NavItem item={{ label: 'Playground', icon: FlaskConical, route: 'playground' }} />
            <div className="mt-3"><GroupLabel>Build</GroupLabel></div>
            <NavItem item={{ label: 'Buckets', icon: Cylinder, route: 'buckets' }} />
            <NavItem item={{ label: 'Datasets', icon: LibraryBig }} />
            <NavItem item={{ label: 'Pipelines', icon: GitBranch }} />
            <NavItem item={{ label: 'Agents', icon: Bot }} />
            <div className="my-2 border-t border-sidebar-border" />
            <NavItem item={{ label: 'Settings', icon: Settings, route: 'settings/usage' }} />
          </>
        )}
        <div className="mt-auto space-y-2 pt-4">
          <PlanCard />
          {!inSettings && <GetStarted />}
        </div>
      </div>
      <div className="border-t border-sidebar-border px-4 py-3 text-muted-foreground">
        <PanelLeft className="size-4" />
      </div>
    </aside>
  )
}

const CRUMBS: Partial<Record<Route, [string, ComponentType<{ className?: string }>]>> = {
  home: ['Home', House],
  buckets: ['Buckets', Cylinder],
  playground: ['Playground', FlaskConical],
  outside: ['Outside the app', MessageSquare],
}

export function Header() {
  const { route, go } = useStore()
  const settings = route.startsWith('settings/')
  const page = settings ? route.split('/')[1] : null
  const crumb = CRUMBS[route]
  return (
    <>
    <header className="sticky top-0 z-10 flex h-12 shrink-0 items-center gap-3 border-b bg-background px-3">
      <div className="flex items-center gap-2 px-2 text-sm">
        {settings ? (
          <>
            <Settings className="size-4 text-muted-foreground" />
            <button onClick={() => go('settings/usage')} className="text-muted-foreground hover:text-foreground">Settings</button>
            <span className="text-muted-foreground">›</span>
            <span className="capitalize">{page}</span>
          </>
        ) : crumb ? (
          <>
            {(() => { const I = crumb[1]; return <I className="size-4 text-muted-foreground" /> })()}
            <span>{crumb[0]}</span>
          </>
        ) : null}
      </div>
      <div className="ml-auto flex items-center gap-2">
        <button className="hidden h-8 items-center gap-1.5 rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-muted sm:flex"><MessageSquare className="size-4" /> Feedback</button>
        <button className="flex h-8 items-center rounded-lg px-2.5 text-sm font-medium transition-colors hover:bg-muted">Docs</button>
        <div className="flex size-8 items-center justify-center rounded-full bg-slate-500 text-sm font-medium text-white">M</div>
      </div>
    </header>
    {/* Small screens: the sidebar is hidden, so the key pages sit in a scrolling row */}
    <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 text-sm md:hidden">
      {([['home', 'Home'], ['playground', 'Playground'], ['settings/usage', 'Usage'], ['settings/billing', 'Billing'], ['settings/members', 'Members']] as const).map(([r, l]) => (
        <button key={r} onClick={() => go(r)} className={cn('h-7 shrink-0 rounded-md px-2.5 font-medium text-muted-foreground', route === r && 'bg-muted text-foreground')}>{l}</button>
      ))}
    </nav>
    </>
  )
}
