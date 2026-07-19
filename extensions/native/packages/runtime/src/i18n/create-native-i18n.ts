import AsyncStorage from "@react-native-async-storage/async-storage";
import { setRequestLocale } from "@simplix-react/api";
import {
  createI18nConfig,
  type CreateI18nConfigOptions,
  type I18nConfigResult,
} from "@simplix-react/i18n";
import { getLocales } from "expo-localization";

const LOCALE_STORAGE_KEY = "simplix.i18n.locale";

/** Options for {@link createNativeI18n}. */
export interface CreateNativeI18nOptions
  extends Omit<CreateI18nConfigOptions, "detection"> {
  /**
   * Persist the selected locale across launches (AsyncStorage). Disable for
   * shared/unattended devices that must reset to the default language
   * (kiosks). Defaults to `true`.
   */
  persistLocale?: boolean;
  /** AsyncStorage key for the persisted locale. */
  storageKey?: string;
}

/**
 * React Native i18n initialization: the same i18n core as the web with a
 * native detection/persistence adapter. Locale resolution order inside
 * `i18nReady`: persisted locale (AsyncStorage) → device language
 * (expo-localization) → `defaultLocale`.
 *
 * Returns synchronously (module-scope friendly for expo-router layouts);
 * await `i18nReady` through the provider's `ready` gate. The active locale
 * is wired into API requests (`Accept-Language`) exactly like the web boot.
 *
 * @example
 * ```ts
 * export const i18n = createNativeI18n({
 *   defaultLocale: "ko",
 *   supportedLocales: ["en", "ko", "ja"],
 * });
 * ```
 */
export function createNativeI18n(
  options: CreateNativeI18nOptions,
): I18nConfigResult {
  const {
    persistLocale = true,
    storageKey = LOCALE_STORAGE_KEY,
    supportedLocales,
    ...rest
  } = options;

  const supported = (supportedLocales ?? []).map((entry) =>
    typeof entry === "string" ? entry : entry.code,
  );
  const isSupported = (locale: string): boolean =>
    supported.length === 0 || supported.includes(locale);

  const base = createI18nConfig({ ...rest, supportedLocales });

  base.adapter.onLocaleChange((locale) => {
    setRequestLocale(locale);
    if (persistLocale) {
      void AsyncStorage.setItem(storageKey, locale).catch((error: unknown) => {
        console.error("createNativeI18n: failed to persist locale", error);
      });
    }
  });

  const i18nReady = (async () => {
    await base.i18nReady;

    let target: string | undefined;
    if (persistLocale) {
      const persisted = await AsyncStorage.getItem(storageKey);
      if (persisted && isSupported(persisted)) target = persisted;
    }
    if (!target) {
      const deviceLanguage = getLocales()[0]?.languageCode ?? undefined;
      if (deviceLanguage && isSupported(deviceLanguage)) target = deviceLanguage;
    }
    if (target && target !== base.adapter.locale) {
      await base.adapter.setLocale(target);
    }
    setRequestLocale(base.adapter.locale);
  })();

  return { adapter: base.adapter, i18nReady };
}
