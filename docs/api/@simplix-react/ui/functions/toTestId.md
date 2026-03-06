[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / toTestId

# Function: toTestId()

> **toTestId**(`label`): `string`

Defined in: [packages/ui/src/utils/cn.ts:36](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/cn.ts#L36)

Convert a label string to a kebab-case `data-testid` value.

## Parameters

### label

`string`

Human-readable label (e.g. `"First Name"`).

## Returns

`string`

Kebab-case test ID (e.g. `"first-name"`).

## Example

```ts
toTestId("First Name"); // "first-name"
toTestId("email");      // "email"
```
