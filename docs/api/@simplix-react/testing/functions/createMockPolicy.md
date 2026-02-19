[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/testing](../README.md) / createMockPolicy

# Function: createMockPolicy()

> **createMockPolicy**(`options?`): [`AccessPolicy`](../@simplix-react/access/interfaces/AccessPolicy.md)\<`string`, `string`\>

Defined in: [mock-policy.ts:44](https://github.com/simplix-react/simplix-react/blob/main/mock-policy.ts#L44)

Creates a mock [AccessPolicy](../@simplix-react/access/interfaces/AccessPolicy.md) for testing purposes.

## Parameters

### options?

[`MockPolicyOptions`](../interfaces/MockPolicyOptions.md) = `{}`

## Returns

[`AccessPolicy`](../@simplix-react/access/interfaces/AccessPolicy.md)\<`string`, `string`\>

## Remarks

By default the policy grants full access (`manage` on `all`) so that
tests do not need to set up fine-grained permissions unless specifically
testing access control logic.

## Examples

```ts
const policy = createMockPolicy();
policy.can("edit", "Pet"); // true
```

```ts
const policy = createMockPolicy({
  rules: [{ action: "view", subject: "Pet" }],
  allowAll: false,
});
policy.can("view", "Pet"); // true
policy.can("edit", "Pet"); // false
```
