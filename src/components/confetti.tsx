import { useEffect, useRef } from 'react'
import { isMedial } from '@/lib/hangul'
import { mapping } from '@/lib/display'
import { randomInt, sample } from '@/lib/collections'

const jamos = Object.keys(mapping)
const width = 1280
const red = '#ee1a60'
const blue = '#367add'
const count = 200
const minZ = -1200
const maxZ = 600
const speed = 11

/**
 * The falling-jamo celebration. Kept imperative (direct DOM writes driven by
 * requestAnimationFrame) because it animates hundreds of nodes per frame.
 */
export function Confetti({ geometric }: { geometric?: Record<string, string> }) {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const stateRef = useRef({
    running: false,
    i: 0,
    t: [] as number[],
    xs: [] as number[],
    zs: [] as number[],
    bits: [] as HTMLDivElement[],
    paths: [] as SVGPathElement[],
  })

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const state = stateRef.current

    // Build the pieces once.
    for (let i = 0; i < count; i++) {
      const div = document.createElement('div')
      div.setAttribute('class', 'confetti__piece')
      div.innerHTML =
        '<svg width="100" height="100" viewBox="0 0 600 600"><path d="M0,0l0,0" fill="transparent" /></svg>'
      container.appendChild(div)
      state.bits.push(div)
      const path = div.querySelector('path')
      if (path) state.paths[i] = path
    }

    const addBit = () => {
      if (!geometric) return
      const jamo = sample(jamos)
      const i = state.i % count
      const bit = state.bits[i]
      const path = state.paths[i]
      if (!bit || !path) return

      const z = randomInt(maxZ - minZ) + minZ
      const x = randomInt(width + 40) - 20

      path.setAttribute('d', sample(Object.values(geometric)))
      path.setAttribute('fill', isMedial(jamo) ? blue : red)
      bit.style.transform = `translate3D(${x}px, -100px, ${z}px)`

      state.t[i] = 0
      state.xs[i] = x
      state.zs[i] = z
      state.i++
    }

    const tick = () => {
      if (!state.running) return
      for (let i = 0; i < state.bits.length; i++) {
        state.t[i] = (state.t[i] ?? 0) + 1
        state.bits[i].style.transform = `translate3D(${state.xs[i]}px, ${speed * state.t[i] - 100}px, ${state.zs[i]}px)`
      }
      requestAnimationFrame(tick)
    }

    const timer = setInterval(addBit, 60)
    state.running = true
    tick()

    return () => {
      clearInterval(timer)
      state.running = false
      container.innerHTML = ''
      state.bits = []
      state.paths = []
      state.t = []
      state.xs = []
      state.zs = []
      state.i = 0
    }
  }, [geometric])

  return (
    <div className="confetti">
      <div className="confetti__container" ref={containerRef} />
    </div>
  )
}
