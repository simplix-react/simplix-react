[**Documentation**](../../README.md)

***

[Documentation](../../README.md) / @simplix-react/i18n

<p align="center">
  <img src="../../_media/simplix-logo.png" alt="simplix-react" width="200" />
</p>

# @simplix-react/i18n

Internationalization framework with an adapter pattern and built-in i18next integration.

## Installation

```bash
pnpm add @simplix-react/i18n
```

### Peer Dependencies

| Package | Version | Required |
| --- | --- | --- |
| `i18next` | >= 25.0.0 | Optional |
| `react` | >= 18.0.0 | Optional |
| `react-i18next` | >= 16.0.0 | Optional |

Install the peers you need based on your usage:

```bash
# Core only (i18next adapter)
pnpm add i18next

# With React bindings
pnpm add i18next react react-i18next
```

## Quick Example

```ts
import { createI18nConfig } from "@simplix-react/i18n";

const appTranslations = import.meta.glob("./locales/**/*.json", { eager: true });

const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations,
});

await i18nReady;

adapter.t("common:greeting");          // "안녕하세요"
adapter.formatCurrency(10000);         // "₩10,000"
adapter.formatDate(new Date());        // "2025. 1. 15."
```

## API Overview

### Core (`@simplix-react/i18n`)

| Export | Kind | Description |
| --- | --- | --- |
| `II18nAdapter` | Interface | Adapter contract for i18n backends |
| `I18nextAdapter` | Class | i18next-based adapter implementation |
| `createI18nConfig` | Function | Factory that creates and initializes an adapter |
| `buildModuleTranslations` | Function | Builds lazy-loadable module translation descriptors |
| `DEFAULT_LOCALES` | Constant | Built-in locale configs (ko, en, ja) |
| `SUPPORTED_LOCALES` | Constant | Locale codes from `DEFAULT_LOCALES` |
| `DATE_TIME_STYLES` | Constant | Date/time formatting style values |
| `NUMBER_FORMAT_STYLES` | Constant | Number formatting style values |
| `TEXT_DIRECTIONS` | Constant | Text direction values (ltr, rtl) |
| `TRANSLATION_LOAD_STATES` | Constant | Translation loading state values |

### React Bindings (`@simplix-react/i18n/react`)

| Export | Kind | Description |
| --- | --- | --- |
| `I18nProvider` | Component | Provides the adapter via React context |
| `useTranslation` | Hook | Namespace-scoped translation with auto re-render |
| `useLocale` | Hook | Returns the active locale with auto re-render |
| `useI18n` | Hook | Returns the raw adapter from context |
| `useI18nAdapter` | Hook | Returns the adapter or `null` from context |

## Key Concepts

### Adapter Pattern

The `II18nAdapter` interface decouples your application from any specific i18n library. The built-in `I18nextAdapter` implements this interface using i18next, but you can create a custom adapter for any backend.

```ts
import { I18nextAdapter } from "@simplix-react/i18n";

const adapter = new I18nextAdapter({
  defaultLocale: "en",
  fallbackLocale: "en",
  resources: {
    en: { common: { greeting: "Hello, {{name}}!" } },
    ko: { common: { greeting: "안녕하세요, {{name}}!" } },
  },
});

await adapter.initialize();

adapter.t("common:greeting");                    // uses default namespace
adapter.tn("common", "greeting", { name: "A" }); // namespaced lookup
adapter.tp("items", 3);                          // plural form
```

### Module Translations

Use `buildModuleTranslations` to define lazy-loaded, per-component translations. This enables code splitting -- translations are only loaded when their module is used.

```ts
import { buildModuleTranslations } from "@simplix-react/i18n";

const dashboardTranslations = buildModuleTranslations({
  namespace: "dashboard",
  locales: ["en", "ko"],
  components: {
    header: {
      en: () => import("./header/locales/en.json"),
      ko: () => import("./header/locales/ko.json"),
    },
    sidebar: {
      en: () => import("./sidebar/locales/en.json"),
      ko: () => import("./sidebar/locales/ko.json"),
    },
  },
});
```

Pass these to `createI18nConfig` for automatic loading:

```ts
const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  moduleTranslations: [dashboardTranslations],
});
```

### Locale Configuration

The package includes built-in locale configs for Korean, English, and Japanese via `DEFAULT_LOCALES`. Provide custom configs to support additional locales:

