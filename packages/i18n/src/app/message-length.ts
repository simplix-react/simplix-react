/** How many bytes a character outside the ASCII range costs, which is what a channel counts. */
const WIDE_BYTES = 2;

/** How long one wording is, both ways a channel counts it. */
export interface MessageLength {
  /** What a person reads. */
  readonly characters: number;
  /** What the channel's ceiling is stated in. */
  readonly bytes: number;
}

/**
 * How long a wording is, both ways a channel counts it.
 *
 * <p><b>A channel's ceiling is in bytes and a person reads characters</b>, so the two are said
 * together — a wording that fits on screen can still be refused for being twice as long as it
 * looks.
 *
 * <p><b>Two bytes for anything outside ASCII, which is what an SMS gateway counts.</b> Not UTF-8,
 * where a Korean letter is three: the figure exists to be held against a channel's limit, and a
 * limit of 90 is 90 of these. A server storing the UTF-8 length and a screen computing this one
 * put two different numbers on the same wording, which is why there is one function.
 *
 * @param body the wording
 * @returns its length in characters and in bytes
 */
export function messageLength(body: string | null | undefined): MessageLength {
  const text = body ?? "";
  let bytes = 0;
  for (const character of text) {
    // The code point, so a surrogate pair is one character costing the wide width once.
    bytes += (character.codePointAt(0) ?? 0) < 128 ? 1 : WIDE_BYTES;
  }
  return { characters: [...text].length, bytes };
}
