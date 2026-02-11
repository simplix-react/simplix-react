[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / I18nConfigResult

# Interface: I18nConfigResult

Defined in: [create-i18n-config.ts:37](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/create-i18n-config.ts#L37)

Represents the result of [createI18nConfig](../functions/createI18nConfig.md).

## Properties

### adapter

> **adapter**: [`I18nextAdapter`](../classes/I18nextAdapter.md)

Defined in: [create-i18n-config.ts:39](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/create-i18n-config.ts#L39)

The configured i18next adapter instance.

***

### i18nReady

> **i18nReady**: `Promise`\<`void`\>

Defined in: [create-i18n-config.ts:41](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/create-i18n-config.ts#L41)

A promise that resolves when all translations (including module translations) are loaded.
