import { useEffect } from 'react'

/**
 * The original app let you press Enter anywhere to trigger the current screen's
 * primary action; it was a hack for keyboard users without focus, and it still
 * makes the course playable with one hand on the keyboard.
 */
export function useEnterToActivate() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    let down = false

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Enter') return
      if (down) return
      down = true

      const target = document.querySelector<HTMLElement>('[data-autofocus]')
      const active = document.activeElement
      const hasActive = Boolean(active && active.tagName !== 'BODY')
      if (!hasActive && target) target.click()
    }

    const onKeyUp = () => {
      down = false
    }

    window.addEventListener('keydown', onKeyDown)
    window.addEventListener('keyup', onKeyUp)
    return () => {
      window.removeEventListener('keydown', onKeyDown)
      window.removeEventListener('keyup', onKeyUp)
    }
  }, [])
}
