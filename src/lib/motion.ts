import type { Transition, Variants } from 'motion/react'

/**
 * The original screens popped circles and glyphs in with GSAP's
 * `Back.easeOut`; a spring with a little bounce reproduces that overshoot.
 */
export const popVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.35, duration: 0.6 },
  },
}

export const popFromVariants: Variants = {
  hidden: { scale: 0.55, opacity: 0 },
  show: {
    scale: 1,
    opacity: 1,
    transition: { type: 'spring', bounce: 0.3, duration: 0.5 },
  },
}

/** Props for an element that should pop in; omit for static rendering. */
export function popProps(delay?: number | false, variants: Variants = popVariants) {
  if (delay === false || delay === undefined) return {}
  const transition: Transition = delay ? { delay } : {}
  return {
    variants,
    initial: 'hidden' as const,
    animate: 'show' as const,
    transition: { ...transition, type: 'spring' as const, bounce: 0.35, duration: 0.6 },
  }
}
