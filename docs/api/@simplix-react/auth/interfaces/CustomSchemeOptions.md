[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/auth](../README.md) / CustomSchemeOptions

# Interface: CustomSchemeOptions

Defined in: [packages/auth/src/types.ts:185](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L185)

Options for [customScheme](../functions/customScheme.md).

## Properties

### clear()

> **clear**: () => `void`

Defined in: [packages/auth/src/types.ts:199](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L199)

Clears all stored credentials.

#### Returns

`void`

***

### getHeaders()

> **getHeaders**: () => `Promise`\<`Record`\<`string`, `string`\>\>

Defined in: [packages/auth/src/types.ts:190](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L190)

Returns headers to attach to each request.

#### Returns

`Promise`\<`Record`\<`string`, `string`\>\>

***

### isAuthenticated()

> **isAuthenticated**: () => `boolean`

Defined in: [packages/auth/src/types.ts:196](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L196)

Returns whether credentials are currently valid.

#### Returns

`boolean`

***

### name

> **name**: `string`

Defined in: [packages/auth/src/types.ts:187](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L187)

Unique name for this custom scheme.

***

### refresh()?

> `optional` **refresh**: () => `Promise`\<`void`\>

Defined in: [packages/auth/src/types.ts:193](https://github.com/simplix-react/simplix-react/blob/2c8833b1d8a5d1d824b2a35744e68395ed208513/packages/auth/src/types.ts#L193)

Optional refresh logic.

#### Returns

`Promise`\<`void`\>
