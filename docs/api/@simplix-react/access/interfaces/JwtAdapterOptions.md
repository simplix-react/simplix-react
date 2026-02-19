[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / JwtAdapterOptions

# Interface: JwtAdapterOptions

Defined in: [packages/access/src/adapters/jwt-adapter.ts:25](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L25)

Configuration for [createJwtAdapter](../functions/createJwtAdapter.md).

## Example

```ts
const options: JwtAdapterOptions = {
  permissionFormat: "map",
  permissionsKey: "permissions",
  rolesKey: "roles",
  userIdKey: "sub",
};
```

## Properties

### decode()?

> `optional` **decode**: (`token`) => `Record`\<`string`, `unknown`\>

Defined in: [packages/access/src/adapters/jwt-adapter.ts:49](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L49)

Custom JWT decode function. Defaults to base64url payload parsing.

#### Parameters

##### token

`string`

#### Returns

`Record`\<`string`, `unknown`\>

***

### flatSeparator?

> `optional` **flatSeparator**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:47](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L47)

Separator for flat/scopes formats. Defaults to `":"`.

***

### permissionFormat?

> `optional` **permissionFormat**: `"map"` \| `"flat"` \| `"scopes"`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:45](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L45)

Format of the permissions claim.

- `"map"` — `{ resource: [actions] }` object.
- `"flat"` — `["RESOURCE:action"]` array.
- `"scopes"` — Space-delimited OAuth2 scope string.

Defaults to `"map"`.

***

### permissionsKey?

> `optional` **permissionsKey**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:29](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L29)

JWT claim key for permissions. Defaults to `"permissions"`.

***

### rolesKey?

> `optional` **rolesKey**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:27](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L27)

JWT claim key for roles. Defaults to `"roles"`.

***

### superAdminKey?

> `optional` **superAdminKey**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:31](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L31)

JWT claim key for super-admin flag. Defaults to `"isSuperAdmin"`.

***

### transform()?

> `optional` **transform**: (`claims`) => [`AccessExtractResult`](AccessExtractResult.md)

Defined in: [packages/access/src/adapters/jwt-adapter.ts:51](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L51)

Custom transform that replaces default extraction logic entirely.

#### Parameters

##### claims

`Record`\<`string`, `unknown`\>

#### Returns

[`AccessExtractResult`](AccessExtractResult.md)

***

### userIdKey?

> `optional` **userIdKey**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:33](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L33)

JWT claim key for user ID. Defaults to `"sub"`.

***

### usernameKey?

> `optional` **usernameKey**: `string`

Defined in: [packages/access/src/adapters/jwt-adapter.ts:35](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/adapters/jwt-adapter.ts#L35)

JWT claim key for username. Defaults to `"username"`.
