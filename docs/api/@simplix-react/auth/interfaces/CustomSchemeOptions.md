[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / CustomSchemeOptions

# Interface: CustomSchemeOptions

Defined in: [packages/auth/src/types.ts:219](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L219)

Options for [customScheme](../functions/customScheme.md).

## Properties

### clear()

> **clear**: () => `void`

Defined in: [packages/auth/src/types.ts:233](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L233)

Clears all stored credentials.

#### Returns

`void`

***

### getHeaders()

> **getHeaders**: () => `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [packages/auth/src/types.ts:224](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L224)

Returns headers to attach to each request.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

***

### isAuthenticated()

> **isAuthenticated**: () => `boolean`

Defined in: [packages/auth/src/types.ts:230](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L230)

Returns whether credentials are currently valid.

#### Returns

`boolean`

***

### name

> **name**: `string`

Defined in: [packages/auth/src/types.ts:221](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L221)

Unique name for this custom scheme.

***

### refresh()?

> `optional` **refresh**: () => `Promise`\<`void`\>

Defined in: [packages/auth/src/types.ts:227](https://github.com/simplix-react/simplix-react/blob/main/packages/auth/src/types.ts#L227)

Optional refresh logic.

#### Returns

`Promise`\<`void`\>
