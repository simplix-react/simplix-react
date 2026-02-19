[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nextAdapterOptions

# Interface: I18nextAdapterOptions

Defined in: [i18next-adapter.ts:37](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L37)

Configures the [I18nextAdapter](../classes/I18nextAdapter.md) constructor.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [i18next-adapter.ts:49](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L49)

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: [i18next-adapter.ts:39](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L39)

Initial locale to use (defaults to `"en"`).

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: [i18next-adapter.ts:41](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L41)

Fallback locale when a key is missing (defaults to `"en"`).

***

### i18nextInstance?

> `optional` **i18nextInstance**: `i18n`

Defined in: [i18next-adapter.ts:47](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L47)

An existing i18next instance to reuse instead of creating a new one.

***

### locales?

> `optional` **locales**: [`LocaleConfig`](LocaleConfig.md)[]

Defined in: [i18next-adapter.ts:43](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L43)

Supported locale configurations.

***

### resources?

> `optional` **resources**: [`TranslationResources`](../type-aliases/TranslationResources.md)

Defined in: [i18next-adapter.ts:45](https://github.com/simplix-react/simplix-react/blob/main/i18next-adapter.ts#L45)

Pre-loaded translation resources.
