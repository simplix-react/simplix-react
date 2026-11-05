/**
 * The two forms a Korean particle takes, in the order the language picks them: the one that
 * follows a final consonant, then the one that follows a vowel.
 */
export type KoreanParticle = readonly [afterConsonant: string, afterVowel: string];

/** The particles a screen interpolates a value in front of. */
export const KOREAN_PARTICLES = {
  subject: ["이", "가"],
  topic: ["은", "는"],
  object: ["을", "를"],
  with: ["과", "와"],
  toward: ["으로", "로"],
  or: ["이나", "나"],
  quote: ["이라고", "라고"],
} as const satisfies Record<string, KoreanParticle>;

/** How the last pronounced character of a word ends when read aloud. */
type FinalSound = "vowel" | "consonant" | "rieul";

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
const FINAL_CONSONANT_COUNT = 28;
/** Index of ㄹ among the final consonants of a syllable block. */
const RIEUL = 8;

/** How each digit ends when read aloud: 영 · 일 · 이 · 삼 · 사 · 오 · 육 · 칠 · 팔 · 구. */
const DIGIT_SOUND: Readonly<Record<string, FinalSound>> = {
  "0": "consonant",
  "1": "rieul",
  "2": "vowel",
  "3": "consonant",
  "4": "vowel",
  "5": "vowel",
  "6": "consonant",
  "7": "rieul",
  "8": "rieul",
  "9": "vowel",
};

/** Latin letters are read by name (에이 · 비 · 씨 ...); only 엘 · 엠 · 엔 · 알 end in a consonant. */
const LETTER_SOUND: Readonly<Record<string, FinalSound>> = {
  l: "rieul",
  r: "rieul",
  m: "consonant",
  n: "consonant",
};

/** Signs read aloud, each ending in a vowel: 플러스 · 퍼센트 · 앤드. */
const SPOKEN_SIGNS = new Set(["+", "%", "&"]);

/** An amount led by its currency sign: ₩14,900 is read 만사천구백 원, $12 is read 십이 달러. */
const AMOUNT = /^([₩$])[\d.,]+$/;

function finalSound(word: string): FinalSound {
  const amount = AMOUNT.exec(word);
  if (amount !== null) return amount[1] === "₩" ? "consonant" : "vowel";
  for (let i = word.length - 1; i >= 0; i -= 1) {
    const code = word.charCodeAt(i);
    if (code >= HANGUL_FIRST && code <= HANGUL_LAST) {
      const finalConsonant = (code - HANGUL_FIRST) % FINAL_CONSONANT_COUNT;
      if (finalConsonant === 0) return "vowel";
      return finalConsonant === RIEUL ? "rieul" : "consonant";
    }
    const char = word[i] ?? "";
    const digit = DIGIT_SOUND[char];
    if (digit !== undefined) return digit;
    if (/[a-z]/i.test(char)) return LETTER_SOUND[char.toLowerCase()] ?? "vowel";
    if (SPOKEN_SIGNS.has(char)) return "vowel";
    // Quotes, brackets, stops, spaces and the rest are not pronounced: read the character before.
  }
  return "vowel";
}

/**
 * Picks the form of a particle that follows this word.
 *
 * @remarks
 * Korean chooses between two forms by whether the word ends in a final consonant. A value
 * interpolated into a sentence (a plan, a name, an address, an amount) is not known when the
 * sentence is written, so the sentence names the particle it wants and this decides which of its
 * two forms the value calls for.
 *
 * <p>The word is read from its end, skipping what is not pronounced (quotes, brackets, stops).
 * A Hangul syllable answers by its final consonant. A digit answers by its Korean reading
 * (`2` 이 and `9` 구 end in a vowel, `3` 삼 in a consonant, `1` 일 in ㄹ). A Latin letter is read
 * by its name, so only `l` 엘, `m` 엠, `n` 엔 and `r` 알 end in a consonant: `PDF` takes 가 and
 * `KPM` takes 이. `+`, `%` and `&` are read 플러스, 퍼센트 and 앤드. An amount led by `₩` is read
 * with 원 and one led by `$` with 달러. A word with nothing to read takes the vowel form.
 *
 * <p>ㄹ sides with the vowels for 으로/로 alone: 서울로, but 서울을.
 *
 * <p>Letters are read by name, never as an English word, because the spelling does not settle
 * the reading: a name the reader says as a word ("Book" 북) gets the form its last letter's name
 * calls for, and a sentence that cannot accept that does not put a particle behind such a name.
 *
 * @param word the word the particle follows
 * @param particle one of {@link KOREAN_PARTICLES}
 * @returns the form to write after that word
 *
 * @example
 * ```ts
 * import { KOREAN_PARTICLES, koreanParticle } from "@simplix-react/i18n";
 *
 * koreanParticle("Pro", KOREAN_PARTICLES.object); // "를"
 * koreanParticle("Team", KOREAN_PARTICLES.toward); // "으로"
 * ```
 */
