[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / ComponentTranslations

# Interface: ComponentTranslations

Defined in: [module-translations.ts:16](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/module-translations.ts#L16)

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
