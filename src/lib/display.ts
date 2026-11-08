import { decompose, isHangul, isMedial } from './hangul'

/** Latin stand-in used for shape ids, hints and the geometric jamo set. */
export const mapping: Record<string, string> = {
  'ㄱ': 'g',
  'ㅏ': 'a',
  'ㄲ': 'gg',
  'ㄴ': 'n',
  'ㄷ': 'd',
  'ㄸ': 'dd',
  'ㄹ': 'l',
  'ㅁ': 'm',
  'ㅂ': 'b',
  'ㅃ': 'bb',
  'ㅅ': 's',
  'ㅆ': 'ss',
  'ㅇ': 'ng',
  'ㅈ': 'j',
  'ㅉ': 'jj',
  'ㅊ': 'ch',
  'ㅋ': 'k',
  'ㅌ': 't',
  'ㅍ': 'p',
  'ㅎ': 'h',
  'ㅐ': 'ae',
  'ㅑ': 'ya',
  'ㅒ': 'yae',
  'ㅓ': 'eo',
  'ㅔ': 'e',
  'ㅕ': 'yeo',
  'ㅖ': 'ye',
  'ㅣ': 'i',
  'ㅜ': 'u',
  'ㅡ': 'eu',
  'ㅠ': 'yu',
  'ㅛ': 'yo',
  'ㅗ': 'o',
  'ㅝ': 'weo',
  'ㅢ': 'eui',
  'ㅟ': 'wi',
  'ㅞ': 'we',
  'ㅚ': 'oi',
  'ㅙ': 'wae',
  'ㅘ': 'wa',
  'ㅄ': 'bs',
  'ㅀ': 'lh',
  'ㄿ': 'lp',
  'ㄾ': 'lt',
  'ㄽ': 'ls',
  'ㄼ': 'lb',
  'ㄻ': 'lm',
  'ㄺ': 'lg',
  'ㄶ': 'nh',
  'ㄵ': 'nj',
  'ㄳ': 'gs',
}

/** Spellings that English speakers find easier than the standard ones. */
export const friendlier: Record<string, string> = {
  'ㄹ': 'l',
  'ㅓ': 'uh',
  'ㅕ': 'yuh',
  'ㅚ': 'weh',
}

export const alternates: Record<string, string> = {
  'ㄱ': 'k',
  'ㄲ': 'kk',
  'ㄷ': 't',
  'ㄸ': 'tt',
  'ㄹ': 'l',
  'ㅂ': 'p',
  'ㅃ': 'pp',
  'ㅈ': 'z',
  'ㅉ': 'zz',
  'ㅜ': 'oo',
  'ㅡ': 'eu',
  'ㅢ': 'ee',
  'ㅚ': 'weh',
}

const verticalVowels: Record<string, 1> = {
  'ㅏ': 1,
  'ㅐ': 1,
  'ㅑ': 1,
  'ㅒ': 1,
  'ㅓ': 1,
  'ㅔ': 1,
  'ㅕ': 1,
  'ㅖ': 1,
  'ㅣ': 1,
}

const horizontalVowels: Record<string, 1> = {
  'ㅜ': 1,
  'ㅡ': 1,
  'ㅠ': 1,
  'ㅛ': 1,
  'ㅗ': 1,
}

const comboVowels: Record<string, 1> = {
  'ㅝ': 1,
  'ㅢ': 1,
  'ㅟ': 1,
  'ㅞ': 1,
  'ㅚ': 1,
  'ㅙ': 1,
  'ㅘ': 1,
}

const comboFinals: Record<string, 1> = {
  'ㅄ': 1,
  'ㅀ': 1,
  'ㄿ': 1,
  'ㄾ': 1,
  'ㄽ': 1,
  'ㄼ': 1,
  'ㄻ': 1,
  'ㄺ': 1,
  'ㄶ': 1,
  'ㄵ': 1,
  'ㄳ': 1,
}

export function isVertical(jamo: string): boolean {
  return jamo in verticalVowels
}

export function isHorizontal(jamo: string): boolean {
  return jamo in horizontalVowels
}

export function isCombo(jamo: string): boolean {
  return jamo in comboVowels
}

/** `C-V`, `C-H`, `C-W`, `C-V-C`, … or `P` for punctuation. */
export function getSyllableType(syllable: string): string | string[] {
  if (syllable.length > 1) {
    return syllable.split('').map(getSyllableType) as string[]
  }
  if (!isHangul(syllable)) return 'P'

  const jamos = decompose(syllable) ?? []
  const type = ['C']
  type.push(isCombo(jamos[1]) ? 'W' : isHorizontal(jamos[1]) ? 'H' : 'V')
  if (jamos[2]) type.push(jamos[2] in comboFinals ? 'CC' : 'C')
  return type.join('-')
}

/** Shape keys for each jamo of a syllable, in reading order. */
export function getShapeIDs(syllable: string): string[] {
  if (syllable.length > 1) {
    return syllable.split('').flatMap((char) => getShapeIDs(char))
  }

  const type = getSyllableType(syllable) as string
  const jamos = decompose(syllable) ?? []
  if (type === 'P') return [syllable]

  return jamos.map((jamo, i) => {
    const latin = jamo === '-' ? 'ng' : mapping[jamo]
    let id = type.toLowerCase().split('-')
    if (type.slice(4) === 'CC' && i < 2) id = ['c', 'v', 'c']
    id[i] = id[i].toUpperCase()
    return `jamo_${id.join('')}_${latin}`
  })
}

/** Shape key for a single jamo glyph. */
export function getShapeID(jamo: string): string {
  if (!isHangul(jamo) && jamo !== '-') return jamo
  const latin = jamo === '-' ? 'ng' : mapping[jamo]
  const type = isMedial(jamo)
    ? jamo in comboVowels
      ? 'W'
      : jamo in horizontalVowels
        ? 'H'
        : 'V'
    : jamo in comboFinals
      ? 'CC'
      : 'C'
  return `jamo_${type}_${latin}`
}

/** Transparent hit areas used to peek at a syllable's letters. */
export function getHintIDs(syllable: string): string[] {
  const type = getSyllableType(syllable) as string
  const ids: Record<string, string[]> = {
    'C-V': ['Cv', 'cV'],
    'C-H': ['Ch', 'cH'],
    'C-W': ['Cw', 'cW'],
    'C-V-C': ['Cvc', 'cVc', 'cvC'],
    'C-W-C': ['Cwc', 'cWc', 'cwC'],
    'C-H-C': ['Chc', 'cHc', 'chC'],
    'C-V-CC': ['Cvc', 'cVc', 'cvCC'],
    'C-W-CC': ['Cwc', 'cWc', 'cvCC'],
    'C-H-CC': ['Chc', 'cHc', 'cvCC'],
  }
  return (ids[type] ?? []).map((id) => `hint_${id}`)
}

export function getJamoHint(jamo: string, isInitial = false): string {
  if (jamo === '-' || (jamo === 'ㅇ' && isInitial)) return '∅'
  return friendlier[jamo] || mapping[jamo] || jamo
}

export function getJamoHintWithAlternate(jamo: string, isInitial = false): string {
  const main = friendlier[jamo] || mapping[jamo] || jamo
  const alt = alternates[jamo]
  if (jamo === 'ㅇ' && isInitial) return '—'
  return alt ? `${main} (${alt})` : main
}

export function formatSeconds(seconds: number): string {
  return seconds < 10
    ? `:0${seconds}`
    : seconds < 60
      ? `:${seconds}`
      : `${Math.floor(seconds / 60)}:${seconds % 60 < 10 ? '0' + (seconds % 60) : seconds % 60}`
}
