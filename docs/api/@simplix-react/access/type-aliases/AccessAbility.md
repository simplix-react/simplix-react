[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / AccessAbility

# Type Alias: AccessAbility\<TActions, TSubjects\>

> **AccessAbility**\<`TActions`, `TSubjects`\> = [`MongoAbility`](https://casl.js.org/v6/en/api/casl-ability#mongoability)\<\[`TActions`, `TSubjects` \| `"all"`\]\>

Defined in: packages/access/src/types.ts:50

A CASL [MongoAbility](https://casl.js.org/v6/en/api/casl-ability#mongoability) parameterized with action and subject types.

## Type Parameters

### TActions

`TActions` *extends* `string` = [`DefaultActions`](DefaultActions.md)

Action verb union (defaults to [DefaultActions](DefaultActions.md)).

### TSubjects

`TSubjects` *extends* `string` = [`DefaultSubjects`](DefaultSubjects.md)

Subject name union (defaults to any `string`).

## Remarks

The subject union always includes `"all"` to support wildcard rules
such as `{ action: "manage", subject: "all" }` for super-admin bypass.
