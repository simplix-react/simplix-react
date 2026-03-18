[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / withOverride

# Function: withOverride()

> **withOverride**\<`P`\>(`Component`, `defaultProps`): `ComponentType`\<`P`\>

Defined in: [packages/ui/src/provider/override-utils.ts:18](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/provider/override-utils.ts#L18)

Creates a wrapped version of a component with default props/className.

Use with [createOverrides](createOverrides.md) to build override maps:
```tsx
import { createOverrides, withOverride } from "@simplix-react/ui";

const overrides = createOverrides((defaults) => ({
  Button: withOverride(defaults.Button, { className: "rounded-full" }),
  Input: withOverride(defaults.Input, { className: "h-12 text-lg" }),
}));
```

## Type Parameters

### P

`P` *extends* `object`

## Parameters

### Component

`ComponentType`\<`P`\>

### defaultProps

`Partial`\<`P`\>

## Returns

`ComponentType`\<`P`\>
