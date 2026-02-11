[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/i18n](../README.md) / TranslationValues

# Type Alias: TranslationValues

> **TranslationValues** = `Record`\<`string`, `string` \| `number` \| `boolean`\>

Defined in: [types.ts:15](https://github.com/simplix-react/simplix-react/blob/656b6ff5067b57340319f1199e4ef833afd3d08f/packages/i18n/src/types.ts#L15)

Represents key-value pairs for translation string interpolation.

## Example

```ts
const values: TranslationValues = { name: "Alice", count: 3, active: true };
adapter.t("greeting", values); // "Hello, Alice!"
```
