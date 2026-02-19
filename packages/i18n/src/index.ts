// Types
export type {
  LocaleCode,
  LocaleConfig,
  TranslationValues,
  DateTimeStyle,
  NumberFormatStyle,
  TextDirection,
  PluralForms,
  DateTimeFormatOptions,
  NumberFormatOptions,
  LocaleInfo,
  TranslationNamespace,
  TranslationLoadState,
} from "./types.js";

export {
  DATE_TIME_STYLES,
  NUMBER_FORMAT_STYLES,
  TEXT_DIRECTIONS,
  TRANSLATION_LOAD_STATES,
} from "./types.js";

// Adapter interface
export type { II18nAdapter } from "./adapter.js";

// I18next implementation
export { I18nextAdapter } from "./i18next-adapter.js";
export type {
  TranslationResources,
  I18nextAdapterOptions,
} from "./i18next-adapter.js";

// Utilities
export { buildModuleTranslations } from "./module-translations.js";
export type {
  ComponentTranslations,
  BuildModuleTranslationsOptions,
  ModuleTranslations,
} from "./module-translations.js";

export { createI18nConfig } from "./create-i18n-config.js";
export type {
  CreateI18nConfigOptions,
  I18nConfigResult,
} from "./create-i18n-config.js";

// Domain translations
export { registerDomainTranslations } from "./domain-translations.js";
export type { DomainTranslationConfig } from "./domain-translations.js";

// Locale config
export { DEFAULT_LOCALES, SUPPORTED_LOCALES } from "./utils/locale-config.js";