```ts
import type { LocaleConfig } from "@simplix-react/i18n";

const customLocales: LocaleConfig[] = [
  { code: "en", name: "English", englishName: "English", currency: "USD" },
  { code: "ko", name: "한국어", englishName: "Korean", currency: "KRW" },
  { code: "zh", name: "中文", englishName: "Chinese", currency: "CNY" },
];

const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "en",
  supportedLocales: customLocales,
});
```

### Formatting

The adapter provides locale-aware formatting powered by the `Intl` API:

```ts
// Date / Time
adapter.formatDate(new Date(), { dateStyle: "long" });
adapter.formatTime(new Date(), { timeStyle: "short", hour12: true });
adapter.formatDateTime(new Date());
adapter.formatRelativeTime(pastDate); // "3 hours ago"

// Numbers
adapter.formatNumber(1234567.89);                              // "1,234,567.89"
adapter.formatNumber(0.42, { style: "percent" });              // "42%"
adapter.formatCurrency(9900, "KRW");                           // "₩9,900"
```

## React Integration

Wrap your app with `I18nProvider` and use the hooks:

```tsx
import { I18nProvider, useTranslation, useLocale } from "@simplix-react/i18n/react";
import { createI18nConfig } from "@simplix-react/i18n";

// Setup
const { adapter, i18nReady } = createI18nConfig({ defaultLocale: "ko" });
await i18nReady;

// Provider
function App() {
  return (
    <I18nProvider adapter={adapter}>
      <Dashboard />
    </I18nProvider>
  );
}

// Consumer
function Dashboard() {
  const { t, locale } = useTranslation("dashboard");
  return <h1>{t("title")} ({locale})</h1>;
}

// Locale-only
function LocaleBadge() {
  const locale = useLocale();
  return <span>{locale}</span>;
}
```

## Related Packages

- `@simplix-react/contract` -- Type-safe API contract definitions
- `@simplix-react/react` -- React Query hooks derived from contracts
- `@simplix-react/mock` -- MSW handlers with in-memory stores

## Classes

- [I18nextAdapter](classes/I18nextAdapter.md)

## Interfaces

- [BuildModuleTranslationsOptions](interfaces/BuildModuleTranslationsOptions.md)
- [ComponentTranslations](interfaces/ComponentTranslations.md)
- [CreateI18nConfigOptions](interfaces/CreateI18nConfigOptions.md)
- [DateTimeFormatOptions](interfaces/DateTimeFormatOptions.md)
- [DomainTranslationConfig](interfaces/DomainTranslationConfig.md)
- [I18nConfigResult](interfaces/I18nConfigResult.md)
- [I18nextAdapterOptions](interfaces/I18nextAdapterOptions.md)
- [II18nAdapter](interfaces/II18nAdapter.md)
- [LocaleConfig](interfaces/LocaleConfig.md)
- [LocaleInfo](interfaces/LocaleInfo.md)
- [ModuleTranslations](interfaces/ModuleTranslations.md)
- [NumberFormatOptions](interfaces/NumberFormatOptions.md)
- [PluralForms](interfaces/PluralForms.md)

## Type Aliases

- [DateTimeStyle](type-aliases/DateTimeStyle.md)
- [LocaleCode](type-aliases/LocaleCode.md)
- [NumberFormatStyle](type-aliases/NumberFormatStyle.md)
- [TextDirection](type-aliases/TextDirection.md)
- [TranslationLoadState](type-aliases/TranslationLoadState.md)
- [TranslationNamespace](type-aliases/TranslationNamespace.md)
- [TranslationResources](type-aliases/TranslationResources.md)
- [TranslationValues](type-aliases/TranslationValues.md)

## Variables

- [DATE\_TIME\_STYLES](variables/DATE_TIME_STYLES.md)
- [DEFAULT\_LOCALES](variables/DEFAULT_LOCALES.md)
- [NUMBER\_FORMAT\_STYLES](variables/NUMBER_FORMAT_STYLES.md)
- [SUPPORTED\_LOCALES](variables/SUPPORTED_LOCALES.md)
- [TEXT\_DIRECTIONS](variables/TEXT_DIRECTIONS.md)
- [TRANSLATION\_LOAD\_STATES](variables/TRANSLATION_LOAD_STATES.md)

## Functions

- [buildModuleTranslations](functions/buildModuleTranslations.md)
- [createI18nConfig](functions/createI18nConfig.md)
- [registerDomainTranslations](functions/registerDomainTranslations.md)
