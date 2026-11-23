import { cn } from '@/lib/utils'

export function Switch({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <button
      data-slot="switch"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn('relative inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border border-transparent transition-colors', checked ? 'bg-primary' : 'bg-input dark:bg-input/80')}
    >
      <span className={cn('block size-4 rounded-full bg-background shadow-sm transition-transform dark:bg-foreground', checked ? 'translate-x-[calc(100%-2px)]' : 'translate-x-0', checked && 'dark:bg-primary-foreground')} />
    </button>
  )
}
