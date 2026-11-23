import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

// Matches Graphon's shadcn button: h-7, rounded-lg, 0.8rem medium
export const buttonVariants = cva(
  'inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 whitespace-nowrap rounded-lg border border-transparent font-medium transition-all duration-150 ease-out outline-none select-none focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 active:translate-y-0 active:scale-[0.98] [&_svg]:size-3.5 [&_svg]:shrink-0 [&_svg]:transition-transform',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground shadow-xs hover:-translate-y-px hover:bg-primary/85 hover:shadow-md',
        outline: 'border-border bg-background shadow-xs hover:-translate-y-px hover:border-foreground/25 hover:bg-muted/60 hover:shadow-sm dark:bg-input/30 dark:border-input dark:hover:border-foreground/30 dark:hover:bg-input/50',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-[color-mix(in_oklch,var(--secondary),var(--foreground)_8%)]',
        ghost: 'hover:bg-muted hover:text-foreground dark:hover:bg-muted/60',
        link: 'text-primary underline-offset-4 hover:underline h-auto! px-0!',
        // Added to shadcn's set: the upgrade call to action
        upgrade: 'bg-upgrade text-upgrade-foreground font-semibold shadow-xs hover:-translate-y-px hover:bg-upgrade-hover hover:shadow-md',
      },
      size: {
        // Same sizes as GitHub's buttons: 28 / 32 / 40px tall, 8 / 12 / 16px side padding
        default: 'h-8 px-3 text-sm',
        sm: 'h-7 px-2 text-xs rounded-md',
        lg: 'h-10 px-4 text-sm',
        icon: 'size-8',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

export function Button({
  className,
  variant,
  size,
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & VariantProps<typeof buttonVariants>) {
  return (
    <button data-slot="button" className={cn(buttonVariants({ variant, size }), className)} {...props}>
      {children}
    </button>
  )
}
