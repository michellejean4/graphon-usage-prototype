import { DemoBar } from '@/components/demo-bar'
import { Header, Sidebar, SidebarProvider } from '@/components/layout'
import { UpgradeDialog } from '@/components/usage/upgrade-dialog'
import { BillingPage } from '@/pages/billing'
import { HomePage } from '@/pages/home'
import { BucketsPage, MembersPage, OutsidePage, SimpleSettingsPage } from '@/pages/other'
import { PlaygroundPage } from '@/pages/playground'
import { UsagePage } from '@/pages/usage'
import { StoreProvider, useStore } from '@/store'

function Page() {
  const { route } = useStore()
  return <PageFor route={route} />
}

function PageFor({ route }: { route: string }) {
  switch (route) {
    case 'buckets': return <BucketsPage />
    case 'playground': return <PlaygroundPage />
    case 'settings/usage': return <UsagePage />
    case 'settings/billing': return <BillingPage />
    case 'settings/members': return <MembersPage />
    case 'settings/notifications': return <SimpleSettingsPage title="Notifications" />
    case 'settings/profile': return <SimpleSettingsPage title="Profile" />
    case 'settings/workspace': return <SimpleSettingsPage title="Workspace" />
    case 'outside': return <OutsidePage />
    default: return <HomePage />
  }
}

export default function App() {
  return (
    <StoreProvider>
      <SidebarProvider>
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex min-w-0 flex-1 flex-col bg-background">
            <Header />
            <Page />
          </main>
        </div>
      </SidebarProvider>
      <UpgradeDialog />
      <DemoBar />
    </StoreProvider>
  )
}
