import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * The app's single button primitive. It keeps shadcn's `variant`/`size` API and
 * the original "fat" pill look, and adds the arrow affordances the screens use
 * to move forward and back through a round.
 */
export const buttonVariants = cva(
  [
    'inline-flex items-center justify-center whitespace-nowrap',
    'rounded-[5px] border-none px-[12px] py-[10px]',
    'font-sans text-[18px] leading-[18px] font-semibold',
    'transition-[opacity,background-color] duration-150',
    'outline-none focus-visible:ring-[3px] focus-visible:ring-brand-blue/40',
    'disabled:pointer-events-none disabled:opacity-50',
    'active:opacity-85',
    'phone:text-[16px] phone:leading-[16px]',
    "[&_svg]:pointer-events-none [&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      variant: {
        default: 'bg-brand-blue-soft text-brand-blue',
        red: 'bg-brand-red-soft text-brand-red [--btn-arrow:var(--arrow-red)]',
        green: 'bg-brand-green-soft text-brand-green [--btn-arrow:var(--arrow-green)]',
        twitter: [
          'bg-twitter-soft text-twitter',
          "before:mr-[0.5em] before:inline-block before:h-[1.5em] before:w-[1.5em]",
          'before:bg-[image:var(--logo-twitter)] before:align-[-0.4em] before:bg-[length:100%_100%] before:content-[""]',
          'before:transition-[margin-left,margin-right] before:duration-200',
          'hover:before:mr-[1em] hover:before:ml-[0.5em]',
        ].join(' '),
        facebook: [
          'bg-facebook-soft text-facebook',
          "before:mr-[0.5em] before:inline-block before:h-[1.5em] before:w-[1.5em]",
          'before:bg-[image:var(--logo-facebook)] before:align-[-0.4em] before:bg-[length:100%_100%] before:content-[""]',
          'before:transition-[margin-left,margin-right] before:duration-200',
          'hover:before:mr-[1em] hover:before:ml-[0.5em]',
        ].join(' '),
        link: 'bg-transparent text-[14px] leading-[18px] text-brand-blue',
        bare: 'bg-transparent p-0 text-inherit',
      },
      size: {
        default: '',
        none: 'p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  },
)

export type ButtonVariant = NonNullable<VariantProps<typeof buttonVariants>['variant']>
export type ButtonArrow = 'forward' | 'back' | 'none'

export interface ButtonProps
  extends React.ComponentProps<'button'>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  arrow?: ButtonArrow
}

export function Button({
  className,
  variant,
  size,
  arrow = 'none',
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  return (
    <Comp
      data-slot="button"
      data-variant={variant ?? 'default'}
      data-arrow={arrow}
      data-forward={arrow === 'forward' ? '' : undefined}
      data-back={arrow === 'back' ? '' : undefined}
      className={cn(
        buttonVariants({ variant, size }),
        arrow === 'forward' && 'btn-arrow-forward',
        arrow === 'back' && 'btn-arrow-back',
        className,
      )}
      {...props}
    />
  )
}
