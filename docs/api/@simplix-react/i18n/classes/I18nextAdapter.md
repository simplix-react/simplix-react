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

Defined in: [i18next-adapter.ts:95](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L95)

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

Defined in: [i18next-adapter.ts:114](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L114)

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

Defined in: [i18next-adapter.ts:110](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L110)

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

Defined in: [i18next-adapter.ts:106](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L106)

Currently active locale code.

##### Returns

`string`

Currently active locale code.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`locale`](../interfaces/II18nAdapter.md#locale)

***

### resourcesVersion

#### Get Signature

> **get** **resourcesVersion**(): `number`

Defined in: [i18next-adapter.ts:345](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L345)

A monotonically increasing counter bumped on every [addResources](#addresources) call.
Reactive bindings pair it with [onResourcesChange](#onresourceschange) to detect
late-arriving resources from lazily registered bundles.

##### Returns

`number`

A monotonically increasing counter bumped each time translation resources
are added or replaced. Lets reactive consumers detect late-arriving
resources (lazy bundles register after the first render).

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`resourcesVersion`](../interfaces/II18nAdapter.md#resourcesversion)

## Methods

### addResources()

> **addResources**(`locale`, `namespace`, `resources`): `void`

Defined in: [i18next-adapter.ts:366](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L366)

Adds translation resources to the underlying i18next instance, merging with any existing resources.

Notifies [onResourcesChange](#onresourceschange) subscribers so views rendered before a
lazily loaded namespace arrived re-render with the resolved labels.

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

Defined in: [i18next-adapter.ts:147](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L147)

Disposes of the adapter and releases all resources.

#### Returns

`Promise`\<`void`\>

A promise that resolves when disposal is complete.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`dispose`](../interfaces/II18nAdapter.md#dispose)

***

### exists()

> **exists**(`key`, `namespace?`): `boolean`

Defined in: [i18next-adapter.ts:194](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L194)

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

`true` if the key exists in the given namespace.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`exists`](../interfaces/II18nAdapter.md#exists)

***

### formatCurrency()

> **formatCurrency**(`value`, `currency?`): `string`

Defined in: [i18next-adapter.ts:300](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L300)

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

The formatted currency string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatCurrency`](../interfaces/II18nAdapter.md#formatcurrency)

***

### formatDate()

> **formatDate**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:199](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L199)

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

The formatted date string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatDate`](../interfaces/II18nAdapter.md#formatdate)

***

### formatDateTime()

> **formatDateTime**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:233](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L233)

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

The formatted date-time string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatDateTime`](../interfaces/II18nAdapter.md#formatdatetime)

***

### formatNumber()

> **formatNumber**(`value`, `options?`): `string`

Defined in: [i18next-adapter.ts:277](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L277)

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

The formatted number string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatNumber`](../interfaces/II18nAdapter.md#formatnumber)

***

### formatRelativeTime()

> **formatRelativeTime**(`date`): `string`

Defined in: [i18next-adapter.ts:255](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L255)

Formats a date as a human-readable relative time string (e.g., "3 hours ago").

#### Parameters

##### date

`Date`

The date to compare against the current time.

#### Returns

`string`

The relative time string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatRelativeTime`](../interfaces/II18nAdapter.md#formatrelativetime)

***

### formatTime()

> **formatTime**(`date`, `options?`): `string`

Defined in: [i18next-adapter.ts:214](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L214)

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

The formatted time string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`formatTime`](../interfaces/II18nAdapter.md#formattime)

***

### getI18nextInstance()

> **getI18nextInstance**(): `i18n`

Defined in: [i18next-adapter.ts:385](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L385)

Returns the underlying i18next instance for advanced usage or direct integration with `react-i18next`.

#### Returns

`i18n`

***

### getLoadState()

> **getLoadState**(`locale`, `namespace?`): [`TranslationLoadState`](../type-aliases/TranslationLoadState.md)

Defined in: [i18next-adapter.ts:319](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L319)

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

The current [TranslationLoadState](../type-aliases/TranslationLoadState.md) for the locale/namespace pair.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`getLoadState`](../interfaces/II18nAdapter.md#getloadstate)

***

### getLocaleInfo()

> **getLocaleInfo**(`locale`): [`LocaleInfo`](../interfaces/LocaleInfo.md) \| `null`

Defined in: [i18next-adapter.ts:160](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L160)

Returns metadata for the given locale, or `null` if unsupported.

#### Parameters

##### locale

`string`

The locale code to look up.

#### Returns

[`LocaleInfo`](../interfaces/LocaleInfo.md) \| `null`

The [LocaleInfo](../interfaces/LocaleInfo.md) for the locale, or `null` if not supported.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`getLocaleInfo`](../interfaces/II18nAdapter.md#getlocaleinfo)

***

### initialize()

> **initialize**(`defaultLocale?`): `Promise`\<`void`\>

Defined in: [i18next-adapter.ts:118](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L118)

Initializes the adapter with an optional default locale.

#### Parameters

##### defaultLocale?

`string`

The locale to activate on initialization.

#### Returns

`Promise`\<`void`\>

A promise that resolves when initialization is complete.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`initialize`](../interfaces/II18nAdapter.md#initialize)

***

### loadTranslations()

> **loadTranslations**(`locale`, `namespace`, `translations`): `void`

Defined in: [i18next-adapter.ts:311](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L311)

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

Defined in: [i18next-adapter.ts:333](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L333)

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

### onResourcesChange()

> **onResourcesChange**(`handler`): () => `void`

Defined in: [i18next-adapter.ts:349](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L349)

Registers a callback invoked whenever translation resources are added or
replaced after initialization. Reactive bindings subscribe to re-render
views that rendered before a lazily loaded namespace arrived.

#### Parameters

##### handler

() => `void`

The callback invoked on each resource change.

#### Returns

A function that unregisters the handler when called.

> (): `void`

##### Returns

`void`

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`onResourcesChange`](../interfaces/II18nAdapter.md#onresourceschange)

***

### setLocale()

> **setLocale**(`locale`): `Promise`\<`void`\>

Defined in: [i18next-adapter.ts:152](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L152)

Changes the active locale.

#### Parameters

##### locale

`string`

The target locale code.

#### Returns

`Promise`\<`void`\>

A promise that resolves when the locale change is applied.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`setLocale`](../interfaces/II18nAdapter.md#setlocale)

***

### t()

> **t**(`key`, `values?`): `string`

Defined in: [i18next-adapter.ts:175](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L175)

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

The translated string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`t`](../interfaces/II18nAdapter.md#t)

***

### tn()

> **tn**(`namespace`, `key`, `values?`): `string`

Defined in: [i18next-adapter.ts:179](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L179)

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

The translated string.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`tn`](../interfaces/II18nAdapter.md#tn)

***

### tp()

> **tp**(`key`, `count`, `values?`): `string`

Defined in: [i18next-adapter.ts:190](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L190)

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

The translated string with the appropriate plural form.

#### Implementation of

[`II18nAdapter`](../interfaces/II18nAdapter.md).[`tp`](../interfaces/II18nAdapter.md#tp)
