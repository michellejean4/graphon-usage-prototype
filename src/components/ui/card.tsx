import type { HTMLAttributes, ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function Card({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div data-slot="card" className={cn('rounded-xl border bg-card text-card-foreground', className)} {...props} />
}

// Section header used by Home's "Buckets" and "Activity" cards
export function CardHeader({ title, meta, className }: { title: ReactNode; meta?: ReactNode; className?: string }) {
  return (
    <div data-slot="card-header" className={cn('flex flex-wrap items-center gap-2 border-b px-4 py-3', className)}>
      <h2 className="text-sm font-medium">{title}</h2>
      {meta && <div className="ml-auto text-xs text-muted-foreground">{meta}</div>}
    </div>
  )
}
