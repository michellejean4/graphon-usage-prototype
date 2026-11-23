import {
  ArrowLeft, Bell, BookOpen, LogOut, Moon, Sun, Check, Plus, Bot, Building2, ChevronDown, CreditCard, FlaskConical, Gauge, GitBranch, House,
  Key, KeyRound, LibraryBig, MessageSquare, PanelLeft, Rocket, Search, Settings, Shield, User, Users, Cylinder,
} from 'lucide-react'
import { createContext, useCallback, useContext, useEffect, useRef, useState, type ComponentType, type ReactNode } from 'react'
import { FeedbackPanel } from '@/components/feedback-panel'
import { GraphonMark } from '@/components/logo'
import { Meter } from '@/components/ui/meter'
import { fmtNum } from '@/data/plans'
import { PERIOD } from '@/data/usage'
import { cn } from '@/lib/utils'
import { useStore, type Route } from '@/store'

type Item = { label: string; icon: ComponentType<{ className?: string }>; route?: Route; isNew?: boolean; active?: boolean }

// Collapsed sidebar shows icons only
const Collapsed = createContext(false)
const ToggleCtx = createContext<() => void>(() => {})
const readCollapsed = () => { try { return localStorage.getItem('gp-sidebar') === 'collapsed' } catch { return false } }

// Shares the expanded/collapsed state across the sidebar
export function SidebarProvider({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const toggle = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('gp-sidebar', c ? 'open' : 'collapsed') } catch { /* private mode */ }
      return !c
    })
  }
  return <Collapsed.Provider value={collapsed}><ToggleCtx.Provider value={toggle}>{children}</ToggleCtx.Provider></Collapsed.Provider>
}

function NavItem({ item }: { item: Item }) {
  const { route, go } = useStore()
  const collapsed = useContext(Collapsed)
  const active = item.active ?? item.route === route
  const Icon = item.icon
  return (
    <button
      onClick={() => item.route && go(item.route)}
      title={collapsed ? item.label : undefined}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        collapsed && 'justify-center',
        'flex h-8 w-full items-center gap-2 overflow-hidden rounded-md px-2 text-left text-sm outline-hidden hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:size-4 [&_svg]:shrink-0',
        active && 'bg-sidebar-accent font-medium text-sidebar-accent-foreground',
        !item.route && 'cursor-default',
      )}
    >
      <Icon />
      {!collapsed && <span className="truncate">{item.label}</span>}
    </button>
  )
}

function GroupLabel({ children }: { children: ReactNode }) {
  if (useContext(Collapsed)) return <div className="mx-1 my-3 border-t border-sidebar-border" />
  return <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">{children}</div>
}

