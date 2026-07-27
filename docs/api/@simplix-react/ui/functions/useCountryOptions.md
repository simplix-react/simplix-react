[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / useCountryOptions

# Function: useCountryOptions()

> **useCountryOptions**(): [`CountryOption`](../interfaces/CountryOption.md)[]

Defined in: [packages/ui/src/utils/use-country-options.ts:42](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/use-country-options.ts#L42)

Country options (ISO code, localized/English names, flag component) for
pickers and display cells.

The flag component catalog is a large payload, so it loads lazily: the hook
returns an empty list until the data arrives, then re-renders with the full
set. Callers already tolerate an empty options list (async-options gating).

## Returns

[`CountryOption`](../interfaces/CountryOption.md)[]
