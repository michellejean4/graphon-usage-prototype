import {
  ArrowLeft, Bell, Bot, Building2, CreditCard, Cylinder, FlaskConical, Gauge, GitBranch, House, Key, KeyRound, LibraryBig, PanelLeft, Rocket, Settings, Shield, User, Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { GroupLabel, NavItem } from './nav-item'
import { PlanCard } from './plan-card'
import { useCollapsed, useToggleSidebar } from './sidebar-state'
import { WorkspaceMenu } from './workspace-menu'

export function Sidebar() {
  const { route } = useStore()
  const inSettings = route.startsWith('settings/')
  const collapsed = useCollapsed()
  const toggle = useToggleSidebar()

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
