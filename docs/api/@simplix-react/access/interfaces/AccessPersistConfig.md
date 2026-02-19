[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessPersistConfig

# Interface: AccessPersistConfig

Defined in: [packages/access/src/types.ts:209](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L209)

Configuration for persisting access state to storage.

## Example

```ts
const persist: AccessPersistConfig = {
  storage: localStorage,
  key: "my-app-access",
};
```

## Properties

### key?

> `optional` **key**: `string`

Defined in: [packages/access/src/types.ts:213](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L213)

Storage key. Defaults to `"simplix-access"`.

***

### revalidateOnMount?

> `optional` **revalidateOnMount**: `boolean`

Defined in: [packages/access/src/types.ts:215](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L215)

Whether to revalidate persisted state on mount.

***

### storage?

> `optional` **storage**: `Storage`

Defined in: [packages/access/src/types.ts:211](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L211)

Storage backend. Defaults to `localStorage`.
