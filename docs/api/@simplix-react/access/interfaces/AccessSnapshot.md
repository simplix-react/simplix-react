[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessSnapshot

# Interface: AccessSnapshot\<TActions, TSubjects\>

Defined in: [packages/access/src/types.ts:273](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L273)

A serializable snapshot of the current access state.

## Remarks

Returned by [AccessPolicy.getSnapshot](AccessPolicy.md#getsnapshot). Used internally by
`useSyncExternalStore` for reference-stable reactive updates.

## Type Parameters

### TActions

`TActions` *extends* `string` = [`DefaultActions`](../type-aliases/DefaultActions.md)

Action verb union (defaults to [DefaultActions](../type-aliases/DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = [`DefaultSubjects`](../type-aliases/DefaultSubjects.md)

Subject name union (defaults to any `string`).

## Properties

### roles

> **roles**: `string`[]

Defined in: [packages/access/src/types.ts:280](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L280)

Current role names.

***

### rules

> **rules**: `DefineRule`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `MongoQuery`, `ClaimRawRule`\<`Extract`\<`ToAbilityTypes`\<\[`TActions`, `"all"` \| `TSubjects`\]\>, `string`\>\>\>[]

Defined in: [packages/access/src/types.ts:282](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L282)

Current CASL rules.

***

### user

> **user**: [`AccessUser`](AccessUser.md)\<`Record`\<`string`, `unknown`\>\> \| `null`

Defined in: [packages/access/src/types.ts:278](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L278)

Current user, or `null` if unauthenticated.
