[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / II18nAdapter

# Interface: II18nAdapter

Defined in: adapter.ts:29

Defines the contract for an internationalization adapter.

Provides translation lookup, locale management, and formatting capabilities.
Implement this interface to integrate a custom i18n backend.

## See

[I18nextAdapter](../classes/I18nextAdapter.md) for the built-in i18next implementation.

## Example

```ts
import type { II18nAdapter } from "@simplix-react/i18n";

class CustomAdapter implements II18nAdapter {
  // ... implement all required members
}
```

## Properties

### availableLocales

> `readonly` **availableLocales**: `string`[]

Defined in: adapter.ts:39

List of all locale codes supported by this adapter.

***

### fallbackLocale

> `readonly` **fallbackLocale**: `string`

Defined in: adapter.ts:37

Locale code used when a translation key is missing in the active locale.

***

### id

> `readonly` **id**: `string`

Defined in: adapter.ts:31

Unique identifier for this adapter implementation.

***

### locale

> `readonly` **locale**: `string`

Defined in: adapter.ts:35

Currently active locale code.

***

### name

> `readonly` **name**: `string`

Defined in: adapter.ts:33

Human-readable name for this adapter.

## Methods

### dispose()

> **dispose**(): `Promise`\<`void`\>

Defined in: adapter.ts:48

Disposes of the adapter and releases all resources.

#### Returns

`Promise`\<`void`\>

***

### exists()

> **exists**(`key`, `namespace?`): `boolean`

Defined in: adapter.ts:94

Checks whether a translation key exists.

#### Parameters

##### key

`string`

The translation key to check.

##### namespace?

`string`

Optional namespace to scope the lookup.

#### Returns

`boolean`

***

### formatCurrency()

> **formatCurrency**(`value`, `currency?`): `string`

Defined in: adapter.ts:135

Formats a number as a currency string according to the active locale.

#### Parameters

##### value

`number`

The monetary value to format.

##### currency?

`string`

ISO 4217 currency code override (defaults to the locale's currency).

#### Returns

`string`

***

### formatDate()

> **formatDate**(`date`, `options?`): `string`

Defined in: adapter.ts:101

Formats a date according to the active locale.

#### Parameters

##### date

`Date`

The date to format.

##### options?

[`DateTimeFormatOptions`](DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

***

### formatDateTime()

> **formatDateTime**(`date`, `options?`): `string`

Defined in: adapter.ts:115

Formats a date and time together according to the active locale.

#### Parameters

##### date

`Date`

The date/time to format.

##### options?

[`DateTimeFormatOptions`](DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

***

### formatNumber()

> **formatNumber**(`value`, `options?`): `string`

Defined in: adapter.ts:128

Formats a number according to the active locale.

#### Parameters

##### value

`number`

The number to format.

##### options?

[`NumberFormatOptions`](NumberFormatOptions.md)

Formatting options.

#### Returns

`string`

***

### formatRelativeTime()

> **formatRelativeTime**(`date`): `string`

Defined in: adapter.ts:121

Formats a date as a human-readable relative time string (e.g., "3 hours ago").

#### Parameters

##### date

`Date`

The date to compare against the current time.

#### Returns

`string`

***

### formatTime()

> **formatTime**(`date`, `options?`): `string`

Defined in: adapter.ts:108

Formats a time according to the active locale.

#### Parameters

##### date

`Date`

The date/time to format.

##### options?

[`DateTimeFormatOptions`](DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

***

### getLoadState()

> **getLoadState**(`locale`, `namespace?`): [`TranslationLoadState`](../type-aliases/TranslationLoadState.md)

Defined in: adapter.ts:154

Returns the loading state of translation resources.

#### Parameters

##### locale

`string`

The locale to check.

##### namespace?

`string`

Optional namespace to check (defaults to `"translation"`).

#### Returns

[`TranslationLoadState`](../type-aliases/TranslationLoadState.md)

***

### getLocaleInfo()

> **getLocaleInfo**(`locale`): [`LocaleInfo`](LocaleInfo.md) \| `null`

Defined in: adapter.ts:60

Returns metadata for the given locale, or `null` if unsupported.

#### Parameters

##### locale

`string`

The locale code to look up.

#### Returns

[`LocaleInfo`](LocaleInfo.md) \| `null`

***

### initialize()

> **initialize**(`defaultLocale?`): `Promise`\<`void`\>

Defined in: adapter.ts:45

Initializes the adapter with an optional default locale.

#### Parameters

##### defaultLocale?

`string`

The locale to activate on initialization.

#### Returns

`Promise`\<`void`\>

***

### loadTranslations()

> **loadTranslations**(`locale`, `namespace`, `translations`): `void`

Defined in: adapter.ts:143

Loads translation resources for a given locale and namespace.

#### Parameters

##### locale

`string`

The target locale code.

##### namespace

`string`

The translation namespace.

##### translations

`Record`\<`string`, `string` \| [`PluralForms`](PluralForms.md)\>

The translation key-value pairs to load.

#### Returns

`void`

***

### onLocaleChange()

> **onLocaleChange**(`handler`): () => `void`

Defined in: adapter.ts:164

Registers a callback invoked whenever the active locale changes.

#### Parameters

##### handler

(`locale`) => `void`

The callback receiving the new locale code.

#### Returns

A function that unregisters the handler when called.

> (): `void`

##### Returns

`void`

***

### setLocale()

> **setLocale**(`locale`): `Promise`\<`void`\>

Defined in: adapter.ts:54

Changes the active locale.

#### Parameters

##### locale

`string`

The target locale code.

#### Returns

`Promise`\<`void`\>

***

### t()

> **t**(`key`, `values?`): `string`

Defined in: adapter.ts:67

Translates a key with optional interpolation values.

#### Parameters

##### key

`string`

The translation key.

##### values?

[`TranslationValues`](../type-aliases/TranslationValues.md)

Interpolation values.

#### Returns

`string`

***

### tn()

> **tn**(`namespace`, `key`, `values?`): `string`

Defined in: adapter.ts:75

Translates a namespaced key with optional interpolation values.

#### Parameters

##### namespace

`string`

The translation namespace.

##### key

`string`

The translation key within the namespace.

##### values?

[`TranslationValues`](../type-aliases/TranslationValues.md)

Interpolation values.

#### Returns

`string`

***

### tp()

> **tp**(`key`, `count`, `values?`): `string`

Defined in: adapter.ts:87

Translates a key with plural form selection based on count.

#### Parameters

##### key

`string`

The translation key.

##### count

`number`

The count for plural selection.

##### values?

[`TranslationValues`](../type-aliases/TranslationValues.md)

Additional interpolation values.

#### Returns

`string`
