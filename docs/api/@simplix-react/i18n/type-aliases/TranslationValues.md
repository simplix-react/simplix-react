[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / TranslationValues

# Type Alias: TranslationValues

> **TranslationValues** = `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [types.ts:15](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/i18n/src/types.ts#L15)

Represents key-value pairs for translation string interpolation.

## Example

```ts
const values: TranslationValues = { name: "Alice", count: 3, active: true };
adapter.t("greeting", values); // "Hello, Alice!"
```
