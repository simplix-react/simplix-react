[**Documentation**](../../../README.md)

***

[Documentation](../../../README.md) / [@simplix-react/ui](../README.md) / ListDetail

# Variable: ListDetail

> `const` **ListDetail**: *typeof* [`ListDetailRoot`](../functions/ListDetailRoot.md) & `object`

Defined in: [packages/ui/src/crud/patterns/list-detail.tsx:301](https://github.com/simplix-react/simplix-react/blob/main/packages/ui/src/crud/patterns/list-detail.tsx#L301)

List-detail layout with two variants:
- `"panel"` (default): Side-by-side layout with draggable divider.
- `"dialog"`: List takes full width, detail opens in a modal dialog.

Sub-components: List, Detail, useListDetail.

## Type Declaration

### Detail

> **Detail**: `ForwardRefExoticComponent`\<[`ListDetailPanelProps`](../interfaces/ListDetailPanelProps.md) & `RefAttributes`\<`HTMLElement`\>\> = `DetailPanel`

### List

> **List**: `ForwardRefExoticComponent`\<[`ListDetailPanelProps`](../interfaces/ListDetailPanelProps.md) & `RefAttributes`\<`HTMLElement`\>\> = `ListPanel`

### useListDetail()

> **useListDetail**: () => [`ListDetailContextValue`](../interfaces/ListDetailContextValue.md)

#### Returns

[`ListDetailContextValue`](../interfaces/ListDetailContextValue.md)
