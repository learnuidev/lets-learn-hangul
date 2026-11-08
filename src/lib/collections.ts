export function uniq<T>(items: T[]): T[] {
  return Array.from(new Set(items))
}

export function sample<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)]
}

export function randomInt(max: number): number {
  return Math.floor(Math.random() * max)
}

export function flatten<T>(items: T[][]): T[] {
  return items.reduce<T[]>((acc, item) => acc.concat(item), [])
}

/** `{ [key]: true }` lookup from a list of keys. */
export function keyMap(keys: string[]): Record<string, true> {
  const out: Record<string, true> = {}
  for (const key of keys) out[key] = true
  return out
}
