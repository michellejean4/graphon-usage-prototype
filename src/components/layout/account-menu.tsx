import { Bell, BookOpen, CreditCard, Gauge, LogOut, Moon, Sun, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/store'
import { menuItem, useDropdown } from './use-dropdown'

// Profile picture with the account menu
export function AccountMenu() {
  const { plan, go, dark, setDark } = useStore()
  const { open, setOpen, ref, pick } = useDropdown()
  const item = menuItem
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
