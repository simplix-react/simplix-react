[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / CreateI18nConfigOptions

# Interface: CreateI18nConfigOptions

Defined in: [create-i18n-config.ts:14](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L14)

Configures the [createI18nConfig](../functions/createI18nConfig.md) factory function.

## Properties

### appTranslations?

> `optional` **appTranslations**: `Record`\<`string`, `unknown`\>

Defined in: [create-i18n-config.ts:38](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L38)

Eagerly imported application translations, typically from `import.meta.glob`.

Keys should follow the pattern `/locales/{namespace}/{locale}.json`.

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [create-i18n-config.ts:42](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L42)

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: [create-i18n-config.ts:16](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L16)

Initial locale to activate (defaults to `"en"`).

***

### detection?

> `optional` **detection**: `object`

Defined in: [create-i18n-config.ts:28](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L28)

Language detection configuration.

#### order

> **order**: (`"localStorage"` \| `"navigator"`)[]

#### storageKey?

> `optional` **storageKey**: `string`

localStorage key for persisting the selected locale (defaults to `"i18n:locale"`).

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: [create-i18n-config.ts:18](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L18)

Fallback locale for missing translations (defaults to `"en"`).

***

### moduleTranslations?

> `optional` **moduleTranslations**: [`ModuleTranslations`](ModuleTranslations.md)[]

Defined in: [create-i18n-config.ts:40](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L40)

Lazy-loadable module translation descriptors built via [buildModuleTranslations](../functions/buildModuleTranslations.md).

***

### supportedLocales?

> `optional` **supportedLocales**: (`string` \| [`LocaleConfig`](LocaleConfig.md))[]

Defined in: [create-i18n-config.ts:26](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L26)

Supported locale configurations (defaults to [DEFAULT\_LOCALES](../variables/DEFAULT_LOCALES.md)).

Accepts locale codes (`string`) or full [LocaleConfig](LocaleConfig.md) objects.
String codes are resolved against [DEFAULT\_LOCALES](../variables/DEFAULT_LOCALES.md); unrecognized
codes produce a minimal config with the code as both `name` and `englishName`.
