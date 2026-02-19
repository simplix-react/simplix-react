[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nConfigResult

# Interface: I18nConfigResult

Defined in: [create-i18n-config.ts:45](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L45)

Represents the result of [createI18nConfig](../functions/createI18nConfig.md).

## Properties

### adapter

> **adapter**: [`I18nextAdapter`](../classes/I18nextAdapter.md)

Defined in: [create-i18n-config.ts:47](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L47)

The configured i18next adapter instance.

***

### i18nReady

> **i18nReady**: `Promise`\<`void`\>

Defined in: [create-i18n-config.ts:49](https://github.com/simplix-react/simplix-react/blob/main/create-i18n-config.ts#L49)

A promise that resolves when all translations (including module translations) are loaded.
