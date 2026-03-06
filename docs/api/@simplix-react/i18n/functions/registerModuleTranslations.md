[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / registerModuleTranslations

# Function: registerModuleTranslations()

> **registerModuleTranslations**(`translations`): `void`

Defined in: [module-translations.ts:68](https://github.com/simplix-react/simplix-react/blob/main/module-translations.ts#L68)

Registers module translations into the global registry.

Call this as a side-effect import in your module package's entry point
so translations are available when the package is imported.

## Parameters

### translations

[`ModuleTranslations`](../interfaces/ModuleTranslations.md)

The module translation descriptor built via [buildModuleTranslations](buildModuleTranslations.md).

## Returns

`void`

## Example

```ts
import { buildModuleTranslations, registerModuleTranslations } from "@simplix-react/i18n";

const translations = buildModuleTranslations({
  namespace: "dashboard",
  locales: ["en", "ko"],
  components: { ... },
});

registerModuleTranslations(translations);
```
