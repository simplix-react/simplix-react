[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / PermissionMap

# Interface: PermissionMap

Defined in: [packages/access/src/types.ts:89](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L89)

A map of resource names to their allowed actions.

## Example

```ts
const permissions: PermissionMap = {
  Pet: ["list", "view", "create"],
  Order: ["list", "view"],
};
```

## Indexable

\[`resource`: `string`\]: `string`[]
