import type { Howl } from 'howler'
import { howlerSupported } from './env'

/**
 * Tiny wrapper over Howler used for the pronunciation clips and the
 * correct/wrong sound effects. Everything here is browser-only.
 */
type SpriteName = 'wrong' | 'correct' | 'ready'

const basePath = '/audio/'

let sprite: Howl | null = null
let HowlCtor: typeof Howl | null = null
const cache: Record<string, Howl & { isPlaying?: boolean }> = {}

async function loadHowler() {
  if (HowlCtor) return HowlCtor
  const { Howl } = await import('howler')
  HowlCtor = Howl
  return Howl
}

function getSprite() {
  if (!sprite) {
    if (!HowlCtor) return null
    sprite = new HowlCtor({
      src: [`${basePath}sprite.mp3`],
      volume: 0.4,
      sprite: {
        wrong: [50, 610],
        correct: [1000, 500],
        ready: [2000, 2000],
      },
    })
  }
  return sprite
}

/** Warms up Howler the first time the user interacts with the app. */
export function initSound() {
  if (!howlerSupported()) return
  void loadHowler().then(() => getSprite())
}

export function playEffect(name: SpriteName) {
  if (!howlerSupported()) return
  void loadHowler().then(() => getSprite()?.play(name))
}

export function isPlaying(file: string): boolean {
  return Boolean(cache[file]?.isPlaying)
}

export function play(file: string | undefined) {
  if (!file || !howlerSupported()) return
  const cached = cache[file]
  if (cached) cached.play()
  else preload(file, true)
}

export function preload(file: string | string[] | undefined, autoplay = false) {
  if (!file || !howlerSupported()) return
  if (Array.isArray(file)) {
    file.forEach((single) => preload(single))
    return
  }
  if (cache[file]) {
    if (autoplay) cache[file].play()
    return
  }
  void loadHowler().then((Howl) => {
    const howl = new Howl({
      src: [`${basePath}${file}`],
      autoplay,
      onplay: () => {
        howl.isPlaying = true
      },
      onend: () => {
        howl.isPlaying = false
      },
    }) as Howl & { isPlaying?: boolean }
    cache[file] = howl
  })
}
