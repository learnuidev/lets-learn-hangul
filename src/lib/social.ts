import { facebookAppId, isBrowser, publicUri } from './env'

function toQueryString(params: Record<string, string>): string {
  return Object.entries(params)
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`)
    .join('&')
}

export function getTwitterShareUrl(overrides: Record<string, string> = {}): string {
  const tweet: Record<string, string> = {
    text: 'I just learned to read Korean!',
    url: publicUri,
    hashtags: ['korean', 'hangul', 'hangeul'].join(','),
    ...overrides,
  }
  return `https://twitter.com/intent/tweet?${toQueryString(tweet)}`
}

export function getFacebookShareUrl(overrides: Record<string, string> = {}): string {
  const post: Record<string, string> = {
    app_id: facebookAppId(),
    display: 'page',
    quote: 'I just learned to read Korean!',
    href: publicUri,
    hashtag: '#korean #hangul #hangeul',
    redirect_uri: isBrowser()
      ? `${window.location.protocol}//${window.location.host}/nowwhat`
      : `${publicUri}/nowwhat`,
    ...overrides,
  }
  return `https://www.facebook.com/dialog/share?${toQueryString(post)}`
}
