/**
 * Hangul decomposition helpers.
 *
 * Ported from hangul-js 1.1.2 (http://github.com/clee704/hangul-js,
 * MIT © Choongmin Lee), trimmed to the functions this app actually uses and
 * rewritten as ES modules with types.
 */

const JAMO_START = 0x3131;
const JAMO_END = 0x3163;
const SYLLABLE_START = 0xac00;
const SYLLABLE_END = 0xd7a3;

class JamoMap {
  readonly items: Record<string, string> = {};
  readonly inverseItems: Record<string, string> = {};

  constructor(entries?: Record<string, string>) {
    if (entries) {
      for (const [key, value] of Object.entries(entries)) this.add(key, value);
    }
  }

  add(key: string, value: string) {
    this.items[key] = value;
    this.inverseItems[value] = key;
  }

  hasValue(value: string | undefined): boolean {
    return value !== undefined && value in this.inverseItems;
  }

  get(key: number): string | undefined {
    return this.items[String(key)];
  }

  getInverse(value: string): string | undefined {
    return this.inverseItems[value];
  }
}

function collectJamo(from: number, to: number, exclude?: number[]): JamoMap {
  const map = new JamoMap();
  const length = to - from + 1;
  let j = 0;
  for (let i = 0; i < length; i++) {
    if (!exclude || exclude.indexOf(i) < 0) {
      map.add(String(j++), String.fromCharCode(i + from));
    }
  }
  return map;
}

export const jamo = collectJamo(JAMO_START, JAMO_END);
export const initials = collectJamo(JAMO_START, 0x314e, [
  2, 4, 5, 9, 10, 11, 12, 13, 14, 15, 19,
]);
export const medials = collectJamo(0x314f, JAMO_END);
export const finals = collectJamo(JAMO_START, 0x314e, [7, 18, 24]);

const doubleJamo = new JamoMap({
  '\u3133': '\u3131\u3145',
  '\u3135': '\u3134\u3148',
  '\u3136': '\u3134\u314e',
  '\u313a': '\u3139\u3131',
  '\u313b': '\u3139\u3141',
  '\u313c': '\u3139\u3142',
  '\u313d': '\u3139\u3145',
  '\u313e': '\u3139\u314c',
  '\u313f': '\u3139\u314d',
  '\u3140': '\u3139\u314e',
  '\u3144': '\u3142\u3145',
  '\u3132': '\u3131\u3131',
  '\u3138': '\u3137\u3137',
  '\u3143': '\u3142\u3142',
  '\u3146': '\u3145\u3145',
  '\u3149': '\u3148\u3148',
  '\u3158': '\u3157\u314f',
  '\u3159': '\u3157\u3150',
  '\u315a': '\u3157\u3163',
  '\u315d': '\u315c\u3153',
  '\u315e': '\u315c\u3154',
  '\u315f': '\u315c\u3163',
  '\u3162': '\u3161\u3163',
});

const iotizedVowels = new Set([
  '\u3163',
  '\u3151',
  '\u3152',
  '\u3155',
  '\u3156',
  '\u315b',
  '\u3160',
]);

export function isSyllable(str: string | undefined): boolean {
  if (!str) return false;
  const code = str.charCodeAt(0);
  return SYLLABLE_START <= code && code <= SYLLABLE_END;
}

export function isHangul(str: string | undefined): boolean {
  if (!str) return false;
  const char = str.charAt(0);
  return jamo.hasValue(char) || isSyllable(char);
}

export function isJamo(str: string | undefined): boolean {
  return !!str && jamo.hasValue(str.charAt(0));
}

export function isInitial(str: string | undefined): boolean {
  return !!str && initials.hasValue(str.charAt(0));
}

export function isMedial(str: string | undefined): boolean {
  return !!str && medials.hasValue(str.charAt(0));
}

export function isFinal(str: string | undefined): boolean {
  return !!str && finals.hasValue(str.charAt(0));
}

export function getInitial(str: string): string | undefined {
  const code = str.charCodeAt(0);
  return initials.get(Math.floor((code - SYLLABLE_START) / 28 / 21));
}

export function getMedial(str: string): string | undefined {
  const code = str.charCodeAt(0);
  return medials.get(Math.floor((code - SYLLABLE_START) / 28) % 21);
}

export function getFinal(str: string): string | undefined {
  const code = str.charCodeAt(0);
  const i = (code - SYLLABLE_START) % 28;
  return i > 0 ? finals.get(i - 1) : i === 0 ? '' : undefined;
}

/**
 * Splits the first character of `str` into its constituent jamo. Returns
 * `undefined` when the character is not a modern Hangul syllable.
 */
export function decompose(str: string | undefined): string[] | undefined {
  if (!str) return undefined;
  const char = str.charAt(0);
  if (!isSyllable(char)) return undefined;
  const parts = [getInitial(char), getMedial(char), getFinal(char)].filter(
    (part): part is string => part !== undefined,
  );
  if (parts[2] === '') parts.pop();
  return parts;
}

export function compose(
  initial: string,
  medial: string,
  final?: string,
): string | undefined {
  const x = initials.getInverse(initial);
  const y = medials.getInverse(medial);
  if (x === undefined || y === undefined) return undefined;
  const z = final === undefined || final === '' ? 0 : (finals.getInverse(final) ?? '') === '' ? 0 : Number(finals.getInverse(final)) + 1;
  const char = String.fromCharCode(SYLLABLE_START + (Number(x) * 21 + Number(y)) * 28 + Number(z));
  return isSyllable(char) ? char : undefined;
}

export function composeDoubleJamo(first: string, second: string): string | undefined {
  return doubleJamo.getInverse(first + second);
}

export function decomposeDoubleJamo(char: string): string[] | undefined {
  const pair = doubleJamo.items[char];
  return pair === undefined ? undefined : [pair.charAt(0), pair.charAt(1)];
}

export function isIotizedVowel(str: string | undefined): boolean {
  return !!str && iotizedVowels.has(str.charAt(0));
}
