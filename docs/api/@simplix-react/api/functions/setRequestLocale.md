[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/api](../README.md) / setRequestLocale

# Function: setRequestLocale()

> **setRequestLocale**(`locale`): `void`

Defined in: [packages/api/src/index.ts:68](https://github.com/simplix-react/simplix-react/blob/main/packages/api/src/index.ts#L68)

Set the locale for API requests.

When set, [getMutator](getMutator.md) automatically injects an `Accept-Language`
header into every outgoing request. Typically wired to your i18n adapter's
locale-change callback.

## Parameters

### locale

`string`

BCP 47 locale code (e.g. `"ko"`, `"en-US"`).

## Returns

`void`

## Example

```ts
import { setRequestLocale } from "@simplix-react/api";

// Wire to i18n adapter
i18nAdapter.onLocaleChange(setRequestLocale);
```
