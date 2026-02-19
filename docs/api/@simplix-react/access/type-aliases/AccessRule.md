[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessRule

# Type Alias: AccessRule\<TActions, TSubjects\>

> **AccessRule**\<`TActions`, `TSubjects`\> = `RawRuleOf`\<[`AccessAbility`](AccessAbility.md)\<`TActions`, `TSubjects`\>\>

Defined in: [packages/access/src/types.ts:71](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/access/src/types.ts#L71)

A single CASL rule derived from [AccessAbility](AccessAbility.md).

## Type Parameters

### TActions

`TActions` *extends* `string` = [`DefaultActions`](DefaultActions.md)

Action verb union (defaults to [DefaultActions](DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = [`DefaultSubjects`](DefaultSubjects.md)

Subject name union (defaults to any `string`).

## Remarks

This is the raw rule format accepted by `createMongoAbility`.
At minimum, each rule contains `action` and `subject` fields.

## Example

```ts
const rule: AccessRule = { action: "view", subject: "Pet" };
const wildcard: AccessRule = { action: "manage", subject: "all" };
```
