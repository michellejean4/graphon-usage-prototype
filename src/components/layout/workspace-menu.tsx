import { Check, ChevronDown, CreditCard, Gauge, Plus, Settings, Users } from 'lucide-react'
import { GraphonMark } from '@/components/logo'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { useCollapsed } from './sidebar-state'
import { menuItem, useDropdown } from './use-dropdown'

// Workspace switcher: current workspace, its plan, and shortcuts to settings
export function WorkspaceMenu() {
  const { plan, go, openUpgrade } = useStore()
  const { open, setOpen, ref, pick } = useDropdown()
  const isTop = plan.id === 'business' || plan.id === 'enterprise'
  const item = menuItem
  const collapsed = useCollapsed()
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
