[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProvider

# Function: UIProvider()

> **UIProvider**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/provider/ui-provider.tsx:76](https://github.com/simplix-react/simplix-react/blob/27627ea75dc186c7030069980bcf62e25a2ccd38/packages/ui/src/provider/ui-provider.tsx#L76)

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
