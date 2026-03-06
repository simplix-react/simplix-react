[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / cn

# Function: cn()

> **cn**(...`inputs`): `string`

Defined in: [packages/ui/src/utils/cn.ts:20](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/utils/cn.ts#L20)

Merge class names with Tailwind CSS conflict resolution.

## Parameters

### inputs

...`ClassValue`[]

Class values (strings, arrays, objects, or falsy values).

## Returns

`string`

Merged class name string.

## Remarks

Combines `clsx` for conditional classes with `tailwind-merge`
for deduplicating and resolving Tailwind utility conflicts.

## Example

```ts
cn("px-2 py-1", isActive && "bg-primary", className);
// → "px-2 py-1 bg-primary ..."
```
