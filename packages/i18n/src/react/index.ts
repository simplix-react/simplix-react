export { I18nProvider, useI18nAdapter } from "./i18n-provider.js";
export type { I18nProviderProps } from "./i18n-provider.js";
export { useTranslation, useI18n, useLocale } from "./use-translation.js";
export type {
  UseTranslationReturn,
  TranslateFunction,
} from "./use-translation.js";
export { useEntityTranslation } from "./use-entity-translation.js";
export type { UseEntityTranslationReturn } from "./use-entity-translation.js";
export { useLocalePicker } from "./use-locale-picker.js";
export type {
  LocaleOption,
  UseLocalePickerReturn,
} from "./use-locale-picker.js";
export { useLocalizedText } from "./use-localized-text.js";
export { DateTimeProvider } from "./datetime-provider.js";
export type { DateTimeProviderProps } from "./datetime-provider.js";
export { useDateTime } from "./datetime-context.js";
export type { DateTimeContextValue } from "./datetime-context.js";
export {
  useFormattedDate,
  useFormattedTime,
  useFormattedDateTime,
  useFormattedRelative,
} from "./use-datetime.js";

// ── Content language, grouped figures and optional translations ──
export { useContentEditLanguage, useI18nEditLanguage } from "./edit-language.js";
export type { I18nEditLanguage } from "./edit-language.js";
export { useGroupedFigure } from "./grouped-figure.js";
export { useOptionalTranslation } from "./optional-translation.js";
export type { OptionalTranslation } from "./optional-translation.js";
export { contentLanguageDualName, contentLanguageLabel, contentLanguageNames, useContentLanguageLabel, useContentLanguageNames } from "./content-language.js";
export { countedFigure } from "./counted-figure.js";
