import { Cylinder, FlaskConical, House, MessageSquare, Search, Settings } from 'lucide-react'
import { useCallback, useState, type ComponentType } from 'react'
import { FeedbackPanel } from '@/components/feedback-panel'
import { cn } from '@/lib/utils'
import { useStore, type Route } from '@/store'
import { AccountMenu } from './account-menu'

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
        <AccountMenu />
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
