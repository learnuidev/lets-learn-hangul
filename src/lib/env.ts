export const isBrowser = (): boolean => typeof window !== 'undefined'

export function howlerSupported(): boolean {
  return isBrowser() && typeof (window as Window & { AudioContext?: unknown }).AudioContext !== 'undefined'
}

/** Public site URL, used by the share links. */
export const publicUri = 'http://letslearnhangul.com'

/** Facebook app ids, kept from the original build (per environment). */
export function facebookAppId(): string {
  if (!isBrowser()) return '1332107326799451'
  const hostname = window.location.hostname
  if (/localhost/.test(hostname)) return '1332119800131537'
  if (/staging/.test(hostname)) return '1332120460131471'
  return '1332107326799451'
}
