[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nextAdapterOptions

# Interface: I18nextAdapterOptions

Defined in: [i18next-adapter.ts:68](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L68)

Configures the [I18nextAdapter](../classes/I18nextAdapter.md) constructor.

## Properties

### debug?

> `optional` **debug**: `boolean`

Defined in: [i18next-adapter.ts:80](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L80)

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: [i18next-adapter.ts:70](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L70)

Initial locale to use (defaults to `"en"`).

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: [i18next-adapter.ts:72](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L72)

Fallback locale when a key is missing (defaults to `"en"`).

***

### i18nextInstance?

> `optional` **i18nextInstance**: `i18n`

Defined in: [i18next-adapter.ts:78](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L78)

An existing i18next instance to reuse instead of creating a new one.

***

### locales?

> `optional` **locales**: [`LocaleConfig`](LocaleConfig.md)[]

Defined in: [i18next-adapter.ts:74](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L74)

Supported locale configurations.

***

### resources?

> `optional` **resources**: [`TranslationResources`](../type-aliases/TranslationResources.md)

Defined in: [i18next-adapter.ts:76](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/i18next-adapter.ts#L76)

Pre-loaded translation resources.
