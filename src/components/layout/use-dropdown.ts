import { useEffect, useRef, useState } from 'react'

// Open/close state for a dropdown that closes on an outside click or Escape
export function useDropdown() {
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
  return { open, setOpen, ref, pick }
}

// Shared style for rows in the workspace and account menus
export const menuItem = 'flex h-8 w-full items-center gap-2 rounded-md px-2 text-left text-sm transition-colors hover:bg-foreground/8 hover:[&_svg]:text-foreground focus-visible:bg-foreground/8 outline-none [&_svg]:size-4 [&_svg]:text-muted-foreground [&_svg]:transition-colors'
