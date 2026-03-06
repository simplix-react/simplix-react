[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / UIProvider

# Function: UIProvider()

> **UIProvider**(`__namedParameters`): `Element`

Defined in: [packages/ui/src/provider/ui-provider.tsx:147](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L147)

Provides overridable base component implementations to the component tree.
Supports nesting for scoped overrides.

## Parameters

### \_\_namedParameters

[`UIProviderProps`](../interfaces/UIProviderProps.md)

## Returns

`Element`

## Example

```tsx
<UIProvider overrides={{ Button: MyButton, SectionShell: MySectionShell }}>
  <App />
</UIProvider>
```
