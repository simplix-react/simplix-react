[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / createOverrides

# Function: createOverrides()

> **createOverrides**(`factory`): `Partial`\<[`UIComponents`](../interfaces/UIComponents.md)\>

Defined in: [packages/ui/src/provider/ui-provider.tsx:318](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/ui-provider.tsx#L318)

Creates a type-safe override map, optionally wrapping/extending defaults.

## Parameters

### factory

(`defaults`) => `Partial`\<[`UIComponents`](../interfaces/UIComponents.md)\>

## Returns

`Partial`\<[`UIComponents`](../interfaces/UIComponents.md)\>

## Example

```tsx
const overrides = createOverrides((defaults) => ({
  Button: withOverride(defaults.Button, { className: "rounded-full" }),
  Dialog: { Content: MyDialogContent },
}));

<UIProvider overrides={overrides}><App /></UIProvider>
```
