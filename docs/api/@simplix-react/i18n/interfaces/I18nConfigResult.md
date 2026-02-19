[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nConfigResult

# Interface: I18nConfigResult

Defined in: [create-i18n-config.ts:48](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L48)

Represents the result of [createI18nConfig](../functions/createI18nConfig.md).

## Properties

### adapter

> **adapter**: [`I18nextAdapter`](../classes/I18nextAdapter.md)

Defined in: [create-i18n-config.ts:50](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L50)

The configured i18next adapter instance.

***

### i18nReady

> **i18nReady**: `Promise`\<`void`\>

Defined in: [create-i18n-config.ts:52](https://github.com/simplix-react/simplix-react/blob/2136b85a6090bed608ab01dc049555ebf281de32/packages/i18n/src/create-i18n-config.ts#L52)

A promise that resolves when all translations (including module translations) are loaded.
