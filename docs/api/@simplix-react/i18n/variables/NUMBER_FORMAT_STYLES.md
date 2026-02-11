[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / NUMBER\_FORMAT\_STYLES

# Variable: NUMBER\_FORMAT\_STYLES

> `const` **NUMBER\_FORMAT\_STYLES**: `object`

Defined in: [types.ts:50](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/types.ts#L50)

Provides constant values for number formatting styles compatible with the `Intl.NumberFormat` API.

## Type Declaration

### CURRENCY

> `readonly` **CURRENCY**: `"currency"` = `"currency"`

### DECIMAL

> `readonly` **DECIMAL**: `"decimal"` = `"decimal"`

### PERCENT

> `readonly` **PERCENT**: `"percent"` = `"percent"`

### UNIT

> `readonly` **UNIT**: `"unit"` = `"unit"`

## Example

```ts
import { NUMBER_FORMAT_STYLES } from "@simplix-react/i18n";

adapter.formatNumber(1234.5, { style: NUMBER_FORMAT_STYLES.CURRENCY, currency: "USD" });
```
