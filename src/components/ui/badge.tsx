import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * The round/level "bubble": a red or blue disc that carries a number or a
 * romanized hint. Published as a Badge so it inherits shadcn's API.
 */
export const badgeVariants = cva(
  [
    'inline-flex shrink-0 items-center justify-center whitespace-nowrap',
    'w-[1.8333rem] h-[1.8333rem] rounded-[300px]',
    'text-[1.2222rem] leading-[1.8333rem] font-bold text-center text-white',
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-brand-red',
        blue: 'bg-brand-blue',
        dark: 'bg-brand-red-dark',
        outline: 'border border-brand-blue bg-transparent text-brand-blue',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

export interface BadgeProps
  extends React.ComponentProps<'span'>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean
}

export function Badge({ className, variant, asChild = false, ...props }: BadgeProps) {
  const Comp = asChild ? Slot : 'span'
  return (
    <Comp
      data-slot="badge"
      data-variant={variant ?? 'default'}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  )
}
