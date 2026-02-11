[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / TranslationResources

# Type Alias: TranslationResources

> **TranslationResources** = `Record`\<[`LocaleCode`](LocaleCode.md), `Record`\<[`TranslationNamespace`](TranslationNamespace.md), `Record`\<`string`, `unknown`\>\>\>

Defined in: [i18next-adapter.ts:60](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/i18next-adapter.ts#L60)

Represents a nested structure of translation resources keyed by locale, then namespace.

## Example

```ts
import type { TranslationResources } from "@simplix-react/i18n";

const resources: TranslationResources = {
  en: { common: { greeting: "Hello" } },
  ko: { common: { greeting: "안녕하세요" } },
};
```
