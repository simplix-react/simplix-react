[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / TranslationValues

# Type Alias: TranslationValues

> **TranslationValues** = `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [types.ts:15](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/i18n/src/types.ts#L15)

Represents key-value pairs for translation string interpolation.

## Example

```ts
const values: TranslationValues = { name: "Alice", count: 3, active: true };
adapter.t("greeting", values); // "Hello, Alice!"
```