export function koreanParticle(
  word: string | number | null | undefined,
  particle: KoreanParticle,
): string {
  const [afterConsonant, afterVowel] = particle;
  const sound = finalSound(String(word ?? ""));
  if (afterConsonant === KOREAN_PARTICLES.toward[0]) {
    return sound === "consonant" ? afterConsonant : afterVowel;
  }
  return sound === "vowel" ? afterVowel : afterConsonant;
}

/**
 * The form of a particle to write after this word on THIS screen's language.
 *
 * <p><b>A particle is Korean grammar, and the sentence around it is not always Korean.</b> The
 * same catalogue key carries `{{particle}}` in every language (it has to, or the value is dropped
 * in silence in the ones that lack it), so what changes per language is the value, and outside
 * Korean the value is nothing. Passing 「와」 into an English sentence is the failure this avoids,
 * and it is invisible until somebody reads the console in English.
 *
 * @param locale the language the sentence is being written in
 * @param word the word the particle follows
 * @param particle one of {@link KOREAN_PARTICLES}
 * @returns the form to write after that word, or an empty string outside Korean
 */
export function localeParticle(
  locale: string | undefined,
  word: string | number | null | undefined,
  particle: KoreanParticle,
): string {
  return locale?.startsWith("ko") ? koreanParticle(word, particle) : "";
}

/** The name a catalogue gives the particle formatter: `{{plan, josa(을/를)}}`. */
export const KOREAN_PARTICLE_FORMAT = "josa";

/** Each registered particle by the name a catalogue writes it under: "을/를", "으로/로". */
const PARTICLE_BY_NAME: ReadonlyMap<string, KoreanParticle> = new Map(
  Object.values(KOREAN_PARTICLES).map((pair) => [`${pair[0]}/${pair[1]}`, pair] as const),
);

/** The names a catalogue may give the particle formatter, in {@link KOREAN_PARTICLES} order. */
export const KOREAN_PARTICLE_NAMES: readonly string[] = [...PARTICLE_BY_NAME.keys()];

/**
 * The i18next formatter behind `{{value, josa(을/를)}}`: the value followed by the form of the
 * particle its last sound calls for, so a Korean catalogue writes 「{{plan, josa(을/를)}} 계속 씁니다」
 * and renders 「Pro를 계속 씁니다」 or 「Team을 계속 씁니다」.
 *
 * @remarks
 * The particle is the option's NAME, never the value of a keyed option: i18next spreads the
 * call's interpolation values over the format options, so a keyed option is overwritten by any
 * value of the same name, and a Hangul pair is a name no value carries. Exactly one registered
 * pair ({@link KOREAN_PARTICLE_NAMES}) must be named; anything else throws, which i18next logs
 * and answers with the bare value. Outside Korean the value is returned unchanged, so a Korean
 * sentence rendered under another language's fallback never gains a Hangul particle.
 *
 * @param value the interpolated value
 * @param lng the language the sentence is rendered in
 * @param options the format options i18next passes, the particle pair among their names
 * @returns the value with its particle in Korean, the value alone otherwise
 */
export function formatKoreanParticle(
  value: unknown,
  lng: string | undefined,
  options: Readonly<Record<string, unknown>> | undefined,
): string {
  const word = value === null || value === undefined ? "" : String(value);
  const named = Object.keys(options ?? {}).filter((name) => PARTICLE_BY_NAME.has(name.trim()));
  const pair = named.length === 1 ? PARTICLE_BY_NAME.get(named[0]!.trim()) : undefined;
  if (pair === undefined) {
    throw new Error(
      `${KOREAN_PARTICLE_FORMAT} names one particle of ${KOREAN_PARTICLE_NAMES.join(", ")}; it named ${named.length === 0 ? "none" : named.join(", ")}`,
    );
  }
  return lng?.startsWith("ko") ? word + koreanParticle(word, pair) : word;
}
