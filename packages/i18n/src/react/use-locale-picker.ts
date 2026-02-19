import { useCallback, useMemo } from "react";
import type { LocaleCode } from "../types.js";
import { useI18nAdapter } from "./i18n-provider.js";
import { useLocale } from "./use-translation.js";

/**
 * Represents a single locale option for a locale picker UI.
 */
export interface LocaleOption {
  /** The locale code (e.g. `"en"`, `"ko"`). */
  value: LocaleCode;
  /** Human-readable display name in the locale's own language (e.g. `"English"`, `"한국어"`). */
  displayName: string;
}

/**
 * Return value of the {@link useLocalePicker} hook.
 */
export interface UseLocalePickerReturn {
  /** The currently active locale code. */
  locale: LocaleCode;
  /** Available locale options with display names. */
  locales: LocaleOption[];
  /** Switches to the given locale. */
  setLocale: (locale: LocaleCode) => void;
}

function getDisplayName(locale: string): string {
  try {
    return (
      new Intl.DisplayNames([locale], { type: "language" }).of(locale) ?? locale
    );
  } catch {
    return locale;
  }
}

/**
 * Headless hook for building locale picker UIs.
 *
 * Provides the current locale, available locales with display names,
 * and a setter — all derived from the nearest {@link I18nProvider}.
 *
 * @returns A {@link UseLocalePickerReturn} with locale state and actions.
 *
 * @example
 * ```tsx
 * import { useLocalePicker } from "@simplix-react/i18n/react";
 *
 * function MyLocalePicker() {
 *   const { locale, locales, setLocale } = useLocalePicker();
 *   return (
 *     <select value={locale} onChange={(e) => setLocale(e.target.value)}>
 *       {locales.map((l) => (
 *         <option key={l.value} value={l.value}>{l.displayName}</option>
 *       ))}
 *     </select>
 *   );
 * }
 * ```
 */
export function useLocalePicker(): UseLocalePickerReturn {
  const adapter = useI18nAdapter();
  const locale = useLocale();

  const locales = useMemo<LocaleOption[]>(
    () =>
      (adapter?.availableLocales ?? []).map((loc) => ({
        value: loc,
        displayName: getDisplayName(loc),
      })),
    // Re-derive when locale changes (display names use the locale's own language)
    [adapter, locale],
  );

  const setLocale = useCallback(
    (loc: LocaleCode) => {
      adapter?.setLocale(loc);
    },
    [adapter],
  );

  return useMemo(
    () => ({ locale, locales, setLocale }),
    [locale, locales, setLocale],
  );
}
