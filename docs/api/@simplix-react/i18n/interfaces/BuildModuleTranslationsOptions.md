[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / BuildModuleTranslationsOptions

# Interface: BuildModuleTranslationsOptions

Defined in: [module-translations.ts:23](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/i18n/src/module-translations.ts#L23)

Configures the [buildModuleTranslations](../functions/buildModuleTranslations.md) function.

## Properties

### components

> **components**: `Record`\<`string`, [`ComponentTranslations`](ComponentTranslations.md)\>

Defined in: [module-translations.ts:29](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/i18n/src/module-translations.ts#L29)

Map of component paths to their locale-specific translation loaders.

***

### locales

> **locales**: `string`[]

Defined in: [module-translations.ts:27](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/i18n/src/module-translations.ts#L27)

List of supported locale codes.

***

### namespace

> **namespace**: `string`

Defined in: [module-translations.ts:25](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/i18n/src/module-translations.ts#L25)

Namespace prefix for all component translations in this module.
