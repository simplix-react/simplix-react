[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nextAdapter

# Class: I18nextAdapter

Defined in: [i18next-adapter.ts:80](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L80)

Implements [II18nAdapter](../interfaces/II18nAdapter.md) using i18next as the underlying translation engine.

Provides locale-aware translation, date/time/number formatting via the `Intl` API,
and reactive locale change notifications.

## Example

```ts
import { I18nextAdapter } from "@simplix-react/i18n";

const adapter = new I18nextAdapter({
  defaultLocale: "ko",
  resources: {
    ko: { common: { greeting: "안녕하세요, {{name}}!" } },
    en: { common: { greeting: "Hello, {{name}}!" } },
  },
});

await adapter.initialize();
adapter.tn("common", "greeting", { name: "Alice" }); // "안녕하세요, Alice!"
```

## Implements

- [`II18nAdapter`](../interfaces/II18nAdapter.md)

## Constructors

### Constructor

> **new I18nextAdapter**(`options?`): `I18nextAdapter`

Defined in: [i18next-adapter.ts:93](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L93)

#### Parameters

##### options?

[`I18nextAdapterOptions`](../interfaces/I18nextAdapterOptions.md) = `{}`

#### Returns

`I18nextAdapter`

## Properties

### id

> `readonly` **id**: `"i18next"` = `"i18next"`

Defined in: [i18next-adapter.ts:81](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L81)

Unique identifier for this adapter implementation.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`id`](../interfaces/II18nAdapter.md#id)

***

### name

> `readonly` **name**: `"i18next Adapter"` = `"i18next Adapter"`

Defined in: [i18next-adapter.ts:82](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L82)

Human-readable name for this adapter.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`name`](../interfaces/II18nAdapter.md#name)

## Accessors

### availableLocales

#### Get Signature

> **get** **availableLocales**(): `string`[]

Defined in: [i18next-adapter.ts:112](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L112)

List of all locale codes supported by this adapter.

##### Returns

`string`[]

List of all locale codes supported by this adapter.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`availableLocales`](../interfaces/II18nAdapter.md#availablelocales)

***

### fallbackLocale

#### Get Signature

> **get** **fallbackLocale**(): `string`

Defined in: [i18next-adapter.ts:108](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L108)

Locale code used when a translation key is missing in the active locale.

##### Returns

`string`

Locale code used when a translation key is missing in the active locale.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`fallbackLocale`](../interfaces/II18nAdapter.md#fallbacklocale)

***

### locale

#### Get Signature

> **get** **locale**(): `string`

Defined in: [i18next-adapter.ts:104](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L104)

Currently active locale code.

##### Returns

`string`

Currently active locale code.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`locale`](../interfaces/II18nAdapter.md#locale)

## Methods

### addResources()

> **addResources**(`locale`, `namespace`, `resources`): `void`

Defined in: [i18next-adapter.ts:343](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L343)

Adds translation resources to the underlying i18next instance, merging with any existing resources.

#### Parameters

##### locale

`string`

The target locale code.

##### namespace

`string`

The translation namespace.

##### resources

`Record`\<`string`, `unknown`\>

The translation key-value pairs to add.

#### Returns

`void`

***

### dispose()

> **dispose**(): `Promise`\<`void`\>

Defined in: [i18next-adapter.ts:144](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L144)

Disposes of the adapter and releases all resources.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`dispose`](../interfaces/II18nAdapter.md#dispose)

***

### exists()

> **exists**(`key`, `namespace?`): `boolean`

Defined in: [i18next-adapter.ts:191](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L191)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`exists`](../interfaces/II18nAdapter.md#exists)

***

### formatCurrency()

> **formatCurrency**(`value`, `currency?`): `string`

Defined in: [i18next-adapter.ts:297](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L297)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatCurrency`](../interfaces/II18nAdapter.md#formatcurrency)

***

### formatDate()

> **formatDate**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:196](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L196)

Formats a date according to the active locale.

#### Parameters

##### date

`Date`

The date to format.

##### options?

[`DateTimeFormatOptions`](../interfaces/DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatDate`](../interfaces/II18nAdapter.md#formatdate)

***

### formatDateTime()

> **formatDateTime**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:230](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L230)

Formats a date and time together according to the active locale.

#### Parameters

##### date

`Date`

The date/time to format.

##### options?

