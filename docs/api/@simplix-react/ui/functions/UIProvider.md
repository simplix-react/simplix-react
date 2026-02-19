[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProvider

# Function: UIProvider()

> **UIProvider**(`__namedParameters`): `Element`

Defined in: packages/ui/src/provider/ui-provider.tsx:76

Provides overridable base component implementations to the component tree.
Supports nesting for scoped overrides.

## Parameters

### \_\_namedParameters

[`UIProviderProps`](../interfaces/UIProviderProps.md)

## Returns

`Element`

## Example

```tsx
<UIProvider overrides={{ Input: MyCustomInput }}>
  <FormFields.TextField label="Name" value={v} onChange={setV} />
</UIProvider>
```
