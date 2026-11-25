import type { ComponentType, ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useStore, type Route } from '@/store'
import { useCollapsed } from './sidebar-state'

export type NavItemData = { label: string; icon: ComponentType<{ className?: string }>; route?: Route; active?: boolean }

export function NavItem({ item }: { item: NavItemData }) {
  const { route, go } = useStore()
  const collapsed = useCollapsed()
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

export function GroupLabel({ children }: { children: ReactNode }) {
  if (useCollapsed()) return <div className="mx-1 my-3 border-t border-sidebar-border" />
  return <div className="flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70">{children}</div>
}
