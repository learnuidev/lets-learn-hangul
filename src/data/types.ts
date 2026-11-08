/**
 * Shapes of the static course content. These mirror the original JSON payloads
 * that the Express server used to generate for the client.
 */

/** Raw markdown blocks as authored, before `processText` splits them into slides. */
export type RawTextSet = Record<string, string>;

/** Markdown blocks after `processText`, keyed by screen (intro, word, start, outro…). */
export type TextSet = Record<string, string[]>;

export interface CourseRound {
  round: number;
  name: string;
  headword?: string;
  jamo?: string[];
  words?: string[];
  text: RawTextSet;
}

export interface CourseLevel {
  level: number;
  name: string;
  text: RawTextSet;
  rounds: CourseRound[];
}

/** A level after `extractLevels`: rounds become `"1.1"`-style keys. */
export interface Level {
  level: number;
  name: string;
  text: TextSet;
  rounds: string[];
}

/** A round after `extractRounds`. */
export interface Round {
  round: number;
  name: string;
  headword?: string;
  jamo?: string[];
  words?: string[];
  text: TextSet;
}

export interface Jamo {
  jamo: string;
  latin: string;
  description: string;
  memory: string;
  audio?: { url: string };
}

export interface MediaSource {
  description: string;
  url: string;
}

export interface Word {
  word: string;
  translation?: string;
  latin?: string;
  romanizations?: string[];
  image?: { url: string; source?: MediaSource };
  audio?: { url: string; source?: MediaSource };
}

export interface Credit {
  word: string;
  user: string;
  url: string;
}

/** Pronunciation rules consumed by the romanizer. */
export interface RomanizationRules {
  initial?: string;
  final?: string;
  alternateInitial?: string;
  alternateFinal?: string;
  beforeNasal?: string;
  beforeR?: string;
  alternateBeforeNasal?: string;
  alternateBeforeR?: string;
  beforeVowel?: string | string[];
  beforeIY?: string;
  finalBeforeIY?: string;
  stop?: string;
  normal?: string;
  alternates?: string[];
  alernates?: string[];
  afterNull?: string[];
  afterR?: string;
  alternateAfterR?: string;
  afterN?: string;
  alternateAfterN?: string;
  afterM?: string;
  alternateAfterM?: string;
  afterG?: string;
  alternateAfterG?: string;
  afterNg?: string;
  alternateAfterNg?: string;
  afterB?: string;
  alternateAfterB?: string;
  afterS?: string | string[];
  alternatesAfterS?: string[];
}

/** Lookup tables shared by every screen, produced by the root route loader. */
export interface CourseData {
  levels: Record<string, Level>;
  rounds: Record<string, Round>;
  jamos: Record<string, Jamo>;
  words: Record<string, Word>;
  shapes: Record<string, string>;
  geometric: Record<string, string>;
}

/** One reading of a jamo: a literal passthrough or a list of accepted romaja. */
export interface JamoReadings {
  literal?: string;
  [index: number]: string | undefined;
  length: number;
  push: (...items: string[]) => number;
}

export interface SyllableRomanization {
  ideal: string;
  pattern: string;
  regexp: RegExp;
}

export interface Romanization {
  ideal: string;
  regexp: RegExp;
  possibilities: string[];
  primary: string[][];
  syllables: SyllableRomanization[];
}

export interface RomanizationResult {
  correct: boolean;
  reason?: string;
  wrongChar?: number;
}
