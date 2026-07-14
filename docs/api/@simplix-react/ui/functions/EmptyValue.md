[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / EmptyValue

# Function: EmptyValue()

> **EmptyValue**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/base/display/empty-value.tsx:23](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/base/display/empty-value.tsx#L23)

Muted em-dash placeholder for "no value" in contexts where a `DetailFields.*`
component (which owns its own em-dash fallback) does not apply — e.g. table
cells, editor summaries, or custom inline displays. Centralizes the em-dash
literal and its muted styling so empty rendering stays consistent.

## Parameters

### \_\_namedParameters

`EmptyValueProps`

## Returns

`Element`

## Example

```tsx
{value ? <span>{value}</span> : <EmptyValue />}
```
