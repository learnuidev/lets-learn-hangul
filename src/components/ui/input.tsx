import * as React from 'react'
import { cn } from '@/lib/utils'

/**
 * The oversized answer field from the original "fat-input", exposed as
 * shadcn's Input so it can take a regular className override.
 */
export function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'fat-input',
        'h-auto w-full min-w-0 rounded-[0.27rem] px-[0.5rem] py-[0.27rem]',
        'border-4 border-brand-blue/30 bg-brand-blue/15 text-[1rem] text-inherit',
        'font-sans font-semibold outline-none',
        'transition-[color,border-color,background-color] duration-150',
        'focus:border-brand-blue',
        'disabled:cursor-not-allowed',
        className,
      )}
      {...props}
    />
  )
}
