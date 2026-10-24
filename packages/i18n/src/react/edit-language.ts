import { useCallback, useMemo, useSyncExternalStore } from "react";

import type { LocaleCode, LocaleConfig } from "../types.js";
import { DEFAULT_LOCALES } from "../utils/locale-config.js";
import { useLocalePicker } from "./use-locale-picker.js";

import { contentLanguageLabel } from "./content-language.js";

/**
 * Which language the multilingual fields on screen are editing.
 *
 * <p>One choice for the whole screen rather than one per field: a form's name and its
 * description are two halves of the same record, and a screen that shows the name in English
 * beside the description in Korean reads as a bug whichever half the operator is writing.
 * Held outside React so fields in separate components — a form and the dialog over it — move
 * together with no provider between them.
 *
 * <p>The choice is remembered against the locale it was made under, so a locale switch drops
 * it without anyone resetting anything: that switch is the reader saying which language they
 * are now working in.
 */
let choice: { locale: LocaleCode; language: LocaleCode } | null = null;
const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function chosenFor(locale: LocaleCode): LocaleCode | undefined {
  return choice && choice.locale === locale ? choice.language : undefined;
}

/** What a multilingual field needs to edit the language the screen is on. */
export interface I18nEditLanguage {
  /** The languages the field offers, in the framework's display order. */
  languages: LocaleConfig[];
  /** The language to edit. */
  selectedLanguage: LocaleCode;
  /** Called when the reader picks another language; every field on screen follows. */
  onLanguageChange: (language: LocaleCode) => void;
}

/**
 * Binds the screen's multilingual fields to the language the console is speaking.
 *
 * <p>Left to itself a field opens on the first configured language whatever the reader chose,
 * so an operator working in English edits the Korean text under an English label and sees
 * nothing wrong until somebody reads the record. Following the console's language means the
 * field opens on the language its reader writes, and a language switch moves it there.
 *
 * <p>Spread the result onto every {@code FormFields.I18nTextField} and
 * {@code FormFields.I18nTextareaField} on the screen; {@link I18nEditLanguage.languages} is
 * also what {@code seedI18nDefaults} needs.
 *
 * @return the props the fields take
 */
export function useI18nEditLanguage(): I18nEditLanguage {
  const { locale, locales } = useLocalePicker();

  // The picker speaks `{ value, displayName }` while the fields want the full locale config,
  // and the built-in list carries every locale the framework knows. Deriving one from the
  // other keeps the language strip to the locales this deployment actually ships.
  const languages = useMemo(
    () => DEFAULT_LOCALES.filter((config) => locales.some((option) => option.value === config.code)),
    [locales],
  );

  const picked = useSyncExternalStore(
    subscribe,
    () => chosenFor(locale),
    () => chosenFor(locale),
  );

  const onLanguageChange = useCallback(
    (language: LocaleCode) => {
      choice = { locale, language };
      for (const listener of listeners) listener();
    },
    [locale],
  );

  const offers = (code: LocaleCode | undefined): code is LocaleCode =>
    code !== undefined && languages.some((language) => language.code === code);

  return {
    languages,
    selectedLanguage: offers(picked)
      ? picked
      : offers(locale)
        ? locale
        : (languages[0]?.code ?? locale),
    onLanguageChange,
  };
}

/**
 * Binds a master name's multilingual field to the languages the RECORD is written in.
 *
 * <p><b>Two language axes, and this is the other one</b> (design 8.1). {@link useI18nEditLanguage}
 * follows the console's own language, which is the right axis for anything an operator reads;
 * a workplace name is read by a worker in the field app and printed on a posting, so it is
 * authored in the release language pack instead. A field bound to the console's three would
 * quietly make seven of the languages the product ships unreachable, and nothing on screen would
 * say a language was missing.
 *
 * <p>The codes come from the caller because which languages a deployment ships is the
 * application's decision, not this package's — a list baked in here would be wrong in the next
 * project that imports it.
 *
 * <p>The chosen language is shared with {@link useI18nEditLanguage} through one store, so a form
 * and the dialog over it stay on one language.
 *
 * @param codes the release language pack, in the order the field offers them
 * @return the props the fields take
 */
export function useContentEditLanguage(codes: readonly string[]): I18nEditLanguage {
  const { locale } = useLocalePicker();

  // A code the framework knows keeps its native display name; one it does not is named by the
  // platform instead of echoed. Dropping it would silently shorten the language strip, and showing
  // the tag put 「zh-Hans」 in a strip beside 「Русский」 and 「ភាសាខ្មែរ」 — the one language in the
  // release pack the framework's own list does not carry, and the one the reader could not name.
  // The tag is still what comes back where nothing can name it, which says a language was recorded
  // and this console cannot name it.
  const languages = useMemo<LocaleConfig[]>(
    () =>
      codes.map(
        (code) =>
          DEFAULT_LOCALES.find((config) => config.code === code) ?? {
            code,
            name: contentLanguageLabel(code, code),
            englishName: contentLanguageLabel(code, "en"),
          },
      ),
    [codes],
  );

  const picked = useSyncExternalStore(
    subscribe,
    () => chosenFor(locale),
    () => chosenFor(locale),
  );

  const onLanguageChange = useCallback(
    (language: LocaleCode) => {
      choice = { locale, language };
      for (const listener of listeners) listener();
    },
    [locale],
  );

  const offers = (code: LocaleCode | undefined): code is LocaleCode =>
    code !== undefined && languages.some((language) => language.code === code);

  return {
    languages,
    selectedLanguage: offers(picked)
      ? picked
      : offers(locale)
        ? locale
        : (languages[0]?.code ?? locale),
    onLanguageChange,
  };
}