[`DateTimeFormatOptions`](../interfaces/DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatDateTime`](../interfaces/II18nAdapter.md#formatdatetime)

***

### formatNumber()

> **formatNumber**(`value`, `options?`): `string`

Defined in: [i18next-adapter.ts:274](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L274)

Formats a number according to the active locale.

#### Parameters

##### value

`number`

The number to format.

##### options?

[`NumberFormatOptions`](../interfaces/NumberFormatOptions.md)

Formatting options.

#### Returns

`string`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatNumber`](../interfaces/II18nAdapter.md#formatnumber)

***

### formatRelativeTime()

> **formatRelativeTime**(`date`): `string`

Defined in: [i18next-adapter.ts:252](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L252)

Formats a date as a human-readable relative time string (e.g., "3 hours ago").

#### Parameters

##### date

`Date`

The date to compare against the current time.

#### Returns

`string`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatRelativeTime`](../interfaces/II18nAdapter.md#formatrelativetime)

***

### formatTime()

> **formatTime**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:211](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L211)

Formats a time according to the active locale.

#### Parameters

##### date

`Date`

The date/time to format.

##### options?

[`DateTimeFormatOptions`](../interfaces/DateTimeFormatOptions.md)

Formatting options.

#### Returns

`string`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatTime`](../interfaces/II18nAdapter.md#formattime)

***

### getI18nextInstance()

> **getI18nextInstance**(): `i18n`

Defined in: [i18next-adapter.ts:354](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L354)

Returns the underlying i18next instance for advanced usage or direct integration with `react-i18next`.

#### Returns

`i18n`

***

### getLoadState()

> **getLoadState**(`locale`, `namespace?`): [`TranslationLoadState`](../type-aliases/TranslationLoadState.md)

Defined in: [i18next-adapter.ts:316](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L316)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`getLoadState`](../interfaces/II18nAdapter.md#getloadstate)

***

### getLocaleInfo()

> **getLocaleInfo**(`locale`): [`LocaleInfo`](../interfaces/LocaleInfo.md) \| `null`

Defined in: [i18next-adapter.ts:157](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L157)

Returns metadata for the given locale, or `null` if unsupported.

#### Parameters

##### locale

`string`

The locale code to look up.

#### Returns

[`LocaleInfo`](../interfaces/LocaleInfo.md) \| `null`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`getLocaleInfo`](../interfaces/II18nAdapter.md#getlocaleinfo)

***

### initialize()

> **initialize**(`defaultLocale?`): `Promise`\<`void`\>

Defined in: [i18next-adapter.ts:116](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L116)

Initializes the adapter with an optional default locale.

#### Parameters

##### defaultLocale?

`string`

The locale to activate on initialization.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`initialize`](../interfaces/II18nAdapter.md#initialize)

***

### loadTranslations()

> **loadTranslations**(`locale`, `namespace`, `translations`): `void`

Defined in: [i18next-adapter.ts:308](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L308)

Loads translation resources for a given locale and namespace.

#### Parameters

##### locale

`string`

The target locale code.

##### namespace

`string`

The translation namespace.

##### translations

`Record`\<`string`, `string` \| [`PluralForms`](../interfaces/PluralForms.md)\>

The translation key-value pairs to load.

#### Returns

`void`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`loadTranslations`](../interfaces/II18nAdapter.md#loadtranslations)

***

### onLocaleChange()

> **onLocaleChange**(`handler`): () => `void`

Defined in: [i18next-adapter.ts:330](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L330)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`onLocaleChange`](../interfaces/II18nAdapter.md#onlocalechange)

***

### setLocale()

> **setLocale**(`locale`): `Promise`\<`void`\>

Defined in: [i18next-adapter.ts:149](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L149)

Changes the active locale.

#### Parameters

##### locale

`string`

The target locale code.

#### Returns

`Promise`\<`void`\>

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`setLocale`](../interfaces/II18nAdapter.md#setlocale)

***

### t()

> **t**(`key`, `values?`): `string`

Defined in: [i18next-adapter.ts:172](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L172)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`t`](../interfaces/II18nAdapter.md#t)

***

### tn()

> **tn**(`namespace`, `key`, `values?`): `string`

Defined in: [i18next-adapter.ts:176](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L176)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`tn`](../interfaces/II18nAdapter.md#tn)

***

### tp()

> **tp**(`key`, `count`, `values?`): `string`

Defined in: [i18next-adapter.ts:187](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L187)

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

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`tp`](../interfaces/II18nAdapter.md#tp)
