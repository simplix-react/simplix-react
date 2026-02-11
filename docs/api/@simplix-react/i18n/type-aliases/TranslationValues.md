[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / TranslationValues

# Type Alias: TranslationValues

> **TranslationValues** = `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [types.ts:15](https://github.com/simplix-react/simplix-react/blob/5a1c363918967dad0c47839d93eeb985e4d431ce/packages/i18n/src/types.ts#L15)

Represents key-value pairs for translation string interpolation.

## Example

```ts
const values: TranslationValues = { name: "Alice", count: 3, active: true };
adapter.t("greeting", values); // "Hello, Alice!"
```
