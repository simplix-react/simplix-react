[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / CreateI18nConfigOptions

# Interface: CreateI18nConfigOptions

Defined in: [create-i18n-config.ts:19](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L19)

Configures the [createI18nConfig](../functions/createI18nConfig.md) factory function.

## Properties

### appTranslations?

> `optional` **appTranslations**: `Record`\<`string`, `unknown`\>

Defined in: [create-i18n-config.ts:43](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L43)

Eagerly imported application translations, typically from `import.meta.glob`.

Keys should follow the pattern `/locales/{namespace}/{locale}.json`.

***

### debug?

> `optional` **debug**: `boolean`

Defined in: [create-i18n-config.ts:47](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L47)

Enables i18next debug logging.

***

### defaultLocale?

> `optional` **defaultLocale**: `string`

Defined in: [create-i18n-config.ts:21](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L21)

Initial locale to activate (defaults to `"en"`).

***

### detection?

> `optional` **detection**: `object`

Defined in: [create-i18n-config.ts:33](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L33)

Language detection configuration.

#### order

> **order**: (`"localStorage"` \| `"navigator"`)[]

#### storageKey?

> `optional` **storageKey**: `string`

localStorage key for persisting the selected locale (defaults to `"i18n:locale"`).

***

### fallbackLocale?

> `optional` **fallbackLocale**: `string`

Defined in: [create-i18n-config.ts:23](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L23)

Fallback locale for missing translations (defaults to `"en"`).

***

### moduleTranslations?

> `optional` **moduleTranslations**: [`ModuleTranslations`](ModuleTranslations.md)[]

Defined in: [create-i18n-config.ts:45](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L45)

Lazy-loadable module translation descriptors built via [buildModuleTranslations](../functions/buildModuleTranslations.md).

***

### supportedLocales?

> `optional` **supportedLocales**: (`string` \| [`LocaleConfig`](LocaleConfig.md))[]

Defined in: [create-i18n-config.ts:31](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L31)

Supported locale configurations (defaults to [DEFAULT\_LOCALES](../variables/DEFAULT_LOCALES.md)).

Accepts locale codes (`string`) or full [LocaleConfig](LocaleConfig.md) objects.
String codes are resolved against [DEFAULT\_LOCALES](../variables/DEFAULT_LOCALES.md); unrecognized
codes produce a minimal config with the code as both `name` and `englishName`.
