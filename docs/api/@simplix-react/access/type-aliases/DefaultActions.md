[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/access](../README.md) / DefaultActions

# Type Alias: DefaultActions

> **DefaultActions** = `"list"` \| `"view"` \| `"create"` \| `"edit"` \| `"delete"` \| `"export"` \| `"import"` \| `"approve"` \| `"manage"`

Defined in: packages/access/src/types.ts:24

Default action verbs for access control.

## Remarks

Covers common CRUD and workflow operations.
Provide custom action types via the `TActions` generic parameter
on [AccessPolicy](../interfaces/AccessPolicy.md) or [createAccessPolicy](../functions/createAccessPolicy.md).

## Example

```ts
// Use defaults
const policy = createAccessPolicy({ adapter });
policy.can("view", "Pet");

// Narrow to custom actions
type MyActions = "read" | "write" | "admin";
const policy = createAccessPolicy<MyActions, string>({ adapter });
```
