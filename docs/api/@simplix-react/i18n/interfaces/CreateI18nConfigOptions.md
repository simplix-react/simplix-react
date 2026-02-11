[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / CreateI18nConfigOptions

# Interface: CreateI18nConfigOptions

Defined in: create-i18n-config.ts:13

Configures the [createI18nConfig](../functions/createI18nConfig.md) factory function.

## Properties

### appTranslations?

> `optional` **appTranslations**: `Record`\<`string`, `unknown`\>

Defined in: create-i18n-config.ts:27

Eagerly imported application translations, typically from `import.meta.glob`.

Keys should follow the pattern `/locales/{namespace}/{locale}.json`.

***

### debug?

> `optional` **debug**: `boolean`

Defined in: create-i18n-config.ts:31

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: create-i18n-config.ts:15

Initial locale to activate (defaults to `"en"`).

***

### detection?

> `optional` **detection**: `object`

Defined in: create-i18n-config.ts:21

Language detection configuration.

#### order

> **order**: `string`[]

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: create-i18n-config.ts:17

Fallback locale for missing translations (defaults to `"en"`).

***

### moduleTranslations?

> `optional` **moduleTranslations**: [`ModuleTranslations`](ModuleTranslations.md)[]

Defined in: create-i18n-config.ts:29

Lazy-loadable module translation descriptors built via [buildModuleTranslations](../functions/buildModuleTranslations.md).

***

### supportedLocales?

> `optional` **supportedLocales**: [`LocaleConfig`](LocaleConfig.md)[]

Defined in: create-i18n-config.ts:19

Supported locale configurations (defaults to [DEFAULT\_LOCALES](../variables/DEFAULT_LOCALES.md)).
