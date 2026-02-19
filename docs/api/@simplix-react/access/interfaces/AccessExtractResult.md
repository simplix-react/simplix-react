[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessExtractResult

# Interface: AccessExtractResult\<TActions, TSubjects\>

Defined in: packages/access/src/types.ts:144

The result of extracting access information from an auth source.

## Remarks

Defaults to `string` generics because adapters parse arbitrary
runtime data. Consumers narrow the types at the policy level.

## Example

```ts
const result: AccessExtractResult = {
  rules: [{ action: "view", subject: "Pet" }],
  user: { userId: "1", username: "john", roles: ["ROLE_USER"] },
  roles: ["ROLE_USER"],
};
```

## Type Parameters

### TActions

`TActions` *extends* `string` = `string`

Action verb union.

### TSubjects

`TSubjects` *extends* `string` = `string`

Subject name union.

## Properties

### roles?

> `optional` **roles**: `string`[]

Defined in: packages/access/src/types.ts:153

Role names extracted from the auth source.

***

### rules

> **rules**: `DefineRule`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `MongoQuery`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `string`\>\>\>[]

Defined in: packages/access/src/types.ts:149

CASL rules derived from the auth source.

***

### user?

> `optional` **user**: [`AccessUser`](AccessUser.md)\<`Record`\<`string`, `unknown`\>\>

Defined in: packages/access/src/types.ts:151

User information, if available.
