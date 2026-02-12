[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / createI18nConfig

# Function: createI18nConfig()

> **createI18nConfig**(`options`): [`I18nConfigResult`](../interfaces/I18nConfigResult.md)

Defined in: [create-i18n-config.ts:68](https://github.com/simplix-react/simplix-react/blob/7b385f612737a3aa7cc5a3b289dfdffa21c92677/packages/i18n/src/create-i18n-config.ts#L68)

Creates and initializes an i18n configuration with an [I18nextAdapter](../classes/I18nextAdapter.md).

Handles eager loading of app-level translations and lazy loading of module translations.
Returns both the adapter instance and a promise that resolves when initialization is complete.

## Parameters

### options

[`CreateI18nConfigOptions`](../interfaces/CreateI18nConfigOptions.md)

The i18n configuration options.

## Returns

[`I18nConfigResult`](../interfaces/I18nConfigResult.md)

An [I18nConfigResult](../interfaces/I18nConfigResult.md) containing the adapter and a readiness promise.

## Example

```ts
import { createI18nConfig } from "@simplix-react/i18n";

const appTranslations = import.meta.glob("./locales/**/*.json", { eager: true });

const { adapter, i18nReady } = createI18nConfig({
  defaultLocale: "ko",
  appTranslations,
});

await i18nReady;
adapter.t("common:greeting"); // "안녕하세요"
```
