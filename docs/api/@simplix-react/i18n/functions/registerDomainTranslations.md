[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / registerDomainTranslations

# Function: registerDomainTranslations()

> **registerDomainTranslations**(`config`): `void`

Defined in: domain-translations.ts:37

Registers domain-specific translations into the global registry.

Call this as a side-effect import in your domain package's entry point
so translations are available when the package is imported.

## Parameters

### config

[`DomainTranslationConfig`](../interfaces/DomainTranslationConfig.md)

The domain translation configuration.

## Returns

`void`

## Example

```ts
import { registerDomainTranslations } from "@simplix-react/i18n";

registerDomainTranslations({
  domain: "pet",
  locales: {
    en: () => import("./locales/en.json"),
    ko: () => import("./locales/ko.json"),
  },
});
```
