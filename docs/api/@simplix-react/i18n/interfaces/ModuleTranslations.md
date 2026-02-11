[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / ModuleTranslations

# Interface: ModuleTranslations

Defined in: [module-translations.ts:36](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/i18n/src/module-translations.ts#L36)

Represents the output of [buildModuleTranslations](../functions/buildModuleTranslations.md), providing a lazy-loadable
collection of namespaced translations for a module.

## Properties

### load()

> **load**: (`locale`) => `Promise`\<`Record`\<`string`, `Record`\<`string`, `unknown`\>\>\>

Defined in: [module-translations.ts:42](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/i18n/src/module-translations.ts#L42)

Loads all component translations for the given locale.

#### Parameters

##### locale

`string`

#### Returns

`Promise`\<`Record`\<`string`, `Record`\<`string`, `unknown`\>\>\>

***

### locales

> **locales**: `string`[]

Defined in: [module-translations.ts:40](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/i18n/src/module-translations.ts#L40)

Supported locale codes.

***

### namespace

> **namespace**: `string`

Defined in: [module-translations.ts:38](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/i18n/src/module-translations.ts#L38)

The module's translation namespace.
