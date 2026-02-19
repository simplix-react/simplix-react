[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / ComponentTranslations

# Interface: ComponentTranslations

Defined in: [module-translations.ts:16](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/i18n/src/module-translations.ts#L16)

Maps locale codes to lazy-loading functions that return translation modules.

Designed to work with Vite's `import.meta.glob` for code-split translation files.

## Example

```ts
import type { ComponentTranslations } from "@simplix-react/i18n";

const translations: ComponentTranslations = {
  en: () => import("./locales/en.json"),
  ko: () => import("./locales/ko.json"),
};
```

## Indexable

\[`locale`: `string`\]: () => `Promise`\<\{ `default`: `Record`\<`string`, `unknown`\>; \}\>
