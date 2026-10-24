/**
 * The two forms a Korean particle takes, in the order the language picks them: the one that
 * follows a final consonant, then the one that follows a vowel.
 */
export type KoreanParticle = readonly [afterConsonant: string, afterVowel: string];

/** The particles a screen interpolates a name in front of. */
export const KOREAN_PARTICLES = {
  subject: ["이", "가"],
  topic: ["은", "는"],
  object: ["을", "를"],
  with: ["과", "와"],
  toward: ["으로", "로"],
} as const satisfies Record<string, KoreanParticle>;

const HANGUL_FIRST = 0xac00;
const HANGUL_LAST = 0xd7a3;
const FINAL_CONSONANT_COUNT = 28;
/** ㄹ takes the vowel form of 으로/로, alone among the final consonants. */
const RIEUL = 8;

/** Latin letters a Korean reader ends on a vowel: admin → 어드민, but soma → 소마. */
const LATIN_VOWEL_ENDINGS = new Set(["a", "e", "i", "o", "u", "y"]);
/** Digits whose Korean reading ends on a vowel: 2 이 · 4 사 · 5 오 · 9 구. */
const DIGIT_VOWEL_ENDINGS = new Set(["2", "4", "5", "9"]);
/** Endings read with a final ㄹ, which sides with the vowels for 으로/로: 1 일 · 7 칠 · 8 팔 · l 엘. */
const RIEUL_ENDINGS = new Set(["1", "7", "8", "l", "L"]);

/**
 * Picks the form of a particle that follows this word.
 *
 * @remarks
 * Korean chooses between two forms by whether the preceding syllable ends in a consonant. A name
 * interpolated into a sentence is not known when the sentence is written, which is why so many
 * strings end up carrying `(으)로` and `이(가)` — readable, but not what anyone would write by
 * hand. The sentence keeps naming which particle it wants; this only decides which of its two
 * forms the word in front of it calls for.
 *
 * <p>A Latin name or a digit has no final consonant to read from its code point, but a Korean
 * reader still ends it on one — "admin" is 어드민 and takes 이, "PACS" is 팩스 and takes 이, while
 * "Pro" is 프로 and takes 가. Deciding those by the letter or digit is what keeps an operator's
 * own username out of "admin가". Anything else — a bracket, a symbol, CJK — keeps the vowel form.
 *
 * <p>The letter rule reads the spelling, not the pronunciation, so a name whose final vowel is
 * silent ("Jane" → 제인) is judged a vowel ending and gets the wrong form. Korean has no way to
 * settle that from the spelling alone; the sentence avoids it by not putting a particle behind a
 * name it cannot read.
 *
 * @param word the word the particle follows
 * @param particle one of {@link KOREAN_PARTICLES}
 * @returns the form to write after that word
 */
export function koreanParticle(word: string | null | undefined, particle: KoreanParticle): string {
  const [afterConsonant, afterVowel] = particle;
  const last = (word ?? "").trim().slice(-1);
  if (!last) return afterVowel;

  // 으로 is the one pair where ㄹ sides with the vowels: 서울로, never 서울으로.
  const rieulTakesVowel = afterConsonant === "으로";

  const code = last.charCodeAt(0);
  if (code < HANGUL_FIRST || code > HANGUL_LAST) {
    if (/[A-Za-z]/.test(last)) {
      if (LATIN_VOWEL_ENDINGS.has(last.toLowerCase())) return afterVowel;
      return rieulTakesVowel && RIEUL_ENDINGS.has(last) ? afterVowel : afterConsonant;
    }
    if (/[0-9]/.test(last)) {
      if (DIGIT_VOWEL_ENDINGS.has(last)) return afterVowel;
      return rieulTakesVowel && RIEUL_ENDINGS.has(last) ? afterVowel : afterConsonant;
    }
    return afterVowel;
  }

  const finalConsonant = (code - HANGUL_FIRST) % FINAL_CONSONANT_COUNT;
  if (finalConsonant === 0) return afterVowel;
  if (finalConsonant === RIEUL && rieulTakesVowel) return afterVowel;
  return afterConsonant;
}

/**
 * The form of a particle to write after this word on THIS screen's language.
 *
 * <p><b>A particle is Korean grammar, and the sentence around it is not always Korean.</b> The
 * same catalogue key carries `{{particle}}` in every language — it has to, or the value is dropped
 * in silence in the ones that lack it — so what changes per language is the value, and outside
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
  word: string | null | undefined,
  particle: KoreanParticle,
): string {
  return locale?.startsWith("ko") ? koreanParticle(word, particle) : "";
}
