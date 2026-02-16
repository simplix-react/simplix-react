[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / LocaleConfig

# Interface: LocaleConfig

Defined in: [i18next-adapter.ts:30](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L30)

Describes the configuration for a single supported locale.

## Example

```ts
import type { LocaleConfig } from "@simplix-react/i18n";

const korean: LocaleConfig = {
  code: "ko",
  name: "한국어",
  englishName: "Korean",
  direction: "ltr",
  currency: "KRW",
};
```

## Properties

### code

> **code**: `string`

Defined in: [i18next-adapter.ts:32](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L32)

BCP 47 locale code.

***

### currency?

> `optional` **currency**: `string`

Defined in: [i18next-adapter.ts:44](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L44)

Default ISO 4217 currency code.

***

### dateFormat?

> `optional` **dateFormat**: `string`

Defined in: [i18next-adapter.ts:40](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L40)

Default date format pattern.

***

### direction?

> `optional` **direction**: `"ltr"` \| `"rtl"`

Defined in: [i18next-adapter.ts:38](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L38)

Text direction (defaults to `"ltr"`).

***

### englishName

> **englishName**: `string`

Defined in: [i18next-adapter.ts:36](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L36)

English display name.

***

### name

> **name**: `string`

Defined in: [i18next-adapter.ts:34](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L34)

Native display name.

***

### timeFormat?

> `optional` **timeFormat**: `string`

Defined in: [i18next-adapter.ts:42](https://github.com/simplix-react/simplix-react/blob/4ea24257717de0d53c64dd58c65ddec728b945e5/packages/i18n/src/i18next-adapter.ts#L42)

Default time format pattern.
