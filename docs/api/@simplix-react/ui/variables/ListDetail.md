[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetail

# Variable: ListDetail

> `const` **ListDetail**: *typeof* `ListDetailRoot` & `object`

Defined in: packages/ui/src/crud/patterns/list-detail.tsx:301

List-detail layout with two variants:
- `"panel"` (default): Side-by-side layout with draggable divider.
- `"dialog"`: List takes full width, detail opens in a modal dialog.

Sub-components: List, Detail, useListDetail.

## Type Declaration

### Detail

> **Detail**: `ForwardRefExoticComponent`\<`PanelProps` & `RefAttributes`\<`HTMLElement`\>\> = `DetailPanel`

### List

> **List**: `ForwardRefExoticComponent`\<`PanelProps` & `RefAttributes`\<`HTMLElement`\>\> = `ListPanel`

### useListDetail()

> **useListDetail**: () => `ListDetailContextValue`

#### Returns

`ListDetailContextValue`
