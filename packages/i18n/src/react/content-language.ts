import { useLocale } from "./use-translation.js";

/**
 * What a content language is called, in the language the reader is reading.
 *
 * <p><b>Asked of the platform rather than kept in a catalogue.</b> The release pack is eleven
 * languages and the console is read in three, so a hand-kept list is thirty-three names to write
 * and to keep in step with the pack — and every language added later is a row somebody has to
 * remember in three files. `Intl.DisplayNames` already holds all of them, in every language the
 * browser ships.
 *
 * <p><b>The tag comes back when nothing can name it.</b> A locale the runtime does not recognise
 * is shown as it was stored, which is worse than a name and far better than an empty field: a
 * reader who sees 「xx-YY」 knows a language was recorded and that this console cannot name it,
 * where a blank says nothing was.
 *
 * @param tag the language tag as it was stored, e.g. `vi` or `zh-Hans`
 * @param uiLocale the language the reader is reading the console in
 * @returns the language's name, or the tag itself where nothing can name it
 */
export function contentLanguageLabel(tag: string, uiLocale: string): string {
  if (!tag) {
    return "";
  }
  try {
    return new Intl.DisplayNames([uiLocale], { type: "language" }).of(tag) ?? tag;
  } catch {
    // An unrecognised tag throws rather than returning nothing, and a field that shows the tag is
    // the point of the fallback.
    return tag;
  }
}

/**
 * {@link contentLanguageLabel}, bound to the language the console is currently read in.
 *
 * @returns a function naming one language tag
 */
export function useContentLanguageLabel(): (tag: string | null | undefined) => string {
  const uiLocale = useLocale();
  return (tag) => contentLanguageLabel(tag ?? "", uiLocale);
}

/** What separates one language from the next wherever this console lists several. */
const LANGUAGE_SEPARATOR = " · ";

/**
 * Several language tags, named and joined the way this console lists them.
 *
 * <p><b>A joined string is accepted as well as a list</b> because a server that has already
 * flattened its tags sends them that way, and splitting the join back apart recovers exactly what
 * it flattened. Anything the runtime cannot name comes back as it was stored, so a token that was
 * never a language tag survives the round trip unchanged rather than disappearing.
 *
 * @param tags the tags, as a list or joined with the same separator
 * @param uiLocale the language the reader is reading the console in
 * @returns their names, joined
 */
export function contentLanguageNames(
  tags: readonly string[] | string | null | undefined,
  uiLocale: string,
): string {
  const list = typeof tags === "string" ? tags.split(LANGUAGE_SEPARATOR) : (tags ?? []);
  return list
    .map((tag) => contentLanguageLabel(tag.trim(), uiLocale))
    .filter(Boolean)
    .join(LANGUAGE_SEPARATOR);
}

/**
 * {@link contentLanguageNames}, bound to the language the console is currently read in.
 *
 * @returns a function naming several language tags at once
 */
export function useContentLanguageNames(): (
  tags: readonly string[] | string | null | undefined,
) => string {
  const uiLocale = useLocale();
  return (tags) => contentLanguageNames(tags, uiLocale);
}

/**
 * A language named in its own words with the reader's name for it beside it — 「English(영어)」.
 *
 * <p><b>Both names, because both readers matter.</b> The endonym is what the person the wording
 * goes to would recognise, and the exonym is what the administrator choosing it reads — an
 * operator working in Korean who meets a strip of 「English · Tiếng Việt · ភាសាខ្មែរ」 has to know
 * three scripts to pick the second, and one who meets only 「베트남어」 cannot tell which of the
 * stored tags it is. Neither name alone answers for both.
 *
 * <p>Nothing is appended where the two names are the same word, which is every language read in
 * its own console language: 한국어 stays 한국어 rather than becoming 「한국어(한국어)」.
 *
 * @param tag the language tag as it was stored
 * @param endonym what the language calls itself, where the caller already holds it
 * @param uiLocale the language the reader is reading the console in
 * @returns the endonym with the reader's own name for it in brackets, or the endonym alone
 */
export function contentLanguageDualName(
  tag: string,
  endonym: string,
  uiLocale: string,
): string {
  const own = endonym || contentLanguageLabel(tag, tag);
  const theirs = contentLanguageLabel(tag, uiLocale);
  if (!own) return theirs || tag;
  return theirs && theirs !== own ? `${own}(${theirs})` : own;
}
