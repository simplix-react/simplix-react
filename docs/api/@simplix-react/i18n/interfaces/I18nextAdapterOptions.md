[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nextAdapterOptions

# Interface: I18nextAdapterOptions

Defined in: i18next-adapter.ts:68

Configures the [I18nextAdapter](../classes/I18nextAdapter.md) constructor.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: i18next-adapter.ts:80

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: i18next-adapter.ts:70

Initial locale to use (defaults to `"en"`).

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: i18next-adapter.ts:72

Fallback locale when a key is missing (defaults to `"en"`).

***

### i18nextInstance?

> `optional` **i18nextInstance**: `i18n`

Defined in: i18next-adapter.ts:78

An existing i18next instance to reuse instead of creating a new one.

***

### locales?

> `optional` **locales**: [`LocaleConfig`](LocaleConfig.md)[]

Defined in: i18next-adapter.ts:74

Supported locale configurations.

***

### resources?

> `optional` **resources**: [`TranslationResources`](../type-aliases/TranslationResources.md)

Defined in: i18next-adapter.ts:76

Pre-loaded translation resources.
