import { createContext, useContext, useState, type ReactNode } from 'react'

// Collapsed sidebar shows icons only
const Collapsed = createContext(false)
const ToggleCtx = createContext<() => void>(() => {})
const readCollapsed = () => { try { return localStorage.getItem('gp-sidebar') === 'collapsed' } catch { return false } }

export const useCollapsed = () => useContext(Collapsed)
export const useToggleSidebar = () => useContext(ToggleCtx)

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
