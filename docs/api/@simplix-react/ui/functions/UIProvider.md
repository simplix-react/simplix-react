[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProvider

# Function: UIProvider()

> **UIProvider**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/provider/ui-provider.tsx:76](https://github.com/simplix-react/simplix-react/blob/003caac4b599d994962dbe01fbd34d6c7e7deda6/packages/ui/src/provider/ui-provider.tsx#L76)

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