// NEW: plan + usage, always visible at the bottom of the sidebar
function PlanCard() {
  const { plan, used, limit, status, go, openUpgrade } = useStore()
  const collapsed = useContext(Collapsed)
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  if (collapsed) {
    // Small usage ring keeps the limit visible when the sidebar is collapsed
    const C = 2 * Math.PI * 9
    return (
      <button onClick={() => go('settings/usage')} title={`${plan.name} plan · ${used} of ${fmtNum(limit)} queries used`} aria-label="Usage" className="mx-auto flex size-10 items-center justify-center rounded-md hover:bg-sidebar-accent">
        <svg viewBox="0 0 24 24" className="size-6 -rotate-90">
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" className="stroke-foreground/10" />
          <circle cx="12" cy="12" r="9" fill="none" strokeWidth="3" strokeLinecap="round" strokeDasharray={`${C * Math.min(1, used / limit)} ${C}`} className={status === 'out' ? 'stroke-destructive' : 'stroke-chart-1'} />
        </svg>
      </button>
    )
  }
  return (
    <div className="rounded-xl border bg-card p-3 text-xs">
      <button onClick={() => go('settings/usage')} className="block w-full text-left">
        <div className="flex items-center justify-between">
          <span className="font-medium">{plan.name} plan</span>
          <span className={cn('tabular-nums text-muted-foreground', status === 'close' && 'text-warning-text', status === 'out' && 'text-destructive')}>
            {used} / {fmtNum(limit)}
          </span>
        </div>
        <Meter value={used} max={limit} size="sm" className="mt-2.5" />
        <div className="mt-2.5 text-muted-foreground">
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


// Workspace switcher: current workspace, its plan, and shortcuts to settings
function WorkspaceMenu() {
  const { plan, go, openUpgrade } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const pick = (fn: () => void) => () => { setOpen(false); fn() }
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  const item = 'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-foreground/8 hover:[&_svg]:text-foreground focus-visible:bg-foreground/8 outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground [&_svg]:transition-colors'
  const collapsed = useContext(Collapsed)
  if (collapsed) {
    return <div className="flex h-16 shrink-0 items-center justify-center border-b border-sidebar-border bg-topbar"><GraphonMark className="size-4" /></div>
  }
  return (
    <div ref={ref} className="relative flex h-16 shrink-0 items-center border-b border-sidebar-border bg-topbar px-2">
      <button onClick={() => setOpen((o) => !o)} aria-haspopup="menu" aria-expanded={open} className="flex h-8 min-w-0 flex-1 items-center gap-2 rounded-md px-2 text-left transition-colors hover:bg-muted">
        <GraphonMark className="size-4 shrink-0" />
        <span className="truncate text-sm">Michelle's workspace</span>
        <ChevronDown className={cn('ml-auto size-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-180')} />
      </button>
      {open && (
        <div role="menu" className="absolute top-full left-2 z-30 mt-1 w-[216px] rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
          <div className="px-2 pt-1.5 pb-1 text-xs text-muted-foreground">Workspaces</div>
          <button role="menuitem" onClick={pick(() => go('home'))} className={item}>
            <GraphonMark className="size-4 shrink-0" />
            <span className="min-w-0 flex-1 truncate">Michelle's workspace</span>
            <span className="text-xs text-muted-foreground">{plan.name}</span>
            <Check className="text-foreground!" />
          </button>
          <button role="menuitem" onClick={pick(() => openUpgrade('users'))} className={item}><Plus /> Create a team workspace</button>
          <div className="my-1 border-t" />
          <button role="menuitem" onClick={pick(() => go('settings/workspace'))} className={item}><Settings /> Workspace settings</button>
          <button role="menuitem" onClick={pick(() => go('settings/members'))} className={item}><Users /> Members</button>
          <button role="menuitem" onClick={pick(() => go('settings/usage'))} className={item}><Gauge /> Usage</button>
          <button role="menuitem" onClick={pick(() => go('settings/billing'))} className={item}><CreditCard /> Billing</button>
          {!isTop && (
            <>
              <div className="my-1 border-t" />
              <button role="menuitem" onClick={pick(() => openUpgrade('general'))} className={cn(item, 'font-medium')}>Upgrade plan</button>
            </>
          )}
        </div>
      )}
    </div>
  )
}

export function Sidebar() {
  const { route } = useStore()
  const inSettings = route.startsWith('settings/')
  const collapsed = useContext(Collapsed)
  const toggle = useContext(ToggleCtx)

  return (
    <div className="sticky top-0 z-20 hidden h-screen shrink-0 md:block">
    <aside className={cn('h-full overflow-hidden border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 ease-out', collapsed ? 'w-14' : 'w-[232px]')}>
      <div className="flex h-full w-full flex-col">
      <WorkspaceMenu />

      <div className="flex min-h-0 flex-1 flex-col gap-px overflow-y-auto px-2 pt-4 pb-4">
        {/* Like Graphon's app: settings pages swap the sidebar for the settings menu */}
        {inSettings ? (
          <>
            <NavItem item={{ label: 'Back to workspace', icon: ArrowLeft, route: 'home' }} />
            <div className="mt-6"><GroupLabel>Personal</GroupLabel></div>
            <NavItem item={{ label: 'Profile', icon: User, route: 'settings/profile' }} />
            <NavItem item={{ label: 'Notifications', icon: Bell, route: 'settings/notifications' }} />
            <NavItem item={{ label: 'Security', icon: Shield }} />
            <NavItem item={{ label: 'API keys', icon: KeyRound }} />
            <div className="mt-6"><GroupLabel>Workspace</GroupLabel></div>
            <NavItem item={{ label: 'Workspace', icon: Building2, route: 'settings/workspace' }} />
            <NavItem item={{ label: 'Members', icon: Users, route: 'settings/members' }} />
            <NavItem item={{ label: 'Workspace API keys', icon: Key }} />
            <NavItem item={{ label: 'Usage', icon: Gauge, route: 'settings/usage' }} />
            <NavItem item={{ label: 'Billing', icon: CreditCard, route: 'settings/billing' }} />
          </>
        ) : (
          <>
            <NavItem item={{ label: 'Get started', icon: Rocket }} />
            <NavItem item={{ label: 'Home', icon: House, route: 'home' }} />
            <NavItem item={{ label: 'Playground', icon: FlaskConical, route: 'playground' }} />
            <NavItem item={{ label: 'Usage', icon: Gauge, route: 'settings/usage' }} />
            <div className="mt-6"><GroupLabel>Build</GroupLabel></div>
            <NavItem item={{ label: 'Buckets', icon: Cylinder, route: 'buckets' }} />
            <NavItem item={{ label: 'Datasets', icon: LibraryBig }} />
            <NavItem item={{ label: 'Pipelines', icon: GitBranch }} />
            <NavItem item={{ label: 'Agents', icon: Bot }} />
        {/* Same order as Graphon's app: a line, then Settings right under the menu */}
        <div className="my-3 border-t border-sidebar-border" />
        <NavItem item={{ label: 'Settings', icon: Settings, route: 'settings/profile', }} />
          </>
        )}
        {/* Usage card sits where the Get started checklist was */}
        <div className="mt-auto pt-4">
          <PlanCard />
        </div>
      </div>
      {/* Line, then the panel button, as in Graphon's app */}
      <div className={cn('flex border-t border-sidebar-border p-2', collapsed && 'justify-center')}>
        <button onClick={toggle} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} aria-expanded={!collapsed} className="flex size-8 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-sidebar-accent hover:text-foreground">
          <PanelLeft className="size-4" />
        </button>
      </div>
      </div>
    </aside>
    </div>
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
  const [feedback, setFeedback] = useState(false)
  const closeFeedback = useCallback(() => setFeedback(false), [])
  const settings = route.startsWith('settings/')
  const page = settings ? route.split('/')[1] : null
  const crumb = CRUMBS[route]
  return (
    <>
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-3 border-b border-sidebar-border bg-topbar px-4">
      <div className="flex items-center gap-2 px-2 text-sm">
        {settings ? (
          <>
            <Settings className="size-4 text-muted-foreground" />
            <button onClick={() => go('settings/profile')} className="text-muted-foreground hover:text-foreground">Settings</button>
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
        <button className="hidden h-8 w-64 items-center gap-2 rounded-md border bg-background px-3 text-sm text-muted-foreground transition-colors hover:border-foreground/25 sm:flex lg:w-80">
          <Search className="size-4" /> Quick search...
          <kbd className="ml-auto rounded border px-1.5 font-sans text-[11px]">⌘K</kbd>
        </button>
        <button onClick={() => setFeedback(true)} className="hidden h-8 items-center gap-1.5 rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted sm:flex"><MessageSquare className="size-4" /> Feedback</button>
        <button className="flex h-8 items-center rounded-lg px-3 text-sm font-medium transition-colors hover:bg-muted">Docs</button>
        <Avatar />
      </div>
    </header>
    <FeedbackPanel open={feedback} onClose={closeFeedback} />
    {/* Small screens: the sidebar is hidden, so the key pages sit in a scrolling row */}
    <nav className="flex gap-1 overflow-x-auto border-b px-3 py-2 text-sm md:hidden">
      {([['home', 'Home'], ['playground', 'Playground'], ['settings/usage', 'Usage'], ['settings/billing', 'Billing'], ['settings/members', 'Members']] as const).map(([r, l]) => (
        <button key={r} onClick={() => go(r)} className={cn('h-8 shrink-0 rounded-md px-3 font-medium text-muted-foreground', route === r && 'bg-muted text-foreground')}>{l}</button>
      ))}
    </nav>
    </>
  )
}

// Profile picture
function Avatar() {
  const { plan, go, dark, setDark } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false) }
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey) }
  }, [open])
  const pick = (fn: () => void) => () => { setOpen(false); fn() }
  const item = 'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-foreground/8 hover:[&_svg]:text-foreground focus-visible:bg-foreground/8 outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground [&_svg]:transition-colors'
  const img = <img src={`${import.meta.env.BASE_URL}avatar.png`} alt="" className="size-full object-cover" />
  return (
    <div ref={ref} className="relative">
      <button onClick={() => setOpen((o) => !o)} aria-label="Account" aria-haspopup="menu" aria-expanded={open} className={cn('block size-8 shrink-0 overflow-hidden rounded-full border border-sidebar-border transition-opacity hover:opacity-85', open && 'ring-2 ring-foreground/20')}>
        {img}
      </button>
      {open && (
        <div role="menu" className="absolute top-full right-0 z-30 mt-2 w-60 rounded-xl border bg-popover p-1 text-popover-foreground shadow-lg">
          <div className="flex items-center gap-2.5 px-2 py-2">
            <span className="size-8 shrink-0 overflow-hidden rounded-full border">{img}</span>
            <div className="min-w-0">
              <div className="truncate text-sm font-medium">Michelle</div>
              <div className="truncate text-xs text-muted-foreground">Michelle's workspace · {plan.name}</div>
            </div>
          </div>
          <div className="my-1 border-t" />
          <button role="menuitem" onClick={pick(() => go('settings/profile'))} className={item}><User /> Profile</button>
          <button role="menuitem" onClick={pick(() => go('settings/notifications'))} className={item}><Bell /> Notifications</button>
          <button role="menuitem" onClick={pick(() => go('settings/usage'))} className={item}><Gauge /> Usage</button>
          <button role="menuitem" onClick={pick(() => go('settings/billing'))} className={item}><CreditCard /> Billing</button>
          <div className="my-1 border-t" />
          <button role="menuitem" onClick={() => setDark(!dark)} className={item}>
            {dark ? <Sun /> : <Moon />} {dark ? 'Light mode' : 'Dark mode'}
          </button>
          <button role="menuitem" onClick={pick(() => {})} className={item}><BookOpen /> Docs</button>
          <div className="my-1 border-t" />
          <button role="menuitem" onClick={pick(() => {})} className={item}><LogOut /> Sign out</button>
        </div>
      )}
    </div>
  )
}
