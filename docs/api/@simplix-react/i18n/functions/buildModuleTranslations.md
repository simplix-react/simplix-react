[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / buildModuleTranslations

# Function: buildModuleTranslations()

> **buildModuleTranslations**(`options`): [`ModuleTranslations`](../interfaces/ModuleTranslations.md)

Defined in: [module-translations.ts:70](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/module-translations.ts#L70)

Builds a lazy-loadable module translation descriptor from per-component translation loaders.

Aggregates component-level translations under a shared namespace so they can be
loaded on demand by [createI18nConfig](createI18nConfig.md).

## Parameters

### options

[`BuildModuleTranslationsOptions`](../interfaces/BuildModuleTranslationsOptions.md)

The module translation configuration.

## Returns

[`ModuleTranslations`](../interfaces/ModuleTranslations.md)

A [ModuleTranslations](../interfaces/ModuleTranslations.md) descriptor.

## Example

```ts
import { buildModuleTranslations } from "@simplix-react/i18n";

const moduleTranslations = buildModuleTranslations({
  namespace: "dashboard",
  locales: ["en", "ko"],
  components: {
    header: {
      en: () => import("./header/locales/en.json"),
      ko: () => import("./header/locales/ko.json"),
    },
  },
});
```
