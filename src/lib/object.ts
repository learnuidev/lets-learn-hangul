export function mapObject<T, R>(
  collection: Record<string, T>,
  iteratee: (value: T, key: string, index: number) => R,
): R[] {
  return Object.entries(collection).map(([key, value], index) => iteratee(value, key, index))
}

export function mapValuesObject<T, R>(
  collection: Record<string, T>,
  iteratee: (value: T, key: string) => R,
): Record<string, R> {
  const out: Record<string, R> = {}
  for (const [key, value] of Object.entries(collection)) out[key] = iteratee(value, key)
  return out
}

/** Shallow object filter, mirroring lodash's `filter` on objects. */
export function filterObject<T>(
  collection: Record<string, T>,
  predicate: (value: T, key: string) => boolean,
): Record<string, T> {
  const out: Record<string, T> = {}
  for (const [key, value] of Object.entries(collection)) {
    if (predicate(value, key)) out[key] = value
  }
  return out
}
