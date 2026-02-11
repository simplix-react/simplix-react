[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / DATE\_TIME\_STYLES

# Variable: DATE\_TIME\_STYLES

> `const` **DATE\_TIME\_STYLES**: `object`

Defined in: [types.ts:27](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/types.ts#L27)

Provides constant values for date/time formatting styles compatible with the `Intl.DateTimeFormat` API.

## Type Declaration

### FULL

> `readonly` **FULL**: `"full"` = `"full"`

### LONG

> `readonly` **LONG**: `"long"` = `"long"`

### MEDIUM

> `readonly` **MEDIUM**: `"medium"` = `"medium"`

### SHORT

> `readonly` **SHORT**: `"short"` = `"short"`

## Example

```ts
import { DATE_TIME_STYLES } from "@simplix-react/i18n";

adapter.formatDate(new Date(), { dateStyle: DATE_TIME_STYLES.LONG });
```
