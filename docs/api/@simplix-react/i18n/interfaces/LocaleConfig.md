[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / LocaleConfig

# Interface: LocaleConfig

Defined in: [types.ts:155](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L155)

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

Defined in: [types.ts:157](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L157)

BCP 47 locale code.

***

### currency?

> `optional` **currency**: `string`

Defined in: [types.ts:169](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L169)

Default ISO 4217 currency code.

***

### dateFormat?

> `optional` **dateFormat**: `string`

Defined in: [types.ts:165](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L165)

Default date format pattern.

***

### direction?

> `optional` **direction**: `"ltr"` \| `"rtl"`

Defined in: [types.ts:163](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L163)

Text direction (defaults to `"ltr"`).

***

### englishName

> **englishName**: `string`

Defined in: [types.ts:161](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L161)

English display name.

***

### name

> **name**: `string`

Defined in: [types.ts:159](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L159)

Native display name.

***

### timeFormat?

> `optional` **timeFormat**: `string`

Defined in: [types.ts:167](https://github.com/simplix-react/simplix-react/blob/main/types.ts#L167)

Default time format pattern.
