import { useCallback, useMemo, useSyncExternalStore } from "react";
import type { TranslationValues, LocaleCode } from "../types.js";
import { useI18nAdapter } from "./i18n-provider.js";

/**
 * A type-safe translation function that maps keys to translated strings.
 *
 * @typeParam TKeys - Union of allowed translation key strings.
 */
export type TranslateFunction<TKeys extends string = string> = (
  key: TKeys,
  values?: TranslationValues,
) => string;

/**
 * Represents the return value of the {@link useTranslation} hook.
 *
 * @typeParam TKeys - Union of allowed translation key strings.
 */
export interface UseTranslationReturn<TKeys extends string = string> {
  /** Translates a key within the hook's namespace. */
  t: TranslateFunction<TKeys>;
  /** The currently active locale code. */
  locale: LocaleCode;
  /** Checks whether a translation key exists in the hook's namespace. */
  exists: (key: string) => boolean;
}

/**
 * Provides namespace-scoped translation capabilities with automatic re-rendering on locale changes.
 *
 * Uses `useSyncExternalStore` to subscribe to locale changes from the adapter,
 * ensuring consistent rendering during concurrent React features.
 *
 * @typeParam TKeys - Union of allowed translation key strings for type-safe lookups.
 * @param namespace - The translation namespace to scope all lookups to.
 * @returns A {@link UseTranslationReturn} object with `t`, `locale`, and `exists`.
 *
 * @example
 * ```tsx
 * import { useTranslation } from "@simplix-react/i18n/react";
 *
 * function Greeting() {
 *   const { t, locale } = useTranslation("common");
 *   return <p>{t("greeting")} (locale: {locale})</p>;
 * }
 * ```
 */
export function useTranslation<TKeys extends string = string>(
  namespace: string,
): UseTranslationReturn<TKeys> {
  const i18n = useI18nAdapter();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!i18n) return () => {};
      return i18n.onLocaleChange(onStoreChange);
    },
    [i18n],
  );

  const getSnapshot = useCallback(() => {
    return i18n?.locale ?? "en";
  }, [i18n]);

  const locale = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const t = useCallback(
    (key: TKeys, values?: TranslationValues): string => {
      if (!i18n) return key;
      return i18n.tn(namespace, key, values);
    },
    [i18n, namespace],
  ) as TranslateFunction<TKeys>;

  const exists = useCallback(
    (key: string): boolean => {
      if (!i18n) return false;
      return i18n.exists(key, namespace);
    },
    [i18n, namespace],
  );

  return useMemo(
    () => ({
      t,
      locale,
      exists,
    }),
    [t, locale, exists],
  );
}

/**
 * Returns the {@link II18nAdapter} from context for direct adapter access.
 *
 * Shorthand for {@link useI18nAdapter}. Use {@link useTranslation} for namespace-scoped translations.
 */
export function useI18n() {
  return useI18nAdapter();
}

/**
 * Returns the currently active locale code and re-renders on locale changes.
 *
 * Uses `useSyncExternalStore` to subscribe to locale changes from the adapter.
 *
 * @returns The active {@link LocaleCode}.
 *
 * @example
 * ```tsx
 * import { useLocale } from "@simplix-react/i18n/react";
 *
 * function LocaleDisplay() {
 *   const locale = useLocale();
 *   return <span>Current: {locale}</span>;
 * }
 * ```
 */
export function useLocale(): LocaleCode {
  const i18n = useI18nAdapter();

  const subscribe = useCallback(
    (onStoreChange: () => void) => {
      if (!i18n) return () => {};
      return i18n.onLocaleChange(onStoreChange);
    },
    [i18n],
  );

  const getSnapshot = useCallback(() => {
    return i18n?.locale ?? "en";
  }, [i18n]);

  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
