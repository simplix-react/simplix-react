import en from "./en.json";
import ko from "./ko.json";
import ja from "./ja.json";

/** Locale shape for {@link ColorPicker} text. */
export interface ColorPickerLocale {
  triggerPlaceholder: string;
  custom: string;
  clear: string;
  presetColors: Record<string, string>;
}

export const colorPickerLocales: Record<string, ColorPickerLocale> = {
  en: en as ColorPickerLocale,
  ko: ko as ColorPickerLocale,
  ja: ja as ColorPickerLocale,
};

/**
 * Resolve a ColorPicker locale by BCP-47 tag, falling back to English when the
 * requested language is not bundled. Handles short codes (`ko`) and region codes
 * (`ko-KR`) identically.
 */
export function getColorPickerLocale(lang: string): ColorPickerLocale {
  const shortLang = lang.split("-")[0];
  return colorPickerLocales[shortLang] || colorPickerLocales.en;
}

/**
 * Look up the localized name of a preset color by its lowercase key (e.g. `"red"`).
 * Falls back to the key itself when missing.
 */
export function getColorName(locale: ColorPickerLocale, key: string): string {
  return locale.presetColors[key] || key;
}
