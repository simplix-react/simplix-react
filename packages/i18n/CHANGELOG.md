# Changelog

## 0.1.0

### Minor Changes

- Initial release of simplix-react packages

All notable changes to `@simplix-react/i18n` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com),
and this project adheres to [Semantic Versioning](https://semver.org).

## [0.0.1] - 2025-06-01

### Added

- `II18nAdapter` interface for pluggable internationalization backends
- `I18nextAdapter` implementation backed by i18next
- `createI18nConfig` factory for streamlined i18n initialization
- `buildModuleTranslations` utility for composing per-module translation namespaces
- `DEFAULT_LOCALES` and `SUPPORTED_LOCALES` locale configuration presets
- Core type definitions: `LocaleCode`, `TranslationValues`, `DateTimeStyle`, `NumberFormatStyle`, `TextDirection`, `PluralForms`
- Separate `/react` entry point for React-specific bindings with react-i18next
