import { cva, type VariantProps } from 'class-variance-authority'
import type { HTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Graphon pill badge: h-5 px-2 text-xs font-medium, tinted border
const badgeVariants = cva(
  'inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-xs font-medium [&_svg]:size-3',
  {
    variants: {
      variant: {
        outline: 'border-border text-foreground',
        success: 'border-emerald-500/25 bg-emerald-500/10 text-success-text',
        warning: 'border-border bg-muted text-foreground',
        destructive: 'border-destructive/30 bg-destructive/10 text-destructive',
        primary: 'border-primary/25 bg-primary/10 text-primary',
      },
    },
    defaultVariants: { variant: 'outline' },
  },
)

export function Badge({ className, variant, ...props }: HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}
