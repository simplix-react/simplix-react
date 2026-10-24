import type { LocaleCode, LocaleConfig } from "../types.js";

import { getFallbackLocale } from "./app-locale.js";

/** A per-locale value map as the i18n form fields speak it. */
type I18nMap = Record<LocaleCode, string>;


/**
 * The languages to try, in fallback order: the deployment's fallback language first, then the
 * order the form offers them.
 *
 * <p>Read per call rather than captured, so a deployment that changes its fallback is followed
 * the next time a form opens without anything having to be reloaded.
 *
 * @param languages the locales the form offers, in the order it offers them
 * @return the same locales, the fallback language first
 */
function inFallbackOrder(languages: LocaleConfig[]): LocaleConfig[] {
  const fallbackLocale = getFallbackLocale();
  const fallback = languages.filter((language) => language.code === fallbackLocale);
  return fallback.length === 0
    ? languages
    : [...fallback, ...languages.filter((language) => language.code !== fallbackLocale)];
}

/**
 * The per-locale map an edit form should open with.
 *
 * <p>A record written before its screen grew language tabs — or through any path that only ever
 * filled the base column — carries a name and an empty map. Handing that map to an i18n field
 * renders every tab blank, so the operator sees a required field with nothing in it under a
 * header naming the very value that is missing, and a save either wipes the name or is refused.
 *
 * <p>The base value is therefore seeded into the language a record falls back to, which is the
 * language the server resolves to when the reader's has no entry. A map that already holds
 * anything is left exactly as it is — the record has said what it means.
 *
 * @param map the record's per-locale values, possibly absent or empty
 * @param base the record's base column value
 * @param languages the locales the form offers, in the order it offers them
 * @return the map to edit
 */
export function seedI18nDefaults(
  map: I18nMap | undefined | null,
  base: string | undefined | null,
  languages: LocaleConfig[],
): I18nMap {
  if (map && Object.keys(map).length > 0) return map;
  const fallback = inFallbackOrder(languages)[0]?.code;
  if (!fallback || !base) return map ?? {};
  return { [fallback]: base } as I18nMap;
}

/**
 * What a reader whose language this record has no entry for will actually see.
 *
 * <p>Both halves of the product fall back the same way — the server resolves a locale map
 * against the base column, and the base column holds the fallback language when it was filled — so a
 * language left blank is not blank on screen: it shows this. Shown as the field's placeholder,
 * it answers the question an empty language tab otherwise leaves open.
 *
 * @param map the per-locale values as edited
 * @param languages the locales the form offers, in the order it offers them
 * @return the text an unfilled language falls back to, empty when nothing is filled
 */
export function i18nFallbackText(
  map: I18nMap | undefined | null,
  languages: LocaleConfig[],
): string {
  return i18nBaseValue(map, languages);
}

/**
 * The value a record's base column takes when its language entries are saved.
 *
 * <p>The fallback language if the operator filled it, else the first language they did, so the
 * column a surface falls back to — and the column an export or a snapshot copies — holds a name
 * rather than nothing. The CRUD forms get this from the framework's submit helper; a screen that
 * writes its row without one calls this instead of picking a language of its own.
 *
 * @param map the per-locale values as edited
 * @param languages the locales the form offers, in the order it offers them
 * @return the value for the base column, empty when no language was filled
 */
export function i18nBaseValue(
  map: I18nMap | undefined | null,
  languages: LocaleConfig[],
): string {
  if (!map) return "";
  for (const language of inFallbackOrder(languages)) {
    const value = map[language.code];
    if (value && value.trim() !== "") return value;
  }
  const filled = Object.values(map).find((value) => value && value.trim() !== "");
  return filled ?? "";
}

/**
 * Whether some language carries a value, which is what makes a translated field a filled one.
 *
 * <p><b>The rule a required multilingual field is held to.</b> `required` on the control refuses a
 * save whenever the strip is on a language nobody has translated yet, which is a language still to
 * fill rather than a save to block — so the mark follows the base language and the refusal asks
 * this instead. Asked without the locale list on purpose: a language outside the strip is still an
 * answer, and a record written before a language was added still has a name.
 *
 * @param map the per-locale values as edited
 * @return whether any language has one
 */
export function someLanguageFilled(map: I18nMap | undefined | null): boolean {
  return Object.values(map ?? {}).some((value) => typeof value === "string" && value.trim() !== "");
}
