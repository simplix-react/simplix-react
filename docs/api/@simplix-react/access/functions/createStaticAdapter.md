[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / createStaticAdapter

# Function: createStaticAdapter()

> **createStaticAdapter**(`rules`, `user?`): [`AccessAdapter`](../interfaces/AccessAdapter.md)

Defined in: packages/access/src/adapters/static-adapter.ts:29

Creates an adapter that always returns the same static rules.

## Parameters

### rules

`SubjectRawRule`\<[`DefaultActions`](../type-aliases/DefaultActions.md), `string`, `MongoQuery`\>[]

Fixed CASL rules to return on every `extract` call.

### user?

[`AccessUser`](../interfaces/AccessUser.md)\<`Record`\<`string`, `unknown`\>\>

Optional user info to include in the result.

## Returns

[`AccessAdapter`](../interfaces/AccessAdapter.md)

An [AccessAdapter](../interfaces/AccessAdapter.md) that always returns the given rules.

## Remarks

Useful for testing, development, or defining public access rules
via the `publicAccess` option in [AccessPolicyConfig](../interfaces/AccessPolicyConfig.md).

## Example

```ts
import { createStaticAdapter } from "@simplix-react/access";

const adapter = createStaticAdapter(
  [{ action: "view", subject: "Pet" }],
  { userId: "anon", username: "anonymous", roles: [] },
);
```
